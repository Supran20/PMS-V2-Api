import http from "http";
import app from "./app";
import connect, { sequelize } from "./config/db";
import { setupAssociations } from "./modules/associations";

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    await connect();

    const server = http.createServer(app); //Wraps express inside Node HTTP server

    setupAssociations();

    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    process.on("SIGINT", async () => {
      console.log("🛑 Shutting down...");
      server.close(async () => {
        await sequelize.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Server failed to start:", error);
    process.exit(1);
  }
};

startServer();
