import { Request, Response, NextFunction } from "express";
import { PrescriptionService } from "../services/prescription.service.js";

export class PrescriptionController {
  static async getUploadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, mimeType } = req.body;
      const result = await PrescriptionService.getUploadUrl(fileName, mimeType);
      res.json({
        success: true,
        message: "Presigned upload URL generated.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async completeUpload(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const prescription = await PrescriptionService.completeFileUpload({
        userId: req.user.userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Prescription uploaded successfully.",
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitManual(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const prescription = await PrescriptionService.createManualPrescription({
        userId: req.user.userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Manual prescription recorded.",
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const list = await PrescriptionService.getCustomerPrescriptions(req.user.userId);
      res.json({ success: true, data: list });
    } catch (error) {
      next(error);
    }
  }

  static async getDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid prescription ID." });
        return;
      }

      const result = await PrescriptionService.getAuthorizedDownloadUrl(
        id,
        req.user?.userId || "anonymous",
        req.user?.role || "CUSTOMER",
        req.ip,
        req.headers["user-agent"]
      );

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllPrescriptions(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await PrescriptionService.getAllPrescriptions(page, limit);
      res.json({
        success: true,
        data: result.items,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}
