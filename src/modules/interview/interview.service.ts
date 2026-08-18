import { Op, Transaction } from "sequelize";
import { sequelize } from "../../config/db";
import Interview from "./interview.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import {
  InterviewAttributes,
  InterviewCreationAttributes,
} from "./interview.interface";
import Guest from "../guest/guest.model";
import User from "../users/user.model";
import Studio from "../studio/studio.model";
import Media from "../media/media.model";
import eventBus from "../../events/eventBus";
import { EVENTS } from "../../events/events.constants";
import GuestReapprovalRequestService from "../guest_reapproval_request/guest_reapproval_request.service";

// Resolves an interview's cc_user_ids into email addresses.
async function resolveCcEmails(
  ccUserIds: string[] | null | undefined,
  transaction: Transaction,
): Promise<string[]> {
  if (!ccUserIds?.length) return [];

  const ccUsers = await User.findAll({
    where: { id: { [Op.in]: ccUserIds } },
    attributes: ["id", "email"],
    transaction,
  });

  return ccUsers.map((u) => u.email).filter((e): e is string => Boolean(e));
}

async function resolveBccEmails(
  bccUserIds: string[] | null | undefined,
  transaction: Transaction,
): Promise<string[]> {
  if (!bccUserIds?.length) return [];

  const bccUsers = await User.findAll({
    where: { id: { [Op.in]: bccUserIds } },
    attributes: ["id", "email"],
    transaction,
  });

  return bccUsers.map((u) => u.email).filter((e): e is string => Boolean(e));
}

class InterviewService {
  //--------------------------------
  // Helper: Convert date + time to JS Date
  //--------------------------------
  private static combineDateTime(date: string, time: string): Date {
    return new Date(`${date}T${time}`);
  }

  //--------------------------------
  // Helper: Add 3 hours
  //--------------------------------
  private static addThreeHours(date: Date): Date {
    const newDate = new Date(date);
    newDate.setHours(newDate.getHours() + 3);
    return newDate;
  }

  //--------------------------------
  // Helper: Check Overlap
  //--------------------------------
  private static async checkOverlap(
    data: {
      guest_id: string;
      host_id: string;
      studio_id: string;
      interview_date: string;
      start_time: string;
      end_time: string;
    },
    transaction: Transaction,
    excludeId?: string,
  ) {
    const {
      guest_id,
      host_id,
      studio_id,
      interview_date,
      start_time,
      end_time,
    } = data;

    const whereCondition: any = {
      interview_date,
      [Op.or]: [{ guest_id }, { host_id }, { studio_id }],
      start_time: { [Op.lt]: end_time },
      end_time: { [Op.gt]: start_time },
    };

    if (excludeId) {
      whereCondition.id = { [Op.ne]: excludeId };
    }

    const conflict = await Interview.findOne({
      where: whereCondition,
      transaction,
    });

    if (conflict) {
      if (conflict.guest_id === guest_id)
        throw new ApiError(400, "Guest is already booked during this time");

      if (conflict.host_id === host_id)
        throw new ApiError(
          400,
          "Host is already assigned to another interview during this time",
        );

      if (conflict.studio_id === studio_id)
        throw new ApiError(400, "Studio is already reserved during this time");
    }
  }

  //--------------------------------
  // Auto reorder episodes (safe)
  //--------------------------------
  private static async reorderEpisodes(
    interviewId: string,
    newEpisode: number,
    updaterId: string,
    transaction: Transaction,
  ) {
    const interview = await Interview.findByPk(interviewId, { transaction });

    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    const currentEpisode = interview.episode;

    if (currentEpisode === newEpisode) return;

    if (interview.status === "published") {
      throw new ApiError(400, "Published interview cannot be reordered");
    }

    const targetConflict = await Interview.findOne({
      where: {
        episode: newEpisode,
        status: "published",
      },
      transaction,
    });

    if (targetConflict) {
      throw new ApiError(
        400,
        "Cannot move to a position occupied by a published interview",
      );
    }

    //--------------------------------
    // STEP 1: TEMP MOVE (avoid conflict)
    //--------------------------------
    await interview.update({ episode: 0 }, { transaction });

    //--------------------------------
    // STEP 2: SHIFT OTHERS
    //--------------------------------
    if (newEpisode > currentEpisode) {
      await Interview.decrement(
        { episode: 1 },
        {
          where: {
            episode: {
              [Op.gt]: currentEpisode,
              [Op.lte]: newEpisode,
            },
            status: { [Op.ne]: "published" },
          },
          transaction,
        },
      );
    } else {
      await Interview.increment(
        { episode: 1 },
        {
          where: {
            episode: {
              [Op.gte]: newEpisode,
              [Op.lt]: currentEpisode,
            },
            status: { [Op.ne]: "published" },
          },
          transaction,
        },
      );
    }

    //--------------------------------
    // STEP 3: PLACE FINAL
    //--------------------------------
    await interview.update(
      {
        episode: newEpisode,
        updated_by: updaterId,
      },
      { transaction },
    );
  }

