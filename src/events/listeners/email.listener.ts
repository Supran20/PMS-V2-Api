import eventBus from "../eventBus";
import { EVENTS } from "../events.constants";

import LogService from "../../modules/log/log.service";
import User from "../../modules/users/user.model";
import Guest from "../../modules/guest/guest.model";
import Interview from "../../modules/interview/interview.model";
import Studio from "../../modules/studio/studio.model";
import PermissionSettings from "../../modules/settings/permission_settings/permission_set.model";

import {
  sendEmail,
  generateGuestApprovalEmailHtml,
  generateGuestStatusEmailHtml,
  generateInterviewEmailHtml,
  generateGuestReapprovalRequestEmailHtml,
  generateGuestInterviewEmailHtml,
  generateGuestPublishedEmailHtml,
} from "../../services/email.service";

// ========================================
// GUEST CREATED → Notify Approvers
// ========================================
eventBus.on(EVENTS.GUEST_CREATED, async (payload: any) => {
  try {
    const { guestId, guestName, creatorName } = payload;

    // Fetch guest with relations
    const guest = await Guest.findByPk(guestId, {
      include: [
        { model: User, as: "referrer", attributes: ["full_name"] },
        { model: User, as: "host", attributes: ["full_name"] },
      ],
    });

    if (!guest) return;

    const referredByName = (guest as any).referrer?.full_name ?? "N/A";
    const hostName = (guest as any).host?.full_name ?? "N/A";

    // Get approvers
    const permission = await PermissionSettings.findOne({
      where: { permission_type: "guest_approver" },
    });

    if (!permission || !permission.user_ids?.length) return;

    const approvers = await User.findAll({
      where: { id: permission.user_ids },
      attributes: ["id", "full_name", "email"],
    });

    for (const approver of approvers) {
      if (!approver.email) continue;

      // 🔹 Create log (pending)
      const log = await LogService.createLog({
        event_type: "guest.created",
        recipient_email: approver.email,
        status: "pending",
      });

      try {
        const html = await generateGuestApprovalEmailHtml(
          guestName,
          referredByName,
          guest.designation ?? undefined,
          hostName,
          creatorName,
        );

        await sendEmail({
          to: approver.email,
          subject: `Guest Approval Requested - ${guestName}`,
          text: `A new guest "${guestName}" requires approval.`,
          html,
          //   cc: ["harikrishna@broadwayinfosys.com", "think4victory@gmail.com"],
          //   replyTo: "harikrishna@broadwayinfosys.com",
        });

        // ✅ Mark success
        await LogService.markAsSent(log.id);
      } catch (error: any) {
        // ❌ Mark failed
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_CREATED):", error);
  }
});

// ========================================
// GUEST APPROVED → Notify Host
// ========================================
eventBus.on(EVENTS.GUEST_APPROVED, async (payload: any) => {
  try {
    const { guestName, hostEmail, hostName, approverName } = payload;

    if (!hostEmail) return;

    const log = await LogService.createLog({
      event_type: "guest.approved",
      recipient_email: hostEmail,
      status: "pending",
    });

    try {
      const html = await generateGuestStatusEmailHtml(
        hostName,
        guestName,
        "approved",
        approverName,
      );

      await sendEmail({
        to: hostEmail,
        subject: `Guest Approved - ${guestName}`,
        text: `Your guest "${guestName}" has been approved.`,
        html,
      });

      await LogService.markAsSent(log.id);
    } catch (error: any) {
      await LogService.markAsFailed(log.id, error);
    }
  } catch (error) {
    console.error("Listener error (GUEST_APPROVED):", error);
  }
});

// ========================================
// GUEST REJECTED → Notify Host
// ========================================
eventBus.on(EVENTS.GUEST_REJECTED, async (payload: any) => {
  try {
    const { guestName, hostEmail, hostName, approverName } = payload;

    if (!hostEmail) return;

    const log = await LogService.createLog({
      event_type: "guest.rejected",
      recipient_email: hostEmail,
      status: "pending",
    });

    try {
      const html = await generateGuestStatusEmailHtml(
        hostName,
        guestName,
        "rejected",
        approverName,
      );

      await sendEmail({
        to: hostEmail,
        subject: `Guest Rejected - ${guestName}`,
        text: `Your guest "${guestName}" has been rejected.`,
        html,
      });

      await LogService.markAsSent(log.id);
    } catch (error: any) {
      await LogService.markAsFailed(log.id, error);
    }
  } catch (error) {
    console.error("Listener error (GUEST_REJECTED):", error);
  }
});

// ========================================
// INTERVIEW CREATED → Notify Host (+CC) and Guest
// ========================================
eventBus.on(EVENTS.INTERVIEW_CREATED, async (payload: any) => {
  try {
    const {
      guestName,
      guestEmail,
      hostEmail,
      hostName,
      studioName,
      interviewDate,
      startTime,
      endTime,
      ccEmails, // ← resolved per-interview in interview.service.ts (cc_user_ids)
      creatorId,
    } = payload;

    // Host + CC notification
    if (hostEmail) {
      const log = await LogService.createLog({
        event_type: "interview.created",
        recipient_email: hostEmail,
        status: "pending",
        created_by: creatorId,
      });

      try {
        const html = await generateInterviewEmailHtml(
          "New Interview Assigned",
          hostName,
          guestName,
          String(interviewDate ?? ""),
          startTime ?? "",
          endTime ?? "",
          studioName,
        );

        await sendEmail({
          to: hostEmail,
          subject: `New Interview Assigned - ${guestName}`,
          text: `You have a new interview scheduled with ${guestName}`,
          html,
          cc: ccEmails,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }

    // ========================================
    // Guest notification — separate template, own log entry.
    // Runs independently: failure here must never affect the
    // host/cc send above, and vice versa.
    // ========================================
    if (guestEmail) {
      const guestLog = await LogService.createLog({
        event_type: "interview.guest_notified",
        recipient_email: guestEmail,
        status: "pending",
        created_by: creatorId,
      });

      try {
        const guestHtml = await generateGuestInterviewEmailHtml(
          guestName,
          hostName,
          String(interviewDate ?? ""),
          startTime ?? "",
          endTime ?? "",
          studioName,
        );

        await sendEmail({
          to: guestEmail,
          subject: `You're Confirmed - Real Story Time Interview`,
          text: `Hi ${guestName}, you're confirmed for your interview with Real Story Time.`,
          html: guestHtml,
        });

        await LogService.markAsSent(guestLog.id);
      } catch (error: any) {
        await LogService.markAsFailed(guestLog.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (INTERVIEW_CREATED):", error);
  }
});

// ========================================
// INTERVIEW PUBLISHED → Notify Guest and CC
// ========================================
eventBus.on(EVENTS.INTERVIEW_PUBLISHED, async (payload: any) => {
  try {
    const {
      guestName,
      guestEmail,
      hostName,
      studioName,
      episode,
      youtubeLink,
      ccEmails, // ← resolved per-interview in interview.service.ts (cc_user_ids)
      triggeredBy,
    } = payload;

    // Guest notification
    if (guestEmail) {
      const guestLog = await LogService.createLog({
        event_type: "interview.guest_published_notified",
        recipient_email: guestEmail,
        status: "pending",
        created_by: triggeredBy,
      });

      try {
        const guestHtml = await generateGuestPublishedEmailHtml(
          guestName,
          hostName,
          episode,
          youtubeLink,
        );

        await sendEmail({
          to: guestEmail,
          subject: `Your Episode Is Live — Real Story Time`,
          text: `Hi ${guestName}, your interview with Real Story Time has been published. Please take a moment to review it.`,
          html: guestHtml,
        });

        await LogService.markAsSent(guestLog.id);
      } catch (error: any) {
        await LogService.markAsFailed(guestLog.id, error);
      }
    }

    // Internal CC notification — independent of the guest send above
    if (ccEmails?.length) {
      const ccLog = await LogService.createLog({
        event_type: "interview.published_cc_notified",
        recipient_email: ccEmails.join(", "),
        status: "pending",
        created_by: triggeredBy,
      });

      try {
        await sendEmail({
          to: ccEmails[0],
          cc: ccEmails.slice(1),
          subject: `Episode Published${episode ? ` — Episode ${episode}` : ""}`,
          text: `${guestName}'s interview with ${hostName} (Studio: ${studioName}) has been published.${
            youtubeLink ? ` Link: ${youtubeLink}` : ""
          }`,
        });

        await LogService.markAsSent(ccLog.id);
      } catch (error: any) {
        await LogService.markAsFailed(ccLog.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (INTERVIEW_PUBLISHED):", error);
  }
});

// ========================================
// GUEST REAPPROVAL REQUESTED → Notify Approvers
// ========================================
eventBus.on(EVENTS.GUEST_REAPPROVAL_REQUESTED, async (payload: any) => {
  try {
    const { guestName, requestedByName, triggerSource, proposedHostName } =
      payload;

    const permission = await PermissionSettings.findOne({
      where: { permission_type: "guest_approver" },
    });

    if (!permission || !permission.user_ids?.length) return;

    const approvers = await User.findAll({
      where: { id: permission.user_ids },
      attributes: ["id", "full_name", "email"],
    });

    for (const approver of approvers) {
      if (!approver.email) continue;

      const log = await LogService.createLog({
        event_type: "guest.reapproval_requested",
        recipient_email: approver.email,
        status: "pending",
      });

      try {
        const html = await generateGuestReapprovalRequestEmailHtml(
          guestName,
          requestedByName,
          triggerSource,
          proposedHostName,
        );

        await sendEmail({
          to: approver.email,
          subject: `Guest Re-approval Requested - ${guestName}`,
          text: `Guest "${guestName}" requires re-approval before further booking.`,
          html,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_REAPPROVAL_REQUESTED):", error);
  }
});

// ========================================
// GUEST REAPPROVED → Notify Requester
// ========================================
eventBus.on(EVENTS.GUEST_REAPPROVED, async (payload: any) => {
  try {
    const { guestName, reviewerName, requesterEmail, requesterName } = payload;

    if (!requesterEmail) return;

    const log = await LogService.createLog({
      event_type: "guest.reapproved",
      recipient_email: requesterEmail,
      status: "pending",
    });

    try {
      const html = await generateGuestStatusEmailHtml(
        requesterName ?? "there",
        guestName,
        "approved",
        reviewerName,
      );

      await sendEmail({
        to: requesterEmail,
        subject: `Guest Re-approved - ${guestName}`,
        text: `"${guestName}" has been re-approved and can now be booked.`,
        html,
      });

      await LogService.markAsSent(log.id);
    } catch (error: any) {
      await LogService.markAsFailed(log.id, error);
    }
  } catch (error) {
    console.error("Listener error (GUEST_REAPPROVED):", error);
  }
});

// ========================================
// GUEST REAPPROVAL REJECTED → Notify Requester
// ========================================
eventBus.on(EVENTS.GUEST_REAPPROVAL_REJECTED, async (payload: any) => {
  try {
    const { guestName, reviewerName, requesterEmail, requesterName } = payload;

    if (!requesterEmail) return;

    const log = await LogService.createLog({
      event_type: "guest.reapproval_rejected",
      recipient_email: requesterEmail,
      status: "pending",
    });

    try {
      const html = await generateGuestStatusEmailHtml(
        requesterName ?? "there",
        guestName,
        "rejected",
        reviewerName,
      );

      await sendEmail({
        to: requesterEmail,
        subject: `Guest Re-approval Rejected - ${guestName}`,
        text: `Your request to book "${guestName}" again was not approved.`,
        html,
      });

      await LogService.markAsSent(log.id);
    } catch (error: any) {
      await LogService.markAsFailed(log.id, error);
    }
  } catch (error) {
    console.error("Listener error (GUEST_REAPPROVAL_REJECTED):", error);
  }
});
