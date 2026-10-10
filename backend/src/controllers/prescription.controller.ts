import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { PrescriptionService } from "../services/prescription.service.js";
import { StorageService } from "../services/storage.service.js";
import { prisma } from "../utils/prisma.js";

export class PrescriptionController {
  /**
   * Upload prescription directly via multipart/form-data to Supabase Storage
   */
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: "No prescription file provided. Please attach a JPEG, PNG, or PDF file (up to 10MB).",
        });
        return;
      }

      // Resolve user: logged in user OR guest customer by phone/email
      let userId = req.user?.userId;
      const patientName = req.body.name?.trim();
      const patientPhone = req.body.phone?.trim();
      const patientEmail = req.body.email?.trim() || null;
      const notes = req.body.notes?.trim();
      const appointmentId = req.body.appointmentId?.trim() || undefined;
      const orderId = req.body.orderId?.trim() || undefined;

      if (!userId) {
        if (!patientPhone) {
          res.status(400).json({
            success: false,
            message: "Please provide a contact phone number or log in to link your prescription.",
          });
          return;
        }

        // Find or create customer
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ phone: patientPhone }, ...(patientEmail ? [{ email: patientEmail }] : [])],
          },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: patientPhone,
              email: patientEmail || undefined,
              role: Role.CUSTOMER,
              customerProfile: {
                create: {
                  fullName: patientName || "Customer",
                  whatsappOptIn: true,
                },
              },
            },
          });
        }
        userId = user.id;
      }

      const prescription = await PrescriptionService.uploadPrescriptionFile({
        file: {
          buffer: file.buffer,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        },
        userId,
        appointmentId,
        orderId,
        notes,
      });

      res.status(201).json({
        success: true,
        message: "Prescription successfully saved to Supabase vault.",
        data: prescription,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stream locally stored prescription file (fallback when Supabase keys pending)
   */
  static async getRawFile(req: Request, res: Response, next: NextFunction) {
    try {
      const paramKey = req.params.objectKey;
      const objectKey = Array.isArray(paramKey) ? paramKey[0] : paramKey;
      if (!objectKey) {
        res.status(400).send("Invalid file request.");
        return;
      }

      const fileData = StorageService.getLocalFile(objectKey);
      if (!fileData) {
        res.status(404).send("Prescription file not found.");
        return;
      }

      const ext = (fileData.fileName.split(".").pop() || "").toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === "pdf") contentType = "application/pdf";
      else if (ext === "jpg" || ext === "jpeg") contentType = "image/jpeg";
      else if (ext === "png") contentType = "image/png";

      res.setHeader("Content-Type", contentType);
      res.setHeader("Content-Disposition", `inline; filename="${fileData.fileName}"`);
      res.send(fileData.buffer);
    } catch (error) {
      next(error);
    }
  }

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
      const limit = Number(req.query.limit) || 50;
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
