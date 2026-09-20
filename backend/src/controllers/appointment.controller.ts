import { Request, Response, NextFunction } from "express";
import { AppointmentStatus } from "@prisma/client";
import { AppointmentService } from "../services/appointment.service.js";

export class AppointmentController {
  static async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const { date, storeId } = req.query;
      if (!date || typeof date !== "string") {
        res.status(400).json({ success: false, message: "Date parameter (YYYY-MM-DD) is required." });
        return;
      }

      const slots = await AppointmentService.getAvailableSlots(date, storeId as string | undefined);
      res.json({ success: true, date, availableSlots: slots });
    } catch (error) {
      next(error);
    }
  }

  static async book(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const appointment = await AppointmentService.bookAppointment({
        userId: req.user.userId,
        ...req.body,
      });

      res.status(201).json({
        success: true,
        message: "Appointment booked successfully.",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMyAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const appointments = await AppointmentService.getCustomerAppointments(req.user.userId);
      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      if (!id) {
        res.status(400).json({ success: false, message: "Invalid appointment ID." });
        return;
      }

      const appointment = await AppointmentService.updateStatus(
        id,
        AppointmentStatus.CANCELLED,
        req.user?.userId || "system",
        "Cancelled by customer"
      );

      res.json({
        success: true,
        message: "Appointment cancelled successfully.",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }

  // --- Owner & Admin Management ---

  static async getOwnerAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const storeId = req.user?.storeId;
      if (!storeId) {
        res.status(400).json({ success: false, message: "No store assigned to this owner account." });
        return;
      }

      const status = req.query.status as AppointmentStatus | undefined;
      const appointments = await AppointmentService.getOwnerAppointments(storeId, status);
      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const appointments = await AppointmentService.getAdminAppointments(req.query);
      res.json({ success: true, data: appointments });
    } catch (error) {
      next(error);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      const { status, notes } = req.body;

      if (!id) {
        res.status(400).json({ success: false, message: "Invalid appointment ID." });
        return;
      }

      const appointment = await AppointmentService.updateStatus(
        id,
        status as AppointmentStatus,
        req.user?.userId || "system",
        notes
      );

      res.json({
        success: true,
        message: "Appointment status updated.",
        data: appointment,
      });
    } catch (error) {
      next(error);
    }
  }
}
