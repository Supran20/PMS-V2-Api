import cron from "node-cron";
import { Op } from "sequelize";
import Interview from "../modules/interview/interview.model";
import Guest from "../modules/guest/guest.model";
import User from "../modules/users/user.model";
import Role from "../modules/roles/role.model";
import Studio from "../modules/studio/studio.model";

import {
  sendEmail,
  generateInterviewEmailHtml,
} from "../services/email.service";

//-----------------------------------
// Run every 30 mins
//-----------------------------------
export default function interviewNotificationCron() {
  cron.schedule("*/30 * * * *", async () => {
    console.log("[Cron] Checking for upcoming interviews...");

    try {
      const now = new Date();

      // Format date for DB comparison
      const todayDate = now.toLocaleDateString("en-CA");

      // Fetch interviews scheduled for today with a start_time
      const interviews = await Interview.findAll({
        where: {
          interview_date: todayDate,
          start_time: { [Op.not]: null },
          interview_status: "scheduled",
        },
        include: [
          { model: Guest, as: "guest", attributes: ["full_name", "email"] },
          { model: User, as: "host", attributes: ["full_name", "email"] },
          { model: Studio, as: "studio", attributes: ["studio_name"] },
        ],
      });

      // Fetch Admins dynamically once per run
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
      const adminEmails = admins.map((admin) => admin.email).filter(Boolean);

      for (const interview of interviews) {
        const startTimeParts = interview.start_time?.split(":");
        if (!startTimeParts) continue;

        const interviewDateTime = new Date(todayDate);
        interviewDateTime.setHours(parseInt(startTimeParts[0]));
        interviewDateTime.setMinutes(parseInt(startTimeParts[1]));
        interviewDateTime.setSeconds(0);

        const diffMinutes =
          (interviewDateTime.getTime() - now.getTime()) / (1000 * 60);

        // Only notify if interview is within the next hour
        if (diffMinutes > 0 && diffMinutes <= 60) {
          const guestEmail = interview.guest?.email;
          const hostEmail = interview.host?.email;

          // Prepare email text with dynamic time remaining
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

          const recipients = [guestEmail, hostEmail, ...adminEmails].filter(
            Boolean,
          );

          for (const to of recipients) {
            await sendEmail({
              to: to!,
              subject: `Upcoming Interview Reminder - In ${timeRemaining} `,
              text,
              html,
            });
          }

          console.log(
            `[Cron] Notification sent for interview ${interview.id} starting at ${interview.start_time} (diff: ${timeRemaining})`,
          );
        }
      }
    } catch (err) {
      console.error("[Cron] Failed to send interview notifications:", err);
    }
  });
}
