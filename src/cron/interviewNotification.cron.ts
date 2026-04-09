import cron from "node-cron";
import { Op } from "sequelize";
import Interview from "../modules/interview/interview.model";
import Guest from "../modules/guest/guest.model";
import User from "../modules/users/user.model";
import Role from "../modules/roles/role.model";
import Studio from "../modules/studio/studio.model";
import PermissionSettings from "../modules/settings/permission_settings/permission_set.model";

import {
  sendEmail,
  generateInterviewEmailHtml,
} from "../services/email.service";

export default function interviewNotificationCron() {
  cron.schedule(
    "*/5 * * * *",
    async () => {
      console.log("[Cron] Checking for upcoming interviews...");

      try {
        const now = new Date();
        const todayDate = now.toISOString().split("T")[0];

        const interviews = await Interview.findAll({
          where: {
            interview_date: todayDate,
            start_time: { [Op.not]: null },
            end_time: { [Op.not]: null }, // ensure end_time exists
            interview_status: "scheduled",
          },
          include: [
            { model: Guest, as: "guest", attributes: ["full_name", "email"] },
            { model: User, as: "host", attributes: ["full_name", "email"] },
            { model: Studio, as: "studio", attributes: ["studio_name"] },
          ],
        });

        const admins = await User.findAll({
          include: [
            {
              model: Role,
              as: "roles",
              where: { role_name: "Admin" },
              attributes: [],
            },
          ],
          attributes: ["email"],
        });

        const adminEmails = admins.map((a) => a.email).filter(Boolean);

        for (const interview of interviews) {
          const startParts = interview.start_time?.split(":");
          const endParts = interview.end_time?.split(":");
          if (!startParts || !endParts) continue;

          const [year, month, day] = todayDate.split("-").map(Number);

          const startDateTime = new Date(
            year,
            month - 1,
            day,
            +startParts[0],
            +startParts[1],
            0,
          );

          const endDateTime = new Date(
            year,
            month - 1,
            day,
            +endParts[0],
            +endParts[1],
            0,
          );

          const diffMinutes =
            (startDateTime.getTime() - now.getTime()) / (1000 * 60);

          // ✅ CORE CONDITIONS
          const isBeforeStart = now < startDateTime;
          const isBeforeEnd = now < endDateTime;
          const isWithinNextHour = diffMinutes > 0 && diffMinutes <= 60;

          if (isBeforeStart && isBeforeEnd && isWithinNextHour) {
            const guestEmail = interview.guest?.email;
            const hostEmail = interview.host?.email;

            const diffHours = Math.floor(diffMinutes / 60);
            const diffMins = Math.floor(diffMinutes % 60);

            const timeRemaining = diffHours
              ? `${diffHours}h ${diffMins}m`
              : `${diffMins} minutes`;

            const html = await generateInterviewEmailHtml(
              `Upcoming Interview Reminder - In ${timeRemaining}`,
              interview.host?.full_name ?? "Host",
              interview.guest?.full_name ?? "Guest",
              interview.interview_date ?? "",
              interview.start_time ?? "",
              interview.end_time ?? "",
              interview.studio?.studio_name ?? "Studio",
            );

            const text = `Your interview with ${interview.guest?.full_name} is scheduled at ${interview.start_time} (starting in ${timeRemaining})`;

            const permission = await PermissionSettings.findOne({
              where: { permission_type: "interview_cc" },
            });

            if (!permission || !permission.user_ids?.length) continue;

            const ccUsers = await User.findAll({
              where: { id: permission.user_ids },
              attributes: ["email"],
            });

            const ccEmails = ccUsers.map((u) => u.email).filter(Boolean);

            if (!hostEmail) continue;

            try {
              await sendEmail({
                to: hostEmail,
                subject: `Upcoming Interview Reminder - In ${timeRemaining}`,
                text,
                html,
                cc: ccEmails,
              });
            } catch (err) {
              console.error(`[Cron] Email failed for ${hostEmail}`);
            }

            console.log(
              `[Cron] Sent for interview ${interview.id} (starts in ${timeRemaining})`,
            );
          }
        }
      } catch (err) {
        console.error("[Cron] Failed:", err);
      }
    },
    {
      timezone: "Asia/Kathmandu",
    },
  );
}
