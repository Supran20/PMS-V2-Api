import eventBus from "../eventBus";
import { EVENTS } from "../events.constants";

import LogService from "../../modules/log/log.service";
import User from "../../modules/users/user.model";
import Role from "../../modules/roles/role.model";
import Guest from "../../modules/guest/guest.model";
import Interview from "../../modules/interview/interview.model";
import Studio from "../../modules/studio/studio.model";
import PermissionSettings from "../../modules/settings/permission_settings/permission_set.model";
import GuestReapprovalRequest from "../../modules/guest_reapproval_request/guest_reapproval_request.model";

import {
  sendEmail,
  generateGuestApprovalEmailHtml,
  generateGuestStatusEmailHtml,
  generateInterviewEmailHtml,
  generateGuestReapprovalRequestEmailHtml,
  generateGuestInterviewEmailHtml,
  generateGuestPublishedEmailHtml,
} from "../../services/email.service";

/**
 * Helper to fetch users who have the "Admin" role, excluding those with the "Super Admin" role.
 */
async function getAdminNotSuperAdminUsers(): Promise<User[]> {
  const users = await User.findAll({
    include: [
      {
        model: Role,
        as: "roles",
        attributes: ["id", "role_name"],
        through: { attributes: [] },
      },
    ],
    attributes: ["id", "full_name", "email"],
  });

  return users.filter((user) => {
    const roleNames = user.roles?.map((r) => r.role_name) ?? [];
    return roleNames.includes("Admin") && !roleNames.includes("Super Admin");
  });
}

