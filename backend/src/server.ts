import "./config/index.js";
import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { Logger } from "./utils/logger.js";
import { prisma } from "./utils/prisma.js";

const app = createApp();

const server = app.listen(config.port, () => {
  Logger.info(`🚀 Nayantara Opticals Backend running on port ${config.port}`);
  Logger.info(`📡 Environment: ${config.nodeEnv}`);
  Logger.info(`🩺 Health Check: http://localhost:${config.port}/api/v1/health`);
  Logger.info(`📚 Swagger Documentation: http://localhost:${config.port}/docs`);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  Logger.info(`Received ${signal}. Gracefully shutting down server...`);
  server.close(async () => {
    Logger.info("HTTP server closed.");
    await prisma.$disconnect();
    Logger.info("Database connection disconnected.");
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
