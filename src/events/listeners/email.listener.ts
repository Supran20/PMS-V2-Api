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
          cc: ["harikrishna@broadwayinfosys.com", "think4victory@gmail.com"],
          replyTo: "harikrishna@broadwayinfosys.com",
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
// INTERVIEW CREATED → Notify Host
// ========================================
eventBus.on(EVENTS.INTERVIEW_CREATED, async (payload: any) => {
  try {
    const {
      interviewId,
      guestName,
      hostEmail,
      hostName,
      studioName,
      interviewDate,
      startTime,
      endTime,
      creatorId,
    } = payload;

    if (!hostEmail) return;

    // 🔹 Create log (pending)
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
        cc: ["harikrishna@broadwayinfosys.com", "think4victory@gmail.com"],
        replyTo: "harikrishna@broadwayinfosys.com",
      });

      await LogService.markAsSent(log.id);
    } catch (error: any) {
      await LogService.markAsFailed(log.id, error);
    }
  } catch (error) {
    console.error("Listener error (INTERVIEW_CREATED):", error);
  }
});
