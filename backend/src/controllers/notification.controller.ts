import { Request, Response, NextFunction } from "express";
import { Role, NotificationChannel, NotificationStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { NotificationService } from "../services/notification.service.js";
import { Logger } from "../utils/logger.js";
import { AuditService } from "../services/audit.service.js";

function parseMetadata(meta: unknown): Record<string, any> {
  if (!meta) return {};
  if (typeof meta === "string") {
    try {
      return JSON.parse(meta);
    } catch {
      return {};
    }
  }
  if (typeof meta === "object") {
    return meta as Record<string, any>;
  }
  return {};
}

export class NotificationController {
  /**
   * GET /api/notifications
   * Retrieves notifications for current authenticated user
   */
  static async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Authentication required." });
        return;
      }

      const dbNotifs = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const notifications = dbNotifs.map((n) => {
        const meta = parseMetadata(n.metadata);
        return {
          id: n.id,
          userId: n.userId,
          channel: n.channel,
          title: n.title,
          body: n.body,
          metadata: meta,
          read: Boolean(meta.read),
          status: n.status,
          createdAt: n.createdAt.toISOString(),
        };
      });

      const unreadCount = notifications.filter((n) => !n.read).length;

      res.json({
        success: true,
        data: notifications,
        unreadCount,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/:id/read
   * Mark a notification as read
   */
  static async markRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const id = String(req.params.id || "");

      if (!userId || !id) {
        res.status(400).json({ success: false, message: "Invalid parameters." });
        return;
      }

      const existing = await prisma.notification.findUnique({ where: { id } });
      if (existing && existing.userId === userId) {
        const meta = parseMetadata(existing.metadata);
        meta.read = true;
        meta.readAt = new Date().toISOString();

        await prisma.notification.update({
          where: { id },
          data: { metadata: meta },
        });
      }

      res.json({ success: true, message: "Notification marked as read." });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/notifications/read-all
   * Mark all notifications as read for current user
   */
  static async markAllRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.status(401).json({ success: false, message: "Authentication required." });
        return;
      }

      const unreadNotifs = await prisma.notification.findMany({
        where: { userId },
      });

      for (const notif of unreadNotifs) {
        const meta = parseMetadata(notif.metadata);
        if (!meta.read) {
          meta.read = true;
          meta.readAt = new Date().toISOString();
          await prisma.notification.update({
            where: { id: notif.id },
            data: { metadata: meta },
          }).catch(() => null);
        }
      }

      res.json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/notifications/:id
   * Delete a notification for current user
   */
  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      const id = String(req.params.id || "");

      if (!userId || !id) {
        res.status(400).json({ success: false, message: "Invalid parameters." });
        return;
      }

      await prisma.notification.deleteMany({
        where: { id, userId },
      });

      res.json({ success: true, message: "Notification deleted." });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/customers
   * Returns list of customers for audience targeting in Owner & Admin panels
   */
  static async getCustomers(_req: Request, res: Response, next: NextFunction) {
    try {
      const dbCustomers = await prisma.user.findMany({
        where: { role: Role.CUSTOMER },
        include: {
          customerProfile: true,
          _count: {
            select: {
              orders: true,
              appointments: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      });

      const customers = dbCustomers.map((cu) => ({
        id: cu.id,
        fullName: cu.customerProfile?.fullName || "Valued Customer",
        email: cu.email || "",
        phone: cu.phone || "",
        createdAt: cu.createdAt.toISOString(),
        totalOrders: cu._count?.orders ?? 0,
        totalAppointments: cu._count?.appointments ?? 0,
      }));

      res.json({ success: true, data: customers });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/notifications/broadcast
   * Allows Store Owner and Super Admin to compose & send notifications to customers
   */
  static async broadcast(req: Request, res: Response, next: NextFunction) {
    try {
      const senderId = req.user?.userId || "system";
      const senderRole = req.user?.role || "OWNER";
      const senderName = senderRole === "SUPER_ADMIN" ? "Nayantara Executive Admin" : "Nayantara Store Owner";

      const {
        title,
        body,
        category = "PROMOTION",
        priority = "NORMAL",
        target = "ALL", // "ALL" | "SPECIFIC_USERS" | "WITH_APPOINTMENTS" | "WITH_ORDERS"
        userIds = [],
        channels = ["IN_APP"],
        linkUrl = "/shop",
        ctaText = "View Details",
        imageUrl,
        templateId,
      } = req.body;

      if (!title?.trim() || !body?.trim()) {
        res.status(400).json({ success: false, message: "Title and message body are required." });
        return;
      }

      let whereCondition: any = { role: Role.CUSTOMER };

      if (target === "SPECIFIC_USERS" && Array.isArray(userIds) && userIds.length > 0) {
        whereCondition.id = { in: userIds };
      } else if (target === "WITH_APPOINTMENTS") {
        whereCondition.appointments = { some: {} };
      } else if (target === "WITH_ORDERS") {
        whereCondition.orders = { some: {} };
      }

      const dbUsers = await prisma.user.findMany({
        where: whereCondition,
        include: { customerProfile: true },
        take: 200,
      });

      const recipients = dbUsers.map((du) => ({
        id: du.id,
        name: du.customerProfile?.fullName || "Valued Customer",
        email: du.email || undefined,
        phone: du.phone || undefined,
      }));

      for (const rec of recipients) {
        const personalizedTitle = title.replace(/\{name\}/gi, rec.name);
        const personalizedBody = body.replace(/\{name\}/gi, rec.name);

        const metadata = {
          category,
          priority,
          linkUrl,
          ctaText,
          imageUrl,
          templateId,
          read: false,
          campaignTitle: title,
          sentBy: {
            userId: senderId,
            role: senderRole,
            name: senderName,
          },
        };

        await prisma.notification.create({
          data: {
            userId: rec.id,
            channel: NotificationChannel.IN_APP,
            title: personalizedTitle,
            body: personalizedBody,
            metadata: metadata,
            status: NotificationStatus.DELIVERED,
          },
        }).catch((e) => Logger.error("[Broadcast] Error creating in-app notification:", e));

        const extChannels = (channels || []).filter((c: string) => c !== "IN_APP");
        if (extChannels.length > 0) {
          const prismaChannels: NotificationChannel[] = extChannels
            .map((c: string) => {
              if (c === "WHATSAPP") return NotificationChannel.WHATSAPP;
              if (c === "SMS") return NotificationChannel.SMS;
              if (c === "EMAIL") return NotificationChannel.EMAIL;
              return null;
            })
            .filter((c: any): c is NotificationChannel => c !== null);

          if (prismaChannels.length > 0) {
            NotificationService.send({
              userId: rec.id,
              recipientPhone: rec.phone,
              recipientEmail: rec.email,
              channels: prismaChannels,
              title: personalizedTitle,
              body: personalizedBody,
              metadata,
            }).catch((e) => Logger.error("[Broadcast] External channel delivery error:", e));
          }
        }
      }

      const broadcastLog = {
        id: `broadcast-${Date.now()}`,
        title,
        body,
        category,
        priority,
        target,
        recipientCount: recipients.length,
        channels: channels || ["IN_APP"],
        linkUrl,
        ctaText,
        imageUrl,
        sentBy: {
          userId: senderId,
          role: senderRole,
          name: senderName,
        },
        createdAt: new Date().toISOString(),
      };

      await AuditService.log({
        userId: senderId,
        action: "BROADCAST_SENT" as any,
        resource: "Broadcast",
        details: broadcastLog,
      }).catch(() => null);

      Logger.info(`[Notification Broadcast] Sent by ${senderRole} (${senderName}) to ${recipients.length} customers.`);

      res.status(200).json({
        success: true,
        message: `Successfully broadcasted notification to ${recipients.length} customer(s).`,
        recipientCount: recipients.length,
        data: broadcastLog,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/broadcast-history
   * Returns list of past broadcast campaigns sent by Store Owner & Super Admin
   */
  static async getBroadcastHistory(_req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await prisma.auditLog.findMany({
        where: { action: "BROADCAST_SENT" },
        orderBy: { createdAt: "desc" },
        take: 50,
      });

      const history = logs.map((l) => {
        const details = parseMetadata(l.details);
        return {
          id: l.id,
          title: details.title || "Broadcast Campaign",
          body: details.body || "",
          category: details.category || "PROMOTION",
          priority: details.priority || "NORMAL",
          target: details.target || "ALL",
          recipientCount: details.recipientCount || 0,
          channels: details.channels || ["IN_APP"],
          sentBy: details.sentBy || { userId: l.userId, role: "OWNER" },
          createdAt: l.createdAt.toISOString(),
        };
      });

      res.json({
        success: true,
        data: history,
      });
    } catch (error) {
      next(error);
    }
  }
}
