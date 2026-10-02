import { Request, Response, NextFunction } from "express";
import { AppointmentStatus, Role } from "@prisma/client";
import { AppointmentService } from "../services/appointment.service.js";
import { prisma } from "../utils/prisma.js";

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
      let userId = req.user?.userId;

      if (!userId) {
        const phone = req.body.phone?.trim();
        const name = req.body.name?.trim() || "Customer";
        const email = req.body.email?.trim() || null;

        if (!phone) {
          res.status(400).json({
            success: false,
            message: "Please provide a valid contact mobile number to book your appointment.",
          });
          return;
        }

        // Find or create customer user
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ phone }, ...(email ? [{ email }] : [])],
          },
          include: { customerProfile: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              email: email || undefined,
              role: Role.CUSTOMER,
              customerProfile: {
                create: {
                  fullName: name,
                  whatsappOptIn: true,
                },
              },
            },
            include: { customerProfile: true },
          });
        } else if (!user.customerProfile) {
          await prisma.customerProfile.create({
            data: {
              userId: user.id,
              fullName: name,
            },
          });
        }
        userId = user.id;
      }

      const notesArr: string[] = [];
      if (req.body.notes?.trim()) notesArr.push(req.body.notes.trim());
      if (req.body.patientAge) notesArr.push(`Patient Age: ${req.body.patientAge}`);
      if (req.body.name && !req.user?.userId) notesArr.push(`Patient Name: ${req.body.name}`);

      const appointment = await AppointmentService.bookAppointment({
        userId,
        storeId: req.body.storeId,
        type: req.body.type || "EYE_TEST",
        appointmentDate: req.body.appointmentDate,
        timeSlot: req.body.timeSlot,
        notes: notesArr.length > 0 ? notesArr.join(" | ") : undefined,
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
