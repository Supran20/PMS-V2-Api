import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import routes from "./modules";
import { corsMiddleware } from "./middleware/cors.middleware";
import interviewNotificationCron from "./cron/interviewNotification.cron";
import "./events";
import { securityMiddleware } from "./middleware/security.middleware";
import { globalLimiter } from "./middleware/rateLimit.middleware";

dotenv.config();

const app = express();

const trustProxy = process.env.TRUST_PROXY;
if (trustProxy) {
  app.set(
    "trust proxy",
    /^\d+$/.test(trustProxy) ? Number(trustProxy) : trustProxy,
  );
}

app.use(securityMiddleware);
app.use(corsMiddleware);

app.get("/health", (_, res) => {
  res.status(200).send("Podcast API Running");
});

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(globalLimiter);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

interviewNotificationCron();

export default app;
