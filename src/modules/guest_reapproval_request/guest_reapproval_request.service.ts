import { Transaction } from "sequelize";
import { sequelize } from "../../config/db";
import GuestReapprovalRequest from "./guest_reapproval_request.model";
import Guest from "../guest/guest.model";
import User from "../users/user.model";
import Interview from "../interview/interview.model";
import Media from "../media/media.model";
import PermissionSettings from "../settings/permission_settings/permission_set.model";
import ApiError from "../../middleware/error-handlers/ApiError";
import eventBus from "../../events/eventBus";
import { EVENTS } from "../../events/events.constants";

const REVIEW_INCLUDE = [
  {
    model: Guest,
    as: "guest",
    include: [
      {
        model: Media,
        as: "profileImage",
        attributes: ["id", "media_name", "path", "type", "tag_id"],
      },
    ],
  },
  { model: User, as: "requester", attributes: ["id", "full_name", "email"] },
  { model: User, as: "proposedHost", attributes: ["id", "full_name"] },
  { model: User, as: "reviewer", attributes: ["id", "full_name"] },
  { model: Interview, as: "interview" },
];

// Mirrors GuestService.approveGuest/rejectGuest's permission check
// (same "guest_approver" PermissionSettings list), with an added Admin
// bypass — guest.service.ts's version doesn't special-case Admin today,
// which looks like a latent gap there too; worth aligning both later.
async function assertCanReview(reviewer: any): Promise<void> {
  const isAdmin = reviewer?.roles?.some((r: any) => r.role_name === "Admin");
  if (isAdmin) return;

  const permission = await PermissionSettings.findOne({
    where: { permission_type: "guest_approver" },
  });

  const allowedUserIds = permission?.user_ids ?? [];

  if (!allowedUserIds.includes(reviewer.id)) {
    throw new ApiError(
      403,
      "You are not allowed to review guest reapproval requests",
    );
  }
}

class GuestReapprovalRequestService {
  //--------------------------------
  // CREATE — explicit, user-confirmed request (modal "Request Access").
  // Detection (in guest/interview services) no longer auto-creates a
  // request; it only returns a 409 telling the frontend a modal is
  // needed. This is the endpoint that modal's confirm button calls.
  //--------------------------------
  static async createRequest(
    data: {
      guest_id: string;
      proposed_host_id?: string | null;
      interview_id?: string | null;
      trigger_source: "duplicate_guest_attempt" | "repeat_booking";
    },
    requester: any,
  ): Promise<GuestReapprovalRequest> {
    const guest = await Guest.findByPk(data.guest_id);
    if (!guest) throw new ApiError(404, "Guest not found");

    // Guard the repeat_booking path — anyone authenticated can hit this
    // endpoint, so re-verify the gate condition server-side rather than
    // trusting the client's claim that this guest needs re-approval.
    if (data.trigger_source === "repeat_booking") {
      if (guest.approved) {
        throw new ApiError(400, "Guest is already approved");
      }

      const priorPublished = await Interview.findOne({
        where: { guest_id: data.guest_id, status: "published" },
      });

      if (!priorPublished) {
        throw new ApiError(
          400,
          "Guest has no prior published interview requiring re-approval",
        );
      }
    }

    return this.findOrCreatePendingRequest(
      data.guest_id,
      requester.id,
      data.trigger_source,
      data.proposed_host_id,
    );
  }
  //--------------------------------
  // Internal: raise (or reuse) a pending request for a guest.
  // Scoped to (guest_id, status: pending) so repeated attempts against
  // an already-gated guest don't spawn duplicate queue entries — the
  // first attempt "owns" the open request, later ones just surface it.
  //--------------------------------
  private static async findOrCreatePendingRequest(
    guestId: string,
    requestedBy: string,
    triggerSource: "duplicate_guest_attempt" | "repeat_booking",
    proposedHostId?: string | null,
    transaction?: Transaction,
  ): Promise<GuestReapprovalRequest> {
    const [request, created] = await GuestReapprovalRequest.findOrCreate({
      where: { guest_id: guestId, status: "pending" },
      defaults: {
        guest_id: guestId,
        requested_by: requestedBy,
        proposed_host_id: proposedHostId ?? null,
        trigger_source: triggerSource,
        created_by: requestedBy,
        updated_by: requestedBy,
      },
      transaction,
    });

    // Only notify approvers the first time this guest gets gated —
    // repeated attempts against an already-open request just surface
    // the same row, no need to re-email.
    if (created) {
      // Revoke approval while the request is under review — this is
      // what makes the guest fall back into the approver queue's
      // "needs attention" state, and (via existing visibility rules)
      // stops it from being freely re-bookable until re-reviewed.
      await Guest.update(
        { approved: false, updated_by: requestedBy },
        { where: { id: guestId }, transaction },
      );
      const [guest, requester, proposedHost] = await Promise.all([
        Guest.findByPk(guestId, { transaction }),
        User.findByPk(requestedBy, { transaction }),
        proposedHostId
          ? User.findByPk(proposedHostId, { transaction })
          : Promise.resolve(null),
      ]);

      let guestImagePath: string | null = null;
      if (guest?.profile_image) {
        const media = await Media.findByPk(guest.profile_image, {
          transaction,
        });
        guestImagePath = media?.path ?? null;
      }

      eventBus.emit(EVENTS.GUEST_REAPPROVAL_REQUESTED, {
        requestId: request.id,
        guestId,
        guestName: guest?.full_name ?? "Unknown Guest",
        requestedByName: requester?.full_name ?? "Unknown User",
        triggerSource,
        proposedHostName: proposedHost?.full_name,
        guestImagePath,
      });
    }

    return request;
  }

