import { Request, Response, NextFunction } from "express";
import { Role, AccountStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { CryptoUtil } from "../utils/crypto.js";
import { normalizePhone, isValidIndianPhone } from "../utils/phone.js";
import { isDisposableEmail } from "../utils/disposableEmails.js";
import { AuditService, AuditAction } from "../services/audit.service.js";
import { errorMonitor } from "../services/errorMonitor.service.js";

export class AdminController {
  /**
   * Creates a new Store Owner account (Only Super Admin allowed)
   */
  static async createOwner(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, fullName, phone, storeId } = req.body;
      const cleanEmail = (email || "").toLowerCase().trim();

      if (!cleanEmail || !password || !fullName) {
        res.status(400).json({ success: false, message: "Please provide fullName, email, and password." });
        return;
      }

      if (isDisposableEmail(cleanEmail)) {
        res.status(400).json({ success: false, message: "Disposable email domains are not allowed." });
        return;
      }

      let normalizedPhone: string | undefined = undefined;
      if (phone && typeof phone === "string" && phone.trim().length > 0) {
        normalizedPhone = normalizePhone(phone.trim());
      }

      const existing = await prisma.user.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        res.status(400).json({ success: false, message: "An account with this email already exists." });
        return;
      }

      const passwordHash = await CryptoUtil.hashPassword(password);

      const ownerUser = await prisma.user.create({
        data: {
          email: cleanEmail,
          phone: normalizedPhone,
          passwordHash,
          role: Role.OWNER,
          status: AccountStatus.ACTIVE,
          isEmailVerified: true,
          ownerProfile: {
            create: {
              fullName: fullName.trim(),
              storeId: storeId || undefined,
            },
          },
        },
        include: {
          ownerProfile: { include: { store: true } },
        },
      });

      await AuditService.log({
        userId: req.user?.userId,
        action: AuditAction.OWNER_ONBOARDED,
        resource: `User:${ownerUser.id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: { email: cleanEmail, storeId, fullName },
      });

      res.status(201).json({
        success: true,
        message: "Store Owner account created successfully.",
        data: ownerUser,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Gets list of all store owners
   */
  static async getOwners(_req: Request, res: Response, next: NextFunction) {
    try {
      const owners = await prisma.user.findMany({
        where: { role: Role.OWNER },
        include: {
          ownerProfile: { include: { store: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: owners });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Updates or activates/deactivates an Owner account
   */
  static async updateOwnerStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      const { status, storeId } = req.body;

      if (!id) {
        res.status(400).json({ success: false, message: "Invalid user ID." });
        return;
      }

      await AuditService.log({
        userId: req.user?.userId,
        action: status === "SUSPENDED" ? AuditAction.OWNER_SUSPENDED : AuditAction.OWNER_ACTIVATED,
        resource: `User:${id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: { status, storeId },
      });

      const updated = await prisma.user.update({
        where: { id, role: Role.OWNER },
        data: {
          status: status as AccountStatus,
          ownerProfile: storeId !== undefined ? { update: { storeId } } : undefined,
        },
        include: { ownerProfile: { include: { store: true } } },
      });

      res.json({ success: true, message: "Owner updated successfully.", data: updated });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Strictly Read-Only Audit Logs Listing for Super Admin
   */
  static async getAuditLogs(req: Request, res: Response, _next: NextFunction) {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 30;
    const action = req.query.action as string | undefined;
    const userId = req.query.userId as string | undefined;

    const result = await AuditService.getAuditLogs({ page, limit, action, userId });

    res.json({
      success: true,
      data: result.logs,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  }

  /**
   * Appointments for Super Admin Oversight Console
   */
  static async getAppointments(_req: Request, res: Response, next: NextFunction) {
    try {
      const appts = await prisma.appointment.findMany({
        include: {
          user: { include: { customerProfile: true } },
          store: true,
        },
        orderBy: { appointmentDate: "desc" },
      });

      res.json({ success: true, data: appts });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stores listing & management
   */
  static async getStores(_req: Request, res: Response, next: NextFunction) {
    try {
      const stores = await prisma.store.findMany({
        include: {
          _count: {
            select: { products: true, appointments: true, orders: true },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      res.json({ success: true, data: stores });
    } catch (error) {
      next(error);
    }
  }

  static async createStore(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, address, city, state, pincode, phone, whatsappNumber } = req.body;
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + `-${Date.now().toString(36)}`;

      const store = await prisma.store.create({
        data: { name, slug, address, city, state: state || "Delhi", pincode: pincode || "110059", phone, whatsappNumber },
      });

      await AuditService.log({
        userId: req.user?.userId,
        action: AuditAction.STORE_CREATED,
        resource: `Store:${store.id}`,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
        details: { name, city, phone },
      });

      res.status(201).json({ success: true, message: "Store created successfully.", data: store });
    } catch (error) {
      next(error);
    }
  }

  // --- Error Monitoring & Incident Management ---

  static async getErrorMonitoring(_req: Request, res: Response, next: NextFunction) {
    try {
      const summary = errorMonitor.getSummary();
      res.json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateErrorStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const param = req.params.id;
      const id = Array.isArray(param) ? param[0] : param;
      const { status } = req.body;

      if (!id || !status) {
        res.status(400).json({ success: false, message: "Invalid incident ID or status." });
        return;
      }

      const updated = errorMonitor.updateStatus(id, status);
      if (!updated) {
        res.status(404).json({ success: false, message: "Error incident not found." });
        return;
      }

      res.json({
        success: true,
        message: `Incident marked as ${status}.`,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async clearResolvedErrors(_req: Request, res: Response, next: NextFunction) {
    try {
      const count = errorMonitor.clearResolved();
      res.json({
        success: true,
        message: `Cleared ${count} resolved error incident(s).`,
      });
    } catch (error) {
      next(error);
    }
  }
}
