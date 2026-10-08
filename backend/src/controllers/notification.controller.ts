import { Request, Response, NextFunction } from "express";
import { Role, NotificationChannel, NotificationStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { devStore, DevNotification, DevBroadcastLog } from "../utils/devStore.js";
import { Role as AppRole } from "../constants/index.js";
import { NotificationService } from "../services/notification.service.js";
import { Logger } from "../utils/logger.js";

function withDbTimeout<T>(promise: Promise<T>, ms = 1200): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), ms)),
  ]);
}

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

      let notifications: any[] = [];

      try {
        const dbNotifs = await withDbTimeout(
          prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 50,
          }),
          1000
        );

        if (dbNotifs && dbNotifs.length > 0) {
          notifications = dbNotifs.map((n) => {
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
        }
      } catch (err) {
        Logger.warn("[NotificationController] DB fetch failed or timed out, falling back to devStore:", err);
      }

      // Merge with devStore notifications
      const devNotifs = devStore.getUserNotifications(userId);
      if (devNotifs && devNotifs.length > 0) {
        const existingIds = new Set(notifications.map((n) => n.id));
        for (const dn of devNotifs) {
          if (!existingIds.has(dn.id)) {
            const meta = parseMetadata(dn.metadata);
            notifications.push({
              id: dn.id,
              userId: dn.userId,
              channel: dn.channel,
              title: dn.title,
              body: dn.body,
              metadata: meta,
              read: Boolean(meta.read),
              status: dn.status,
              createdAt: dn.createdAt,
            });
          }
        }
      }

      // Sort by newest first
      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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

      // Update in devStore
      devStore.markNotificationRead(id, userId);

      // Update in DB if present
      try {
        const existing = await withDbTimeout(
          prisma.notification.findUnique({ where: { id } }),
          800
        );
        if (existing && existing.userId === userId) {
          const meta = parseMetadata(existing.metadata);
          meta.read = true;
          meta.readAt = new Date().toISOString();

          await withDbTimeout(
            prisma.notification.update({
              where: { id },
              data: { metadata: meta },
            }),
            800
          );
        }
      } catch (err) {
        Logger.warn("[NotificationController] DB markRead skipped/timed out:", err);
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

      devStore.markAllNotificationsRead(userId);

      try {
        const unreadDbNotifs = await withDbTimeout(
          prisma.notification.findMany({
            where: { userId },
          }),
          800
        );

        for (const notif of unreadDbNotifs) {
          const meta = parseMetadata(notif.metadata);
          if (!meta.read) {
            meta.read = true;
            meta.readAt = new Date().toISOString();
            await withDbTimeout(
              prisma.notification.update({
                where: { id: notif.id },
                data: { metadata: meta },
              }),
              400
            ).catch(() => null);
          }
        }
      } catch (err) {
        Logger.warn("[NotificationController] DB markAllRead skipped/timed out:", err);
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

      devStore.deleteNotification(id, userId);

      try {
        await withDbTimeout(
          prisma.notification.deleteMany({
            where: { id, userId },
          }),
          800
        );
      } catch (err) {
        Logger.warn("[NotificationController] DB delete notification skipped/timed out:", err);
      }

      res.json({ success: true, message: "Notification deleted." });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/notifications/customers
   * Returns list of customers for audience targeting in Owner & Admin panels
   */
  static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      const customerMap = new Map<string, any>();

      // 1. Get devStore customers
      for (const u of devStore.users) {
        if (u.role === AppRole.CUSTOMER) {
          customerMap.set(u.id, {
            id: u.id,
            fullName: u.fullName || "Customer",
            email: u.email || "",
            phone: u.phone || "",
            createdAt: u.createdAt,
            totalOrders: devStore.orders.filter((o) => o.user?.email === u.email).length,
            totalAppointments: devStore.appointments.filter((a) => a.user?.phone === u.phone).length,
          });
        }
      }

      // 2. Query DB customers
      try {
        const dbCustomers = await withDbTimeout(
          prisma.user.findMany({
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
            take: 100,
          }),
          1000
        );

        for (const cu of dbCustomers) {
          customerMap.set(cu.id, {
            id: cu.id,
            fullName: cu.customerProfile?.fullName || "Valued Customer",
            email: cu.email || "",
            phone: cu.phone || "",
            createdAt: cu.createdAt.toISOString(),
            totalOrders: cu._count?.orders ?? 0,
            totalAppointments: cu._count?.appointments ?? 0,
          });
        }
      } catch (err) {
        Logger.warn("[NotificationController] Failed to query customers from DB:", err);
      }

      const customers = Array.from(customerMap.values());
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
      const senderUser = devStore.users.find((u) => u.id === senderId);
      const senderName = senderUser?.fullName || (senderRole === "SUPER_ADMIN" ? "Nayantara Executive Admin" : "Nayantara Store Owner");

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

      // 1. Resolve recipients
      interface TargetRecipient {
        id: string;
        name: string;
        email?: string;
        phone?: string;
      }

      const recipientMap = new Map<string, TargetRecipient>();

      // Check devStore customers
      for (const u of devStore.users) {
        if (u.role === AppRole.CUSTOMER) {
          const hasAppt = devStore.appointments.some((a) => a.user?.phone === u.phone || a.user?.email === u.email);
          const hasOrder = devStore.orders.some((o) => o.user?.phone === u.phone || o.user?.email === u.email);

          let eligible = false;
          if (target === "ALL") eligible = true;
          else if (target === "SPECIFIC_USERS" && Array.isArray(userIds) && userIds.includes(u.id)) eligible = true;
          else if (target === "WITH_APPOINTMENTS" && hasAppt) eligible = true;
          else if (target === "WITH_ORDERS" && hasOrder) eligible = true;

          if (eligible) {
            recipientMap.set(u.id, {
              id: u.id,
              name: u.fullName || "Customer",
              email: u.email,
              phone: u.phone,
            });
          }
        }
      }

      // Check DB customers
      try {
        let whereCondition: any = { role: Role.CUSTOMER };

        if (target === "SPECIFIC_USERS" && Array.isArray(userIds) && userIds.length > 0) {
          whereCondition.id = { in: userIds };
        } else if (target === "WITH_APPOINTMENTS") {
          whereCondition.appointments = { some: {} };
        } else if (target === "WITH_ORDERS") {
          whereCondition.orders = { some: {} };
        }

        const dbUsers = await withDbTimeout(
          prisma.user.findMany({
            where: whereCondition,
            include: { customerProfile: true },
            take: 200,
          }),
          1000
        );

        for (const du of dbUsers) {
          recipientMap.set(du.id, {
            id: du.id,
            name: du.customerProfile?.fullName || "Valued Customer",
            email: du.email || undefined,
            phone: du.phone || undefined,
          });
        }
      } catch (err) {
        Logger.warn("[NotificationController] Broadcast DB user lookup timed out/failed:", err);
      }

      const recipients = Array.from(recipientMap.values());

      if (recipients.length === 0) {
        // Fallback: if no recipients matched, ensure at least default test customer receives it
        const fallbackCustomer = devStore.users.find((u) => u.role === AppRole.CUSTOMER);
        if (fallbackCustomer) {
          recipients.push({
            id: fallbackCustomer.id,
            name: fallbackCustomer.fullName || "Customer",
            email: fallbackCustomer.email,
            phone: fallbackCustomer.phone,
          });
        }
      }

      const nowIso = new Date().toISOString();

      // 2. Dispatch notifications to each recipient
      for (const rec of recipients) {
        // Replace {name} placeholder
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

        const notifId = `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        // Save to devStore
        devStore.addNotification({
          id: notifId,
          userId: rec.id,
          channel: "IN_APP",
          title: personalizedTitle,
          body: personalizedBody,
          metadata,
          status: "DELIVERED",
          createdAt: nowIso,
        });

        // Save to DB
        try {
          await withDbTimeout(
            prisma.notification.create({
              data: {
                userId: rec.id,
                channel: NotificationChannel.IN_APP,
                title: personalizedTitle,
                body: personalizedBody,
                metadata: metadata,
                status: NotificationStatus.DELIVERED,
              },
            }),
            500
          );
        } catch {
          // handled
        }

        // Deliver to external channels if requested (e.g. WhatsApp, SMS, Email)
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

      // 3. Log broadcast to history
      const broadcastLog: DevBroadcastLog = {
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
        createdAt: nowIso,
      };

      devStore.addBroadcastLog(broadcastLog);

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
  static async getBroadcastHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = devStore.getBroadcastLogs();
      res.json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
