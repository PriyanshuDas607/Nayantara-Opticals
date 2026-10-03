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
      const patientName = req.body.name?.trim();
      const contactPhone = req.body.phone?.trim();
      const email = req.body.email?.trim() || null;
      const patientAge = req.body.patientAge;

      if (!userId) {
        if (!contactPhone) {
          res.status(400).json({
            success: false,
            message: "Please provide a valid contact mobile number to book your appointment.",
          });
          return;
        }

        // Find or create customer user
        let user = await prisma.user.findFirst({
          where: {
            OR: [{ phone: contactPhone }, ...(email ? [{ email }] : [])],
          },
          include: { customerProfile: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone: contactPhone,
              email: email || undefined,
              role: Role.CUSTOMER,
              customerProfile: {
                create: {
                  fullName: patientName || "Customer",
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
              fullName: patientName || "Customer",
            },
          });
        }
        userId = user.id;
      } else {
        // Logged-in user: fill phone or name on user profile if missing
        try {
          const existingUser = await prisma.user.findUnique({
            where: { id: userId },
            include: { customerProfile: true },
          });
          if (existingUser) {
            if (contactPhone && !existingUser.phone) {
              await prisma.user.update({
                where: { id: userId },
                data: { phone: contactPhone },
              }).catch(() => {});
            }
            if (patientName && (!existingUser.customerProfile || !existingUser.customerProfile.fullName)) {
              if (existingUser.customerProfile) {
                await prisma.customerProfile.update({
                  where: { userId },
                  data: { fullName: patientName },
                }).catch(() => {});
              } else {
                await prisma.customerProfile.create({
                  data: { userId, fullName: patientName },
                }).catch(() => {});
              }
            }
          }
        } catch {
          // ignore profile sync failure
        }
      }

      // Consolidate rich details into notes so every dashboard has immediate full context
      const notesArr: string[] = [];
      if (patientName) notesArr.push(`Patient: ${patientName}`);
      if (contactPhone) notesArr.push(`Contact: ${contactPhone}`);
      if (email) notesArr.push(`Email: ${email}`);
      if (patientAge) notesArr.push(`Age: ${patientAge}`);
      if (req.body.notes?.trim()) notesArr.push(`Notes: ${req.body.notes.trim()}`);

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
      let storeId = req.user?.storeId;
      if (!storeId && req.user?.userId) {
        const ownerProfile = await prisma.ownerProfile.findUnique({
          where: { userId: req.user.userId },
        });
        if (ownerProfile?.storeId) {
          storeId = ownerProfile.storeId;
        }
      }

      const status = req.query.status as AppointmentStatus | undefined;
      const appointments = await AppointmentService.getOwnerAppointments(storeId || undefined, status);
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
