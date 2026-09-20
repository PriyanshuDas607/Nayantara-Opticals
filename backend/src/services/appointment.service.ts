import { AppointmentType, AppointmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { NotificationService } from "./notification.service.js";

export class AppointmentService {
  /**
   * Generates available booking time slots for a given date and store
   */
  static async getAvailableSlots(dateStr: string, storeId?: string): Promise<string[]> {
    const bookingDate = new Date(dateStr);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const targetStore = storeId
      ? await prisma.store.findUnique({ where: { id: storeId } })
      : await prisma.store.findFirst({ where: { isActive: true } });

    if (!targetStore) {
      throw new Error("Store not found or currently inactive.");
    }

    // Check store holiday
    const holiday = await prisma.storeHoliday.findUnique({
      where: {
        storeId_date: {
          storeId: targetStore.id,
          date: bookingDate,
        },
      },
    });
    if (holiday) {
      return []; // No slots available on holidays
    }

    // Get weekly availability config for the given day of week
    const dayOfWeek = bookingDate.getUTCDay();
    const availability = await prisma.appointmentAvailability.findUnique({
      where: {
        storeId_dayOfWeek: {
          storeId: targetStore.id,
          dayOfWeek,
        },
      },
    });

    // Default hours if not explicitly customized: 10:30 AM to 08:00 PM
    const openTimeStr = availability?.openTime || "10:30";
    const closeTimeStr = availability?.closeTime || "20:00";
    const slotDuration = availability?.slotDuration || 30;
    const maxPerSlot = availability?.maxPerSlot || 1;

    // Generate slots
    const slots: string[] = [];
    const [openH, openM] = openTimeStr.split(":").map(Number);
    const [closeH, closeM] = closeTimeStr.split(":").map(Number);

    let currentMinutes = openH * 60 + openM;
    const endMinutes = closeH * 60 + closeM;

    while (currentMinutes + slotDuration <= endMinutes) {
      const h = Math.floor(currentMinutes / 60);
      const m = currentMinutes % 60;
      const period = h >= 12 ? "PM" : "AM";
      const displayH = h % 12 === 0 ? 12 : h % 12;
      const displayM = m < 10 ? `0${m}` : m;
      slots.push(`${displayH < 10 ? `0${displayH}` : displayH}:${displayM} ${period}`);
      currentMinutes += slotDuration;
    }

    // Query booked appointments for this date and store
    const booked = await prisma.appointment.findMany({
      where: {
        storeId: targetStore.id,
        appointmentDate: bookingDate,
        status: { notIn: [AppointmentStatus.CANCELLED] },
      },
      select: { timeSlot: true },
    });

    const bookedCounts: Record<string, number> = {};
    for (const b of booked) {
      bookedCounts[b.timeSlot] = (bookedCounts[b.timeSlot] || 0) + 1;
    }

    // Filter out full slots
    return slots.filter((slot) => (bookedCounts[slot] || 0) < maxPerSlot);
  }

  /**
   * Books an appointment atomically preventing race conditions
   */
  static async bookAppointment(data: {
    userId: string;
    storeId?: string;
    type: AppointmentType;
    appointmentDate: string; // "YYYY-MM-DD"
    timeSlot: string;
    notes?: string;
  }) {
    const bookingDate = new Date(data.appointmentDate);
    bookingDate.setUTCHours(0, 0, 0, 0);

    const targetStore = data.storeId
      ? await prisma.store.findUnique({ where: { id: data.storeId } })
      : await prisma.store.findFirst({ where: { isActive: true } });

    if (!targetStore) {
      throw new Error("Store not found or inactive.");
    }

    const user = await prisma.user.findUnique({
      where: { id: data.userId },
      include: { customerProfile: true },
    });

    if (!user) {
      throw new Error("User not found.");
    }

    // Atomic transaction with uniqueness constraint to prevent double-booking
    try {
      const appointment = await prisma.$transaction(async (tx) => {
        const existing = await tx.appointment.findUnique({
          where: {
            storeId_appointmentDate_timeSlot: {
              storeId: targetStore.id,
              appointmentDate: bookingDate,
              timeSlot: data.timeSlot,
            },
          },
        });

        if (existing && existing.status !== AppointmentStatus.CANCELLED) {
          throw new Error("This time slot has just been booked by another customer. Please choose a different slot.");
        }

        const newAppointment = await tx.appointment.create({
          data: {
            userId: data.userId,
            storeId: targetStore.id,
            type: data.type,
            status: AppointmentStatus.PENDING,
            appointmentDate: bookingDate,
            timeSlot: data.timeSlot,
            notes: data.notes,
            history: {
              create: {
                status: AppointmentStatus.PENDING,
                notes: "Appointment requested by customer.",
              },
            },
          },
          include: {
            store: true,
            user: { include: { customerProfile: true } },
          },
        });

        return newAppointment;
      });

      // Send owner/admin alert
      await NotificationService.notifyOwnerNewAppointment({
        ownerPhone: targetStore.whatsappNumber || targetStore.phone,
        customerName: user.customerProfile?.fullName || "Customer",
        customerPhone: user.phone || "Not specified",
        date: data.appointmentDate,
        timeSlot: data.timeSlot,
        appointmentType: data.type,
      });

      return appointment;
    } catch (error) {
      if ((error as { code?: string }).code === "P2002") {
        throw new Error("This time slot has just been booked. Please choose another time slot.");
      }
      throw error;
    }
  }

  /**
   * Customer gets their own appointments
   */
  static async getCustomerAppointments(userId: string) {
    return prisma.appointment.findMany({
      where: { userId },
      include: {
        store: true,
        history: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { appointmentDate: "desc" },
    });
  }

  /**
   * Owner gets appointments scoped to their store
   */
  static async getOwnerAppointments(storeId: string, status?: AppointmentStatus) {
    const where: Prisma.AppointmentWhereInput = { storeId };
    if (status) where.status = status;

    return prisma.appointment.findMany({
      where,
      include: {
        user: { include: { customerProfile: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { appointmentDate: "desc" },
    });
  }

  /**
   * Admin gets all appointments with filters
   */
  static async getAdminAppointments(filters: {
    storeId?: string;
    status?: AppointmentStatus;
    startDate?: string;
    endDate?: string;
  }) {
    const where: Prisma.AppointmentWhereInput = {};
    if (filters.storeId) where.storeId = filters.storeId;
    if (filters.status) where.status = filters.status;
    if (filters.startDate || filters.endDate) {
      where.appointmentDate = {};
      if (filters.startDate) where.appointmentDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.appointmentDate.lte = new Date(filters.endDate);
    }

    return prisma.appointment.findMany({
      where,
      include: {
        store: true,
        user: { include: { customerProfile: true } },
        history: { orderBy: { createdAt: "desc" } },
      },
      orderBy: { appointmentDate: "desc" },
    });
  }

  /**
   * Update appointment status (Owner or Admin)
   */
  static async updateStatus(id: string, status: AppointmentStatus, changedById: string, notes?: string) {
    return prisma.appointment.update({
      where: { id },
      data: {
        status,
        history: {
          create: {
            status,
            changedById,
            notes,
          },
        },
      },
      include: { user: { include: { customerProfile: true } }, store: true },
    });
  }
}