// ========================================
// GUEST CREATED → Notify Admin (not Super Admin) & Assigned Host
// ========================================
eventBus.on(EVENTS.GUEST_CREATED, async (payload: any) => {
  try {
    const { guestId, guestName, creatorName, guestImagePath } = payload;

    const guest = await Guest.findByPk(guestId, {
      include: [
        { model: User, as: "referrer", attributes: ["full_name"] },
        { model: User, as: "host", attributes: ["id", "full_name", "email"] },
      ],
    });

    if (!guest) return;

    const referredByName = (guest as any).referrer?.full_name ?? "N/A";
    const hostName = (guest as any).host?.full_name ?? "N/A";

    const adminUsers = await getAdminNotSuperAdminUsers();

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    const host = (guest as any).host;
    if (host?.email) {
      recipientsMap.set(host.email.trim().toLowerCase(), {
        id: host.id,
        full_name: host.full_name,
        email: host.email.trim(),
      });
    }

    const recipients = Array.from(recipientsMap.values());
    if (!recipients.length) return;

    // 🔹 Resolve attachment ONCE per guest
    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const recipient of recipients) {
      const log = await LogService.createLog({
        event_type: "guest.created",
        recipient_email: recipient.email,
        status: "pending",
      });

      try {
        const html = await generateGuestApprovalEmailHtml(
          guestName,
          referredByName,
          guest.designation ?? undefined,
          hostName,
          creatorName,
          hasGuestImage,
        );

        await sendEmail({
          to: recipient.email,
          subject: `Guest Approval Requested - ${guestName}`,
          text: `A new guest "${guestName}" requires approval.`,
          html,
          attachments,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_CREATED):", error);
  }
});
// ========================================
// GUEST APPROVED → Notify Admin (not Super Admin) & Assigned Host
// ========================================
eventBus.on(EVENTS.GUEST_APPROVED, async (payload: any) => {
  try {
    const {
      guestId,
      guestName,
      hostId,
      hostEmail,
      hostName,
      approverName,
      guestImagePath,
    } = payload;

    const adminUsers = await getAdminNotSuperAdminUsers();

    let host = hostEmail
      ? { id: hostId, full_name: hostName, email: hostEmail }
      : null;

    if (!host && guestId) {
      const guest = await Guest.findByPk(guestId, {
        include: [
          { model: User, as: "host", attributes: ["id", "full_name", "email"] },
        ],
      });
      host = (guest as any)?.host;
    }

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    if (host?.email) {
      recipientsMap.set(host.email.trim().toLowerCase(), {
        id: host.id,
        full_name: host.full_name,
        email: host.email.trim(),
      });
    }

    const recipients = Array.from(recipientsMap.values());
    if (!recipients.length) return;

    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const recipient of recipients) {
      const log = await LogService.createLog({
        event_type: "guest.approved",
        recipient_email: recipient.email,
        status: "pending",
      });

      try {
        const html = await generateGuestStatusEmailHtml(
          recipient.full_name,
          guestName,
          "approved",
          approverName,
          hasGuestImage,
        );

        await sendEmail({
          to: recipient.email,
          subject: `Guest Approved - ${guestName}`,
          text: `Guest "${guestName}" has been approved.`,
          html,
          attachments,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_APPROVED):", error);
  }
});

// ========================================
// GUEST REJECTED → Notify Admin (not Super Admin) & Assigned Host
// ========================================
eventBus.on(EVENTS.GUEST_REJECTED, async (payload: any) => {
  try {
    const {
      guestId,
      guestName,
      hostId,
      hostEmail,
      hostName,
      approverName,
      guestImagePath,
    } = payload;

    const adminUsers = await getAdminNotSuperAdminUsers();

    let host = hostEmail
      ? { id: hostId, full_name: hostName, email: hostEmail }
      : null;

    if (!host && guestId) {
      const guest = await Guest.findByPk(guestId, {
        include: [
          { model: User, as: "host", attributes: ["id", "full_name", "email"] },
        ],
      });
      host = (guest as any)?.host;
    }

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    if (host?.email) {
      recipientsMap.set(host.email.trim().toLowerCase(), {
        id: host.id,
        full_name: host.full_name,
        email: host.email.trim(),
      });
    }

    const recipients = Array.from(recipientsMap.values());
    if (!recipients.length) return;

    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const recipient of recipients) {
      const log = await LogService.createLog({
        event_type: "guest.rejected",
        recipient_email: recipient.email,
        status: "pending",
      });

      try {
        const html = await generateGuestStatusEmailHtml(
          recipient.full_name,
          guestName,
          "rejected",
          approverName,
          hasGuestImage,
        );

        await sendEmail({
          to: recipient.email,
          subject: `Guest Rejected - ${guestName}`,
          text: `Guest "${guestName}" has been rejected.`,
          html,
          attachments,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_REJECTED):", error);
  }
});

// ========================================
// INTERVIEW CREATED → Notify Admin (not Super Admin), Host (+CC/BCC) and Guest
// ========================================
eventBus.on(EVENTS.INTERVIEW_CREATED, async (payload: any) => {
  try {
    const {
      guestName,
      guestEmail,
      hostId,
      hostEmail,
      hostName,
      studioName,
      interviewDate,
      startTime,
      endTime,
      ccEmails, // ← resolved per-interview in interview.service.ts (cc_user_ids)
      bccEmails,
      creatorId,
      guestImagePath,
    } = payload;

    // 1. Internal notification → Admin users (not Super Admin) & assigned Host
    const adminUsers = await getAdminNotSuperAdminUsers();

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    if (hostEmail) {
      recipientsMap.set(hostEmail.trim().toLowerCase(), {
        id: hostId ?? "",
        full_name: hostName ?? "Host",
        email: hostEmail.trim(),
      });
    }

    const internalRecipients = Array.from(recipientsMap.values());

    for (let i = 0; i < internalRecipients.length; i++) {
      const recipient = internalRecipients[i];
      const log = await LogService.createLog({
        event_type: "interview.created",
        recipient_email: recipient.email,
        status: "pending",
        created_by: creatorId,
      });

      try {
        const html = await generateInterviewEmailHtml(
          "New Interview Assigned",
          recipient.full_name,
          guestName,
          String(interviewDate ?? ""),
          startTime ?? "",
          endTime ?? "",
          studioName,
          hasGuestImage,
        );

        // Attach CC/BCC emails only on the host email (or first email send) to avoid duplicate CC/BCC deliveries
        const isHostRecipient =
          hostEmail &&
          recipient.email.toLowerCase() === hostEmail.trim().toLowerCase();
        const attachCcBcc = isHostRecipient || (i === 0 && !hostEmail);

        await sendEmail({
          to: recipient.email,
          subject: `New Interview Scheduled - ${guestName}`,
          text: `A new interview has been scheduled with ${guestName}`,
          html,
          cc: attachCcBcc ? ccEmails : undefined,
          bcc: attachCcBcc ? bccEmails : undefined,
          attachments,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }

    // 2. Guest notification — separate template (GuestInterviewEmail), own log entry.
    if (guestEmail) {
      const guestLog = await LogService.createLog({
        event_type: "interview.guest_notified",
        recipient_email: guestEmail.trim(),
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
          hasGuestImage,
        );

        await sendEmail({
          to: guestEmail.trim(),
          subject: `You're Confirmed - Real Story Time Interview`,
          text: `Hi ${guestName}, you're confirmed for your interview with Real Story Time.`,
          html: guestHtml,
          attachments,
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
      bccEmails,
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
    if (ccEmails?.length || bccEmails?.length) {
      const allInternalEmails = [...(ccEmails || []), ...(bccEmails || [])];
      const ccLog = await LogService.createLog({
        event_type: "interview.published_cc_notified",
        recipient_email: allInternalEmails.join(", "),
        status: "pending",
        created_by: triggeredBy,
      });

      try {
        await sendEmail({
          to: ccEmails?.length ? ccEmails[0] : bccEmails[0],
          cc: ccEmails?.length ? ccEmails.slice(1) : undefined,
          bcc: ccEmails?.length ? bccEmails : bccEmails.slice(1),
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
// GUEST REAPPROVAL REQUESTED → Notify Admin (not Super Admin) & Assigned Host
// ========================================
eventBus.on(EVENTS.GUEST_REAPPROVAL_REQUESTED, async (payload: any) => {
  try {
    const {
      guestName,
      requestedByName,
      triggerSource,
      proposedHostName,
      requestId,
      guestId,
      guestImagePath,
    } = payload;

    const adminUsers = await getAdminNotSuperAdminUsers();

    const request: any = requestId
      ? await GuestReapprovalRequest.findByPk(requestId, {
          include: [
            {
              model: User,
              as: "proposedHost",
              attributes: ["id", "full_name", "email"],
            },
            {
              model: Guest,
              as: "guest",
              include: [
                {
                  model: User,
                  as: "host",
                  attributes: ["id", "full_name", "email"],
                },
              ],
            },
          ],
        })
      : null;

    let host = request?.proposedHost || request?.guest?.host;

    if (!host && guestId) {
      const guest = await Guest.findByPk(guestId, {
        include: [
          { model: User, as: "host", attributes: ["id", "full_name", "email"] },
        ],
      });
      host = (guest as any)?.host;
    }

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    if (host?.email) {
      recipientsMap.set(host.email.trim().toLowerCase(), {
        id: host.id,
        full_name: host.full_name,
        email: host.email.trim(),
      });
    }

    const recipients = Array.from(recipientsMap.values());
    if (!recipients.length) return;

    for (const recipient of recipients) {
      const log = await LogService.createLog({
        event_type: "guest.reapproval_requested",
        recipient_email: recipient.email,
        status: "pending",
      });

      try {
        const html = await generateGuestReapprovalRequestEmailHtml(
          guestName,
          requestedByName,
          triggerSource,
          proposedHostName,
          hasGuestImage,
        );

        await sendEmail({
          to: recipient.email,
          subject: `Guest Re-approval Requested - ${guestName}`,
          text: `Guest "${guestName}" requires re-approval before further booking.`,
          html,
          attachments,
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
// GUEST REAPPROVED → Notify Admin (not Super Admin), Assigned Host & Requester
// ========================================
eventBus.on(EVENTS.GUEST_REAPPROVED, async (payload: any) => {
  try {
    const {
      guestId,
      guestName,
      reviewerName,
      requesterEmail,
      requesterName,
      proposedHostId,
      guestHostId,
      guestImagePath,
    } = payload;

    const adminUsers = await getAdminNotSuperAdminUsers();

    let hostUser: any = null;
    const targetHostId = proposedHostId || guestHostId;
    if (targetHostId) {
      hostUser = await User.findByPk(targetHostId, {
        attributes: ["id", "full_name", "email"],
      });
    } else if (guestId) {
      const guest = await Guest.findByPk(guestId, {
        include: [
          { model: User, as: "host", attributes: ["id", "full_name", "email"] },
        ],
      });
      hostUser = (guest as any)?.host;
    }

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    if (hostUser?.email) {
      recipientsMap.set(hostUser.email.trim().toLowerCase(), {
        id: hostUser.id,
        full_name: hostUser.full_name,
        email: hostUser.email.trim(),
      });
    }

    if (requesterEmail) {
      recipientsMap.set(requesterEmail.trim().toLowerCase(), {
        id: "",
        full_name: requesterName ?? "there",
        email: requesterEmail.trim(),
      });
    }

    const recipients = Array.from(recipientsMap.values());
    if (!recipients.length) return;

    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const recipient of recipients) {
      const log = await LogService.createLog({
        event_type: "guest.reapproved",
        recipient_email: recipient.email,
        status: "pending",
      });

      try {
        const html = await generateGuestStatusEmailHtml(
          recipient.full_name,
          guestName,
          "approved",
          reviewerName,
          hasGuestImage,
        );

        await sendEmail({
          to: recipient.email,
          subject: `Guest Re-approved - ${guestName}`,
          text: `"${guestName}" has been re-approved and can now be booked.`,
          html,
          attachments,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_REAPPROVED):", error);
  }
});

// ========================================
// GUEST REAPPROVAL REJECTED → Notify Admin (not Super Admin), Assigned Host & Requester
// ========================================
eventBus.on(EVENTS.GUEST_REAPPROVAL_REJECTED, async (payload: any) => {
  try {
    const {
      guestId,
      guestName,
      reviewerName,
      requesterEmail,
      requesterName,
      proposedHostId,
      guestHostId,
      guestImagePath,
    } = payload;

    const adminUsers = await getAdminNotSuperAdminUsers();

    let hostUser: any = null;
    const targetHostId = proposedHostId || guestHostId;
    if (targetHostId) {
      hostUser = await User.findByPk(targetHostId, {
        attributes: ["id", "full_name", "email"],
      });
    } else if (guestId) {
      const guest = await Guest.findByPk(guestId, {
        include: [
          { model: User, as: "host", attributes: ["id", "full_name", "email"] },
        ],
      });
      hostUser = (guest as any)?.host;
    }

    const recipientsMap = new Map<
      string,
      { id: string; full_name: string; email: string }
    >();

    for (const admin of adminUsers) {
      if (admin.email) {
        recipientsMap.set(admin.email.trim().toLowerCase(), {
          id: admin.id,
          full_name: admin.full_name,
          email: admin.email.trim(),
        });
      }
    }

    if (hostUser?.email) {
      recipientsMap.set(hostUser.email.trim().toLowerCase(), {
        id: hostUser.id,
        full_name: hostUser.full_name,
        email: hostUser.email.trim(),
      });
    }

    if (requesterEmail) {
      recipientsMap.set(requesterEmail.trim().toLowerCase(), {
        id: "",
        full_name: requesterName ?? "there",
        email: requesterEmail.trim(),
      });
    }

    const recipients = Array.from(recipientsMap.values());
    if (!recipients.length) return;

    const attachments: any[] = [];
    let hasGuestImage = false;

    if (guestImagePath) {
      const path = await import("path");
      const fs = await import("fs");
      const absolutePath = path.join(process.cwd(), guestImagePath);

      if (fs.existsSync(absolutePath)) {
        attachments.push({
          filename: "guest-photo.jpg",
          path: absolutePath,
          cid: "guestImage",
        });
        hasGuestImage = true;
      }
    }

    for (const recipient of recipients) {
      const log = await LogService.createLog({
        event_type: "guest.reapproval_rejected",
        recipient_email: recipient.email,
        status: "pending",
      });

      try {
        const html = await generateGuestStatusEmailHtml(
          recipient.full_name,
          guestName,
          "rejected",
          reviewerName,
          hasGuestImage,
        );

        await sendEmail({
          to: recipient.email,
          subject: `Guest Re-approval Rejected - ${guestName}`,
          text: `Your request to book "${guestName}" again was not approved.`,
          html,
          attachments,
        });

        await LogService.markAsSent(log.id);
      } catch (error: any) {
        await LogService.markAsFailed(log.id, error);
      }
    }
  } catch (error) {
    console.error("Listener error (GUEST_REAPPROVAL_REJECTED):", error);
  }
});
