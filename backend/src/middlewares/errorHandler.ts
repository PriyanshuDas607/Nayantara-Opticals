import { Request, Response, NextFunction } from "express";
import { Logger } from "../utils/logger.js";
import { config } from "../config/index.js";
import { errorMonitor } from "../services/errorMonitor.service.js";

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "An unexpected error occurred on our server.";
  const code = err.code || "INTERNAL_ERROR";

  Logger.error(`[HTTP ${statusCode}] ${req.method} ${req.originalUrl} - ${message}`, err);

  // Automatically track incident in Error Monitor
  errorMonitor.recordError({
    statusCode,
    method: req.method,
    endpoint: req.originalUrl || req.path,
    message,
    stackTrace: err.stack,
    source: "BACKEND_API",
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    userId: req.user?.userId,
  });

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      ...(config.nodeEnv === "development" && { stack: err.stack }),
    },
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    error: { code: "NOT_FOUND" },
  });
};
