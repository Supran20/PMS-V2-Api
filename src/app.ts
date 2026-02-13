import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./modules";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", routes);

app.get("/health", (_, res) => {
  res.status(200).send("Podcast API Running");
});

export default app;
