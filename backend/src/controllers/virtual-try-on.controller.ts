import { Request, Response, NextFunction } from "express";
import { VirtualTryOnService } from "../services/virtual-try-on.service.js";

export class VirtualTryOnController {
  static async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId } = req.body;
      const result = await VirtualTryOnService.createSession(productId, req.user?.userId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  static async getStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid session ID." });
        return;
      }

      const status = await VirtualTryOnService.getSessionStatus(id);
      res.json({ success: true, data: status });
    } catch (error) {
      next(error);
    }
  }
}