  //--------------------------------
  // CREATE Interview
  //--------------------------------
  static async createInterview(
    data: InterviewCreationAttributes,
    creatorId: string,
  ): Promise<Interview> {
    const transaction = await sequelize.transaction();

    try {
      let end_time: string | undefined = data.end_time ?? undefined;

      // Auto-calculate end_time if not provided
      if (!end_time && data.start_time && data.interview_date) {
        const startDate = this.combineDateTime(
          String(data.interview_date),
          data.start_time,
        );
        const calculatedEnd = this.addThreeHours(startDate);
        end_time = calculatedEnd.toTimeString().split(" ")[0];
      }

      // Validate time order
      if (end_time && data.start_time && end_time <= data.start_time) {
        throw new ApiError(400, "End time must be after start time");
      }

      // Fetch guest first
      const guest = await Guest.findByPk(data.guest_id, { transaction });

      if (!guest) {
        throw new ApiError(400, "Guest not found");
      }

      // --------------------------------
      // Repeat-booking gate: if this guest already has a published
      // interview, they can only be booked again while Guest.approved
      // is true.
      // --------------------------------
      const priorPublishedInterview = await Interview.findOne({
        where: { guest_id: data.guest_id, status: "published" },
        transaction,
      });

      if (priorPublishedInterview && !guest.approved) {
        const pendingRequest =
          await GuestReapprovalRequestService.findPendingRequestForGuest(
            guest.id,
          );

        const error: any = pendingRequest
          ? new ApiError(
              409,
              "This guest requires re-approval and a request is already under review.",
            )
          : new ApiError(
              409,
              "This guest has a prior published interview and requires re-approval before being booked again.",
            );

        error.code = pendingRequest
          ? "GUEST_REQUIRES_REAPPROVAL_PENDING"
          : "GUEST_REQUIRES_REAPPROVAL_NEW";
        error.guestId = guest.id;
        if (pendingRequest) error.reapprovalRequestId = pendingRequest.id;

        throw error;
      }

      // Determine host (allow override)
      let hostId: string;

      if (data.host_id) {
        // If host is explicitly provided in request → use it
        hostId = data.host_id;
      } else if (guest.host_id) {
        // Otherwise fallback to guest's assigned host
        hostId = guest.host_id;
      } else {
        throw new ApiError(400, "Host is required for this guest");
      }

      // Overlap check
      if (data.start_time && end_time && data.interview_date) {
        await this.checkOverlap(
          {
            guest_id: data.guest_id,
            host_id: hostId,
            studio_id: data.studio_id,
            interview_date: data.interview_date,
            start_time: data.start_time,
            end_time,
          },
          transaction,
        );
      }

      const maxPriority = await Interview.max("priority", { transaction });
      const newPriority = ((maxPriority as number) || 0) + 1;

      const existingPublished = await Interview.findOne({
        where: {
          episode: data.episode,
          status: "published",
        },
        transaction,
      });

      if (existingPublished) {
        throw new ApiError(
          400,
          "Episode already used by a published interview",
        );
      }

      const interview = await Interview.create(
        {
          ...data,
          host_id: hostId,
          end_time,
          priority: newPriority,
          created_by: creatorId,
          updated_by: creatorId,
        },
        { transaction },
      );

      // Fetch host, guest and studio details
      const host = await User.findByPk(hostId, { transaction });
      const studio = await Studio.findByPk(data.studio_id, { transaction });

      if (!host || !guest || !studio) {
        throw new ApiError(400, "Invalid host, guest or studio");
      }

      const ccEmails = await resolveCcEmails(data.cc_user_ids, transaction);
      const bccEmails = await resolveBccEmails(data.bcc_user_ids, transaction);

      await transaction.commit();

      eventBus.emit(EVENTS.INTERVIEW_CREATED, {
        interviewId: interview.id,
        guestId: guest.id,
        guestName: guest.full_name,
        guestEmail: guest.email,
        hostId: host.id,
        hostEmail: host.email,
        hostName: host.full_name,
        studioName: studio.studio_name,
        interviewDate: data.interview_date,
        startTime: data.start_time,
        endTime: end_time,
        ccEmails,
        bccEmails,
        creatorId,
      });

      return interview;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // GET ALL
  //--------------------------------
  static async getAll(requester?: any): Promise<any[]> {
    const interviews = await Interview.findAll({
      order: [["episode", "DESC"]],
      include: [
        {
          model: Guest,
          as: "guest",
          attributes: [
            "id",
            "full_name",
            "email",
            "phone",
            "slug",
            "created_by",
            "host_id",
          ],
          include: [
            {
              model: Media,
              as: "profileImage",
              attributes: ["id", "media_name", "path", "type", "tag_id"],
            },
          ],
        },
        {
          model: User,
          as: "host",
          attributes: ["id", "full_name", "email"],
          include: [
            {
              model: Media,
              as: "profileImage",
              attributes: ["id", "media_name", "path", "type", "tag_id"],
            },
          ],
        },
        {
          model: Studio,
          as: "studio",
          attributes: ["id", "studio_name", "address"],
        },
      ],
    });

    return await Promise.all(
      interviews.map(async (interview) => {
        const ccUsers = await User.findAll({
          where: { id: interview.cc_user_ids ?? [] },
          attributes: ["id", "full_name", "email"],
        });

        const bccUsers = await User.findAll({
          where: { id: interview.bcc_user_ids ?? [] },
          attributes: ["id", "full_name", "email"],
        });

        return {
          ...interview.toJSON(),
          ccUsers,
          bccUsers,
        };
      }),
    );
  }

  //--------------------------------
  // GET BY ID
  //--------------------------------
  static async getById(id: string, requester?: any): Promise<any> {
    const interview = await Interview.findOne({
      where: { id },
      include: [
        { model: Guest, as: "guest" },
        { model: User, as: "host" },
        { model: Studio, as: "studio" },
      ],
    });

    if (!interview) {
      throw new ApiError(404, "Interview not found");
    }

    const ccUsers = await User.findAll({
      where: { id: interview.cc_user_ids ?? [] },
      attributes: ["id", "full_name", "email"],
    });

    const bccUsers = await User.findAll({
      where: { id: interview.bcc_user_ids ?? [] },
      attributes: ["id", "full_name", "email"],
    });

    return {
      ...interview.toJSON(),
      ccUsers,
      bccUsers,
    };
  }

  //--------------------------------
  // GET EPISODE META (unrestricted — no visibility filter)
  //--------------------------------
  static async getEpisodeMeta(): Promise<{
    maxEpisode: number;
    existingEpisodes: { id: string; episode: number; status: string }[];
  }> {
    const interviews = await Interview.findAll({
      attributes: ["id", "episode", "status"],
      order: [["episode", "DESC"]],
    });

    const existingEpisodes = interviews.map((i) => ({
      id: i.id,
      episode: i.episode,
      status: i.status,
    }));

    const maxEpisode = existingEpisodes.length
      ? Math.max(...existingEpisodes.map((e) => e.episode))
      : 0;

    return { maxEpisode, existingEpisodes };
  }

  //--------------------------------
  // REORDER (DnD) — bulk operation
  //--------------------------------
  static async reorderInterviews(
    orderedIds: string[],
    requester: any,
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const visibleCount = await Interview.count({
        where: { id: { [Op.in]: orderedIds } },
        transaction,
      });

      if (visibleCount !== orderedIds.length) {
        throw new ApiError(404, "One or more interviews not found");
      }

      const total = orderedIds.length;

      for (let index = 0; index < total; index++) {
        await Interview.update(
          {
            priority: total - index,
            updated_by: requester.id,
          },
          {
            where: { id: orderedIds[index] },
            transaction,
          },
        );
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // ASSIGN EPISODE
  //--------------------------------
  static async assignEpisode(
    interviewId: string,
    targetEpisode: number,
    requester: any,
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      await this.reorderEpisodes(
        interviewId,
        targetEpisode,
        requester.id,
        transaction,
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // UPDATE
  //--------------------------------
  static async updateInterview(
    id: string,
    data: Partial<InterviewAttributes>,
    requester: any,
  ): Promise<Interview> {
    const transaction = await sequelize.transaction();

    try {
      const interview = await Interview.findByPk(id, { transaction });

      if (!interview) {
        throw new ApiError(404, "Interview not found");
      }

      const wasPublished = interview.status === "published";

      if (
        interview.status === "published" &&
        data.episode &&
        data.episode !== interview.episode
      ) {
        throw new ApiError(400, "Published interviews cannot change episode");
      }

      if (data.episode && data.episode !== interview.episode) {
        await this.reorderEpisodes(
          id,
          data.episode,
          requester.id,
          transaction,
        );

        delete data.episode;
      }

      const updatedData = { ...interview.toJSON(), ...data };

      let end_time: string | null | undefined = updatedData.end_time;

      if (!end_time && updatedData.start_time && updatedData.interview_date) {
        const startDate = this.combineDateTime(
          String(updatedData.interview_date),
          updatedData.start_time,
        );
        const calculatedEnd = this.addThreeHours(startDate);
        end_time = calculatedEnd.toTimeString().split(" ")[0];
      }

      if (
        end_time &&
        updatedData.start_time &&
        end_time <= updatedData.start_time
      ) {
        throw new ApiError(400, "End time must be after start time");
      }

      if (updatedData.start_time && end_time && updatedData.interview_date) {
        await this.checkOverlap(
          {
            guest_id: updatedData.guest_id,
            host_id: updatedData.host_id,
            studio_id: updatedData.studio_id,
            interview_date: updatedData.interview_date,
            start_time: updatedData.start_time,
            end_time,
          },
          transaction,
          id,
        );
      }

      await interview.update(
        {
          ...data,
          end_time,
          updated_by: requester.id,
        },
        { transaction },
      );

      const justPublished = interview.status === "published" && !wasPublished;

      let guest: Guest | null = null;
      let host: User | null = null;
      let studio: Studio | null = null;
      let ccEmails: string[] = [];
      let bccEmails: string[] = [];

      if (justPublished) {
        guest = await Guest.findByPk(interview.guest_id, { transaction });
        host = await User.findByPk(interview.host_id, { transaction });
        studio = await Studio.findByPk(interview.studio_id, { transaction });

        ccEmails = await resolveCcEmails(interview.cc_user_ids, transaction);
        bccEmails = await resolveBccEmails(interview.bcc_user_ids, transaction);
      }

      await transaction.commit();
      await interview.reload();

      if (justPublished && guest && host && studio) {
        eventBus.emit(EVENTS.INTERVIEW_PUBLISHED, {
          interviewId: interview.id,
          guestId: guest.id,
          guestName: guest.full_name,
          guestEmail: guest.email,
          hostId: host.id,
          hostName: host.full_name,
          studioName: studio.studio_name,
          episode: interview.episode,
          youtubeLink: interview.youtube_link,
          ccEmails,
          bccEmails,
          triggeredBy: requester.id,
        });
      }

      return interview;
    } catch (error) {
      console.log(error);
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // DELETE
  //--------------------------------
  static async deleteInterview(id: string, requester: any): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const interview = await Interview.findByPk(id, { transaction });
      if (!interview) {
        throw new ApiError(404, "Interview not found");
      }
      await interview.destroy({ transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // RESHUFFLE EPISODES (fill gaps)
  //--------------------------------
  static async reshuffleEpisodes(updaterId: string): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const interviews = await Interview.findAll({
        order: [["episode", "ASC"]],
        transaction,
        lock: transaction.LOCK.UPDATE, // prevent race condition
      });

      const published = interviews.filter((i) => i.status === "published");
      const nonPublished = interviews.filter((i) => i.status !== "published");

      const reservedEpisodes = new Set(published.map((i) => i.episode));

      let currentEpisode = 1;

      for (const interview of nonPublished) {
        while (reservedEpisodes.has(currentEpisode)) {
          currentEpisode++;
        }

        if (interview.episode !== currentEpisode) {
          await interview.update(
            {
              episode: currentEpisode,
              updated_by: updaterId,
            },
            { transaction },
          );
        }

        currentEpisode++;
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

export default InterviewService;