  static async createDuplicateAttemptRequest(
    guestId: string,
    requestedBy: string,
    transaction?: Transaction,
  ): Promise<GuestReapprovalRequest> {
    return this.findOrCreatePendingRequest(
      guestId,
      requestedBy,
      "duplicate_guest_attempt",
      null,
      transaction,
    );
  }

  static async createRepeatBookingRequest(
    guestId: string,
    requestedBy: string,
    proposedHostId?: string | null,
    transaction?: Transaction,
  ): Promise<GuestReapprovalRequest> {
    return this.findOrCreatePendingRequest(
      guestId,
      requestedBy,
      "repeat_booking",
      proposedHostId,
      transaction,
    );
  }

  //--------------------------------
  // GET All (optionally filtered by status)
  //--------------------------------
  static async listRequests(
    requester: any,
    status?: "pending" | "approved" | "rejected",
  ): Promise<GuestReapprovalRequest[]> {
    await assertCanReview(requester);

    return GuestReapprovalRequest.findAll({
      where: status ? { status } : {},
      order: [["created_at", "DESC"]],
      include: REVIEW_INCLUDE,
    });
  }

  //--------------------------------
  // GET by ID
  //--------------------------------
  static async getRequestById(
    id: string,
    requester: any,
  ): Promise<GuestReapprovalRequest> {
    await assertCanReview(requester);

    const request = await GuestReapprovalRequest.findByPk(id, {
      include: REVIEW_INCLUDE,
    });

    if (!request) throw new ApiError(404, "Reapproval request not found");
    return request;
  }

