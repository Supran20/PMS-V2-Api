import cron from "node-cron";
import { Op } from "sequelize";
import { DateTime } from "luxon";

import Interview from "../modules/interview/interview.model";
import Guest from "../modules/guest/guest.model";
import User from "../modules/users/user.model";
import Studio from "../modules/studio/studio.model";
import Permission from "../modules/permissions/permission.model";
import Channel from "../modules/admin/channel/channel.model";

import { tenantContext } from "../context/tenant-context";
import {
  sendEmail,
  generateInterviewEmailHtml,
} from "../services/email.service";

const ZONE = "Asia/Kathmandu";

export default function interviewNotificationCron() {
  cron.schedule(
    "*/30 * * * *",
    async () => {
      const now = DateTime.now().setZone(ZONE);

      console.log("[Cron] Checking...");
      console.log("NOW:", now.toISO(), "|", now.toFormat("yyyy-MM-dd HH:mm"));

      try {
        const todayDate = now.toISODate();

        // Channel is not a tenanted model — no context needed for this read.
        const channels = await Channel.findAll({
          where: { status: { [Op.in]: ["active", "trial"] } },
          attributes: ["id"],
        });

        for (const channel of channels) {
          await tenantContext.run(channel.id, async () => {
            const interviews = await Interview.findAll({
              where: {
                interview_date: todayDate,
                start_time: { [Op.not]: null },
                end_time: { [Op.not]: null },
                interview_status: "scheduled",
              },
              include: [
                {
                  model: Guest,
                  as: "guest",
                  attributes: ["full_name", "email"],
                },
                { model: User, as: "host", attributes: ["full_name", "email"] },
                { model: Studio, as: "studio", attributes: ["studio_name"] },
              ],
            });

            for (const interview of interviews) {
              if (!interview.start_time || !interview.end_time) continue;

              const startDateTime = DateTime.fromISO(
                `${todayDate}T${interview.start_time}`,
                { zone: ZONE },
              );

              const endDateTime = DateTime.fromISO(
                `${todayDate}T${interview.end_time}`,
                { zone: ZONE },
              );

              const diffMinutes = startDateTime.diff(now, "minutes").minutes;

              console.log("----");
              console.log("Channel ID:", channel.id);
              console.log("Interview ID:", interview.id);
              console.log("Start:", startDateTime.toFormat("HH:mm"));
              console.log("Now:", now.toFormat("HH:mm"));
              console.log("Diff (min):", diffMinutes);

              const isBeforeStart = now < startDateTime;
              const isBeforeEnd = now < endDateTime;
              const isWithinNextHour = diffMinutes > 0 && diffMinutes <= 60;

              if (isBeforeStart && isBeforeEnd && isWithinNextHour) {
                const hostEmail = interview.host?.email;
                if (!hostEmail) continue;

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

                const text = `Interview at ${interview.start_time} (in ${timeRemaining})`;

                const ccUsers = await User.findAll({
                  include: [
                    {
                      model: Permission,
                      as: "permissions",
                      where: { permission_type: "interview_cc" },
                      through: { attributes: [] },
                    },
                  ],
                  attributes: ["email"],
                });

                const ccEmails = ccUsers.map((u) => u.email).filter(Boolean);

                await sendEmail({
                  to: hostEmail,
                  subject: `Upcoming Interview Reminder - In ${timeRemaining}`,
                  text,
                  html,
                  cc: ccEmails,
                });

                console.log(`[Cron] ✅ Sent for ${interview.id}`);
              }
            }
          });
        }
      } catch (err) {
        console.error("[Cron] Failed:", err);
      }
    },
    {
      timezone: ZONE,
    },
  );
}
