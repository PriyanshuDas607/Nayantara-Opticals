import "./config/index.js";
import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import apiRouter from "./routes/index.js";
import { swaggerSpec } from "./docs/swagger.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";
import { config } from "./config/index.js";

export const createApp = (): Application => {
  const app = express();

  // Trust reverse proxy (e.g. Nginx, Cloudflare, Docker)
  app.set("trust proxy", 1);

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: config.isProduction ? undefined : false,
      crossOriginEmbedderPolicy: false,
    })
  );

  // CORS
  app.use(
    cors({
      origin: [
        config.clientUrl,
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
      ],
      credentials: true,
      methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
    })
  );

  // HTTP Request Logging
  app.use(morgan(config.isProduction ? "combined" : "dev"));

  // Cookie and Body Parsers
  app.use(cookieParser());
  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Global Rate Limiter
  app.use("/api", globalRateLimiter);

  // Swagger Documentation UI
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/docs/json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  // Master API Route
  app.use("/api/v1", apiRouter);

  // 404 & Global Centralized Error Handlers
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
