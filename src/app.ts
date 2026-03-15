import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import routes from "./modules";
import { corsMiddleware } from "./middleware/cors.middleware";
import interviewNotificationCron from "./cron/interviewNotification.cron";

dotenv.config();

const app = express();

app.use(corsMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/", routes);

interviewNotificationCron();

app.get("/health", (_, res) => {
  res.status(200).send("Podcast API Running");
});

export default app;