  //--------------------------------
  // APPROVE — flips Guest.approved back to true (single source of
  // truth), and closes out the queue entry alongside it.
  //--------------------------------
  static async approveRequest(
    id: string,
    reviewer: any,
    reviewNote?: string | null,
  ): Promise<GuestReapprovalRequest> {
    await assertCanReview(reviewer);

    const transaction = await sequelize.transaction();

    try {
      const request = await GuestReapprovalRequest.findByPk(id, {
        transaction,
      });
      if (!request) throw new ApiError(404, "Reapproval request not found");

      if (request.status !== "pending") {
        throw new ApiError(400, `Request already ${request.status}`);
      }

      const guest = await Guest.findByPk(request.guest_id, { transaction });
      if (!guest) throw new ApiError(404, "Guest not found");

      // Reassigning host_id (when a host was proposed) is what actually
      // makes the guest visible to that host — Guest.host_id is treated
      // as a bonus assignment grant in buildGuestVisibilityWhere,
      // bypassing the requester's time-based visibility window entirely.
      // Without this, approving the request flips `approved` but the
      // guest could still be invisible to the very host who requested it.
      await guest.update(
        {
          approved: true,
          approved_by: reviewer.id,
          updated_by: reviewer.id,
          ...(request.proposed_host_id
            ? { host_id: request.proposed_host_id }
            : {}),
        },
        { transaction },
      );

      await request.update(
        {
          status: "approved",
          reviewed_by: reviewer.id,
          reviewed_at: new Date(),
          review_note: reviewNote ?? null,
          updated_by: reviewer.id,
        },
        { transaction },
      );

      await transaction.commit();
      const requester = await User.findByPk(request.requested_by);

      let guestImagePath: string | null = null;
      if (guest.profile_image) {
        const media = await Media.findByPk(guest.profile_image);
        guestImagePath = media?.path ?? null;
      }
      eventBus.emit(EVENTS.GUEST_REAPPROVED, {
        guestId: guest.id,
        guestName: guest.full_name,
        reviewerName: reviewer.full_name,
        requestId: request.id,
        requesterEmail: requester?.email,
        requesterName: requester?.full_name,
        guestImagePath,
      });

      return request;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
  //--------------------------------
  // REJECT — leaves Guest.approved false; a fresh request will
  // auto-open next time someone hits the gate for this guest.
  //--------------------------------
  static async rejectRequest(
    id: string,
    reviewer: any,
    reviewNote?: string | null,
  ): Promise<GuestReapprovalRequest> {
    await assertCanReview(reviewer);

    const transaction = await sequelize.transaction(); // ✅ wrap for atomicity with the guest update below

    try {
      const request = await GuestReapprovalRequest.findByPk(id, {
        transaction,
      });
      if (!request) throw new ApiError(404, "Reapproval request not found");

      if (request.status !== "pending") {
        throw new ApiError(400, `Request already ${request.status}`);
      }

      await request.update(
        {
          status: "rejected",
          reviewed_by: reviewer.id,
          reviewed_at: new Date(),
          review_note: reviewNote ?? null,
          updated_by: reviewer.id,
        },
        { transaction },
      );

      const guest = await Guest.findByPk(request.guest_id, { transaction });
      if (!guest) throw new ApiError(404, "Guest not found");

      // ✅ Mirrors guest.service.ts's rejectGuest: a reapproval rejection
      // is a real rejection, not just "still unapproved". Sets rejected
      // true and keeps approved false explicitly.
      await guest.update(
        {
          rejected: true,
          approved: false,
          approved_by: reviewer.id,
          updated_by: reviewer.id,
        },
        { transaction },
      );

      await transaction.commit();

      const requester = await User.findByPk(request.requested_by);

      let guestImagePath: string | null = null;
      if (guest.profile_image) {
        const media = await Media.findByPk(guest.profile_image);
        guestImagePath = media?.path ?? null;
      }

      eventBus.emit(EVENTS.GUEST_REAPPROVAL_REJECTED, {
        guestId: request.guest_id,
        guestName: guest.full_name,
        reviewerName: reviewer.full_name,
        requestId: request.id,
        requesterEmail: requester?.email,
        requesterName: requester?.full_name,
        guestImagePath,
      });

      return request;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  //--------------------------------
  // Read-only check: is there already an open request for this guest?
  // Used by the detect-only branches in guest.service.ts /
  // interview.service.ts to decide which 409 code to throw.
  //--------------------------------
  static async findPendingRequestForGuest(
    guestId: string,
  ): Promise<GuestReapprovalRequest | null> {
    return GuestReapprovalRequest.findOne({
      where: { guest_id: guestId, status: "pending" },
    });
  }
}

export default GuestReapprovalRequestService;
