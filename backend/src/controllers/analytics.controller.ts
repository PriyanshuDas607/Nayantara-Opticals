import { Request, Response, NextFunction } from "express";
import { AnalyticsService } from "../services/analytics.service.js";
import { errorMonitor } from "../services/errorMonitor.service.js";

export class AnalyticsController {
  static async track(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.trackEvent({
        ...req.body,
        userId: req.user?.userId,
        ipHash: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async reportClientError(req: Request, res: Response, next: NextFunction) {
    try {
      const { message, stack, endpoint, source } = req.body;
      const incident = errorMonitor.recordError({
        type: "CLIENT_RUNTIME_ERROR",
        statusCode: 400,
        endpoint: endpoint || req.headers.referer || "/client",
        message: message || "Frontend runtime exception",
        stackTrace: stack,
        source: (source as any) || "FRONTEND_CLIENT",
        userAgent: req.headers["user-agent"],
        ipAddress: req.ip,
        userId: req.user?.userId,
      });

      res.status(201).json({ success: true, data: incident });
    } catch (error) {
      next(error);
    }
  }

  static async endSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { anonymousId } = req.body;
      if (anonymousId) {
        await AnalyticsService.endSession(anonymousId);
      }
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }

  static async getTopPages(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getTopPagesByActiveTime();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getGlobalMetrics(_req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AnalyticsService.getGlobalMetrics();
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
