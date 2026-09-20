import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../utils/prisma.js";
import { CryptoUtil } from "../utils/crypto.js";
import { Role } from "../constants/index.js";
import { Logger } from "../utils/logger.js";

export interface AccessTokenPayload {
  userId: string;
  role: Role;
  storeId?: string | null;
}

export interface TwoFactorTokenPayload {
  userId: string;
  role: Role;
  storeId?: string | null;
  purpose: "2FA_VERIFICATION";
}

interface DevSession {
  userId: string;
  tokenHash: string;
  role: Role;
  email: string | null;
  storeId?: string | null;
  expiresAt: Date;
  isRevoked: boolean;
}

const devSessions = new Map<string, DevSession>();

export class TokenService {
  /**
   * Generates a short-lived access JWT token
   */
  static generateAccessToken(payload: AccessTokenPayload): string {
    return jwt.sign(payload, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiresIn as jwt.SignOptions["expiresIn"],
    });
  }

  /**
   * Verifies an access token
   */
  static verifyAccessToken(token: string): AccessTokenPayload {
    return jwt.verify(token, config.jwt.accessSecret) as AccessTokenPayload;
  }

  /**
   * Generates a 5-minute temporary token for 2FA completion
   */
  static generateTwoFactorToken(payload: Omit<TwoFactorTokenPayload, "purpose">): string {
    return jwt.sign(
      { ...payload, purpose: "2FA_VERIFICATION" },
      config.jwt.accessSecret,
      { expiresIn: "5m" }
    );
  }

  /**
   * Verifies a 2FA temporary token
   */
  static verifyTwoFactorToken(token: string): TwoFactorTokenPayload {
    const decoded = jwt.verify(token, config.jwt.accessSecret) as TwoFactorTokenPayload;
    if (decoded.purpose !== "2FA_VERIFICATION") {
      throw new Error("Invalid token type for 2FA verification");
    }
    return decoded;
  }

  /**
   * Creates a new refresh token and saves its hash in the database (or dev fallback)
   */
  static async createRefreshTokenSession(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
    devMetadata?: { role: Role; email: string | null; storeId?: string | null }
  ): Promise<string> {
    const rawRefreshToken = CryptoUtil.generateSecureToken(48);
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

    try {
      await prisma.refreshTokenSession.create({
        data: {
          userId,
          tokenHash,
          deviceInfo,
          ipAddress,
          userAgent,
          expiresAt,
          isRevoked: false,
        },
      });
    } catch {
      Logger.warn("Database unavailable for session storage; using in-memory dev session");
      devSessions.set(tokenHash, {
        userId,
        tokenHash,
        role: devMetadata?.role || Role.SUPER_ADMIN,
        email: devMetadata?.email || null,
        storeId: devMetadata?.storeId || null,
        expiresAt,
        isRevoked: false,
      });
    }

    return rawRefreshToken;
  }

  /**
   * Rotates a refresh token with reuse detection
   */
  static async rotateRefreshToken(
    rawRefreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: { id: string; role: Role; email: string | null; storeId?: string | null } }> {
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);

    try {
      const session = await prisma.refreshTokenSession.findUnique({
        where: { tokenHash },
        include: {
          user: {
            include: { ownerProfile: true },
          },
        },
      });

      if (session) {
        if (session.isRevoked || session.expiresAt < new Date()) {
          // Token reuse or expired token detected: revoke all sessions for safety
          await prisma.refreshTokenSession.updateMany({
            where: { userId: session.userId },
            data: { isRevoked: true },
          });
          throw new Error("Suspicious session activity detected. All active sessions invalidated. Please log in again.");
        }

        // Revoke the old token
        await prisma.refreshTokenSession.update({
          where: { id: session.id },
          data: { isRevoked: true },
        });

        const userRole = session.user.role as Role;
        const storeId = session.user.ownerProfile?.storeId || null;

        const newRefreshToken = await this.createRefreshTokenSession(
          session.userId,
          deviceInfo || session.deviceInfo || undefined,
          ipAddress,
          userAgent,
          { role: userRole, email: session.user.email, storeId }
        );

        const newAccessToken = this.generateAccessToken({
          userId: session.user.id,
          role: userRole,
          storeId,
        });

        return {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          user: {
            id: session.user.id,
            role: userRole,
            email: session.user.email,
            storeId,
          },
        };
      }
    } catch (dbErr) {
      Logger.warn("Database query failed during token rotation, checking in-memory store");
    }

    // Check dev fallback sessions
    const devSession = devSessions.get(tokenHash);
    if (!devSession || devSession.isRevoked || devSession.expiresAt < new Date()) {
      throw new Error("Invalid or expired refresh token");
    }

    devSession.isRevoked = true;
    const newRefreshToken = await this.createRefreshTokenSession(
      devSession.userId,
      deviceInfo,
      ipAddress,
      userAgent,
      { role: devSession.role, email: devSession.email, storeId: devSession.storeId }
    );

    const newAccessToken = this.generateAccessToken({
      userId: devSession.userId,
      role: devSession.role,
      storeId: devSession.storeId,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: devSession.userId,
        role: devSession.role,
        email: devSession.email,
        storeId: devSession.storeId,
      },
    };
  }

  /**
   * Revokes a single refresh token session (Logout)
   */
  static async revokeSession(rawRefreshToken: string): Promise<void> {
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);
    try {
      await prisma.refreshTokenSession.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } catch {
      // In-memory fallback
      const dev = devSessions.get(tokenHash);
      if (dev) dev.isRevoked = true;
    }
  }

  /**
   * Revokes all active refresh token sessions for a user (Logout All Devices)
   */
  static async revokeAllUserSessions(userId: string): Promise<void> {
    try {
      await prisma.refreshTokenSession.updateMany({
        where: { userId },
        data: { isRevoked: true },
      });
    } catch {
      // In-memory fallback
      for (const dev of devSessions.values()) {
        if (dev.userId === userId) dev.isRevoked = true;
      }
    }
  }
}
