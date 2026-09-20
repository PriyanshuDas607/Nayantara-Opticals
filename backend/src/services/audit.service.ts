import { prisma } from "../utils/prisma.js";
import { Logger } from "../utils/logger.js";

function withDbTimeout<T>(promise: Promise<T>, ms = 600): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database connection timeout")), ms)),
  ]);
}

export enum AuditAction {
  // Authentication & Security
  AUTH_LOGIN_SUCCESS = "AUTH_LOGIN_SUCCESS",
  AUTH_LOGIN_FAILURE = "AUTH_LOGIN_FAILURE",
  AUTH_2FA_CHALLENGE_ISSUED = "AUTH_2FA_CHALLENGE_ISSUED",
  AUTH_2FA_VERIFIED = "AUTH_2FA_VERIFIED",
  AUTH_LOGOUT = "AUTH_LOGOUT",
  AUTH_PASSWORD_RESET = "AUTH_PASSWORD_RESET",
  AUTH_TOKEN_ROTATED = "AUTH_TOKEN_ROTATED",

  // Super Admin Governance
  SUPERADMIN_SETTINGS_UPDATE = "SUPERADMIN_SETTINGS_UPDATE",
  SUPERADMIN_VIEW_AUDIT_LOGS = "SUPERADMIN_VIEW_AUDIT_LOGS",
  OWNER_ONBOARDED = "OWNER_ONBOARDED",
  OWNER_SUSPENDED = "OWNER_SUSPENDED",
  OWNER_ACTIVATED = "OWNER_ACTIVATED",
  STORE_CREATED = "STORE_CREATED",
  STORE_UPDATED = "STORE_UPDATED",

  // Store Owner Operations
  PRODUCT_CREATED = "PRODUCT_CREATED",
  PRODUCT_UPDATED = "PRODUCT_UPDATED",
  PRODUCT_DELETED = "PRODUCT_DELETED",
  INVENTORY_ADJUSTED = "INVENTORY_ADJUSTED",
  APPOINTMENT_CONFIRMED = "APPOINTMENT_CONFIRMED",
  APPOINTMENT_CANCELLED = "APPOINTMENT_CANCELLED",
  APPOINTMENT_COMPLETED = "APPOINTMENT_COMPLETED",
  ORDER_STATUS_CHANGED = "ORDER_STATUS_CHANGED",
  PRESCRIPTION_REVIEWED = "PRESCRIPTION_REVIEWED",

  // Customer Operations
  CUSTOMER_REGISTERED = "CUSTOMER_REGISTERED",
  APPOINTMENT_BOOKED = "APPOINTMENT_BOOKED",
  ORDER_PLACED = "ORDER_PLACED",
  PRESCRIPTION_UPLOADED = "PRESCRIPTION_UPLOADED",
}

export interface LogAuditOptions {
  userId?: string;
  action: AuditAction | string;
  resource: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  action: string;
  resource: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: Date;
  user?: {
    email: string | null;
    phone: string | null;
    role: string;
  } | null;
}

// In-memory fallback logs for dev resilience
const inMemoryAuditLogs: AuditLogEntry[] = [];

export class AuditService {
  /**
   * Appends an immutable audit log entry.
   */
  static async log(options: LogAuditOptions): Promise<void> {
    const entry: AuditLogEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: options.userId || null,
      action: options.action,
      resource: options.resource,
      ipAddress: options.ipAddress || null,
      userAgent: options.userAgent || null,
      details: options.details ? JSON.stringify(options.details) : null,
      createdAt: new Date(),
    };

    // Always push to in-memory first for instant sync
    inMemoryAuditLogs.unshift(entry);
    if (inMemoryAuditLogs.length > 500) inMemoryAuditLogs.pop();

    try {
      await withDbTimeout(
        prisma.auditLog.create({
          data: {
            id: entry.id,
            userId: entry.userId,
            action: entry.action,
            resource: entry.resource,
            ipAddress: entry.ipAddress,
            userAgent: entry.userAgent,
            details: options.details ? (options.details as any) : undefined,
            createdAt: entry.createdAt,
          },
        }),
        600
      );
      Logger.info(`[AuditTrail] ${entry.action} on ${entry.resource}`);
    } catch {
      // In-memory already recorded
      Logger.info(`[AuditTrail (InMem)] ${entry.action} on ${entry.resource}`);
    }
  }

  /**
   * Strictly Read-Only query for Super Admin compliance inspection.
   */
  static async getAuditLogs(params: {
    page?: number;
    limit?: number;
    action?: string;
    userId?: string;
  }): Promise<{ total: number; logs: AuditLogEntry[] }> {
    const page = Math.max(1, params.page || 1);
    const limit = Math.min(100, Math.max(1, params.limit || 30));
    const skip = (page - 1) * limit;

    try {
      const where: Record<string, unknown> = {};
      if (params.action) where.action = params.action;
      if (params.userId) where.userId = params.userId;

      const [total, logs] = await withDbTimeout(
        Promise.all([
          prisma.auditLog.count({ where }),
          prisma.auditLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            include: {
              user: {
                select: {
                  email: true,
                  phone: true,
                  role: true,
                },
              },
            },
          }),
        ]),
        800
      );

      return {
        total,
        logs: logs as unknown as AuditLogEntry[],
      };
    } catch {
      let filtered = inMemoryAuditLogs;
      if (params.action) {
        filtered = filtered.filter((l) => l.action.toLowerCase().includes(params.action!.toLowerCase()));
      }
      if (params.userId) {
        filtered = filtered.filter((l) => l.userId === params.userId);
      }

      return {
        total: filtered.length,
        logs: filtered.slice(skip, skip + limit),
      };
    }
  }
}
