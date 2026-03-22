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
import { sendEmail } from "../../services/email.service";
import Media from "../media/media.model";
import { generateInterviewEmailHtml } from "../../services/email.service";
import eventBus from "../../events/eventBus";
import { EVENTS } from "../../events/events.constants";

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

      await transaction.commit();

      eventBus.emit(EVENTS.INTERVIEW_CREATED, {
        interviewId: interview.id,
        guestId: guest.id,
        guestName: guest.full_name,
        hostId: host.id,
        hostEmail: host.email,
        hostName: host.full_name,
        studioName: studio.studio_name,
        interviewDate: data.interview_date,
        startTime: data.start_time,
        endTime: end_time,
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
  static async getAll(): Promise<Interview[]> {
    return await Interview.findAll({
      order: [["episode", "DESC"]],
      include: [
        {
          model: Guest,
          as: "guest",
          attributes: ["id", "full_name", "email", "slug"],

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
  }

  //--------------------------------
  // GET BY ID
  //--------------------------------
  static async getById(id: string): Promise<Interview> {
    const interview = await Interview.findByPk(id);
    if (!interview) throw new ApiError(404, "Interview not found");
    return interview;
  }

  //--------------------------------
  // REORDER (DnD)
  //--------------------------------
  static async reorderInterviews(
    orderedIds: string[],
    updaterId: string,
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      const total = orderedIds.length;

      for (let index = 0; index < total; index++) {
        await Interview.update(
          {
            priority: total - index,
            updated_by: updaterId,
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

  //Reorder episode
  static async assignEpisode(
    interviewId: string,
    targetEpisode: number,
    updaterId: string,
  ): Promise<void> {
    const transaction = await sequelize.transaction();

    try {
      await this.reorderEpisodes(
        interviewId,
        targetEpisode,
        updaterId,
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
    updaterId: string,
  ): Promise<Interview> {
    const transaction = await sequelize.transaction();

    try {
      const interview = await Interview.findByPk(id, { transaction });
      if (!interview) throw new ApiError(404, "Interview not found");
      if (
        interview.status === "published" &&
        data.episode &&
        data.episode !== interview.episode
      ) {
        throw new ApiError(400, "Published interviews cannot change episode");
      }

      if (data.episode && data.episode !== interview.episode) {
        await this.reorderEpisodes(id, data.episode, updaterId, transaction);

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
          updated_by: updaterId,
        },
        { transaction },
      );

      await transaction.commit();
      await interview.reload();

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
  static async deleteInterview(id: string): Promise<void> {
    const interview = await Interview.findByPk(id);
    if (!interview) throw new ApiError(404, "Interview not found");
    await interview.destroy();
  }
}

export default InterviewService;
