import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import { prisma } from "../utils/prisma.js";
import { CryptoUtil } from "../utils/crypto.js";
import { Role } from "../constants/index.js";
import { AuditService } from "./audit.service.js";

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

export class TokenService {
  /**
   * Generates a short-lived access JWT token (15 minutes)
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
   * Creates a new refresh token and saves its hash in the database with session family tracking
   */
  static async createRefreshTokenSession(
    userId: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string,
    familyId?: string
  ): Promise<string> {
    const rawRefreshToken = CryptoUtil.generateSecureToken(48);
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);
    const sessionFamilyId = familyId || CryptoUtil.generateSecureToken(16);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + config.jwt.refreshExpiresInDays);

    await prisma.refreshTokenSession.create({
      data: {
        userId,
        tokenHash,
        familyId: sessionFamilyId,
        deviceInfo,
        ipAddress,
        userAgent,
        expiresAt,
        isRevoked: false,
      },
    });

    return rawRefreshToken;
  }

  /**
   * Rotates a refresh token with session family tracking and reuse detection
   */
  static async rotateRefreshToken(
    rawRefreshToken: string,
    deviceInfo?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string; user: { id: string; role: Role; email: string | null; storeId?: string | null } }> {
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);

    const session = await prisma.refreshTokenSession.findUnique({
      where: { tokenHash },
      include: {
        user: {
          include: { ownerProfile: true },
        },
      },
    });

    if (!session) {
      const err = new Error("Invalid refresh token session. Please log in again.") as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = "INVALID_SESSION";
      throw err;
    }

    // Reuse detection: if token is already revoked, someone is attempting to replay an old token!
    if (session.isRevoked) {
      if (session.familyId) {
        await prisma.refreshTokenSession.updateMany({
          where: { familyId: session.familyId },
          data: { isRevoked: true },
        });
      } else {
        await prisma.refreshTokenSession.updateMany({
          where: { userId: session.userId },
          data: { isRevoked: true },
        });
      }

      await AuditService.log({
        userId: session.userId,
        action: "REFRESH_TOKEN_REUSE_DETECTED",
        resource: `RefreshTokenSession:${session.id}`,
        ipAddress,
        userAgent,
        details: {
          familyId: session.familyId,
          tokenId: session.id,
          reason: "Revoked refresh token presented for rotation (session family revoked)",
        },
      });

      const err = new Error("Suspicious session activity detected. Token reuse detected. All active sessions have been invalidated. Please log in again.") as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = "TOKEN_REUSE_DETECTED";
      throw err;
    }

    // Check expiration
    if (session.expiresAt < new Date()) {
      await prisma.refreshTokenSession.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      const err = new Error("Refresh token has expired. Please log in again.") as Error & { statusCode: number; code: string };
      err.statusCode = 401;
      err.code = "SESSION_EXPIRED";
      throw err;
    }

    // Revoke the old token (one-time use rotation)
    await prisma.refreshTokenSession.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    const userRole = session.user.role as Role;
    const storeId = session.user.ownerProfile?.storeId || null;

    // Continue the same session family for rotation continuity
    const sessionFamilyId = session.familyId || CryptoUtil.generateSecureToken(16);

    const newRefreshToken = await this.createRefreshTokenSession(
      session.userId,
      deviceInfo || session.deviceInfo || undefined,
      ipAddress || session.ipAddress || undefined,
      userAgent || session.userAgent || undefined,
      sessionFamilyId
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

  /**
   * Revokes a single refresh token session (Logout)
   */
  static async revokeSession(rawRefreshToken: string): Promise<void> {
    const tokenHash = CryptoUtil.hashToken(rawRefreshToken);
    await prisma.refreshTokenSession.updateMany({
      where: { tokenHash },
      data: { isRevoked: true },
    });
  }

  /**
   * Revokes all active refresh token sessions for a user (Logout All Devices)
   */
  static async revokeAllUserSessions(userId: string): Promise<void> {
    await prisma.refreshTokenSession.updateMany({
      where: { userId },
      data: { isRevoked: true },
    });
  }
}
