import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { Server } from "http";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app.js";
import { TokenService } from "../src/services/token.service.js";
import { Role } from "../src/constants/index.js";
import { prisma } from "../src/utils/prisma.js";
import { config } from "../src/config/index.js";
import { AuditService } from "../src/services/audit.service.js";

describe("Phase 0.7: Session Security, 15-Minute Access Tokens & Refresh Reuse Detection", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve());
    });
  });

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("Access Token Expiry", () => {
    it("should issue access tokens that expire in 15 minutes (900 seconds)", () => {
      const token = TokenService.generateAccessToken({
        userId: "user-test-1",
        role: Role.CUSTOMER,
      });

      const decoded = jwt.decode(token) as { iat: number; exp: number };
      expect(decoded).toBeDefined();
      expect(decoded.exp - decoded.iat).toBe(15 * 60); // exactly 900 seconds
    });
  });

  describe("Refresh Token Rotation & Family Tracking", () => {
    it("should rotate refresh token and revoke the previous one", async () => {
      const mockSession = {
        id: "session-1",
        userId: "user-test-1",
        tokenHash: "hashed-token-1",
        familyId: "family-abc",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user: {
          id: "user-test-1",
          email: "user@example.com",
          role: Role.CUSTOMER,
          ownerProfile: null,
        },
      };

      vi.spyOn(prisma.refreshTokenSession, "findUnique").mockResolvedValueOnce(mockSession as any);
      const updateSpy = vi.spyOn(prisma.refreshTokenSession, "update").mockResolvedValueOnce({} as any);
      const createSpy = vi.spyOn(prisma.refreshTokenSession, "create").mockResolvedValueOnce({} as any);

      const result = await TokenService.rotateRefreshToken("raw-refresh-token-1");

      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.id).toBe("user-test-1");

      // Verifies old token was revoked
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: "session-1" },
        data: { isRevoked: true },
      });

      // Verifies new token was created under the same family
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: "user-test-1",
            familyId: "family-abc",
            isRevoked: false,
          }),
        })
      );
    });

    it("should detect reuse of a revoked token, revoke the entire session family, and log an audit alert", async () => {
      const mockRevokedSession = {
        id: "session-old-compromised",
        userId: "user-victim-1",
        tokenHash: "hashed-token-stolen",
        familyId: "family-stolen-123",
        isRevoked: true, // Already revoked!
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user: {
          id: "user-victim-1",
          email: "victim@example.com",
          role: Role.CUSTOMER,
          ownerProfile: null,
        },
      };

      vi.spyOn(prisma.refreshTokenSession, "findUnique").mockResolvedValueOnce(mockRevokedSession as any);
      const updateManySpy = vi.spyOn(prisma.refreshTokenSession, "updateMany").mockResolvedValueOnce({ count: 3 } as any);
      const auditSpy = vi.spyOn(AuditService, "log").mockResolvedValueOnce();

      await expect(
        TokenService.rotateRefreshToken("stolen-raw-refresh-token", "device", "1.2.3.4", "hacker-bot")
      ).rejects.toThrow("Token reuse detected");

      // Verify all sessions in that family were revoked immediately
      expect(updateManySpy).toHaveBeenCalledWith({
        where: { familyId: "family-stolen-123" },
        data: { isRevoked: true },
      });

      // Verify an audit log alert was recorded
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-victim-1",
          action: "REFRESH_TOKEN_REUSE_DETECTED",
        })
      );
    });
  });

  describe("Cookie-Based Endpoints Integration", () => {
    it("should rotate token via POST /api/v1/auth/refresh and return Set-Cookie headers", async () => {
      const mockSession = {
        id: "session-cookie-1",
        userId: "user-cookie-1",
        tokenHash: "hash-c1",
        familyId: "fam-c1",
        isRevoked: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        user: {
          id: "user-cookie-1",
          email: "cookie@example.com",
          role: Role.CUSTOMER,
          ownerProfile: null,
        },
      };

      vi.spyOn(prisma.refreshTokenSession, "findUnique").mockResolvedValueOnce(mockSession as any);
      vi.spyOn(prisma.refreshTokenSession, "update").mockResolvedValueOnce({} as any);
      vi.spyOn(prisma.refreshTokenSession, "create").mockResolvedValueOnce({} as any);

      const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "refreshToken=valid-raw-refresh-token",
        },
      });

      expect(res.status).toBe(200);
      const rawCookies = res.headers.get("set-cookie");
      expect(rawCookies).toBeDefined();
      expect(rawCookies).toContain("accessToken=");
      expect(rawCookies).toContain("refreshToken=");
      expect(rawCookies).toContain("HttpOnly");
      expect(rawCookies).toContain("SameSite=Lax");
    });

    it("should clear both auth cookies on POST /api/v1/auth/logout", async () => {
      vi.spyOn(prisma.refreshTokenSession, "updateMany").mockResolvedValueOnce({ count: 1 } as any);

      const res = await fetch(`${baseUrl}/api/v1/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: "refreshToken=some-token; accessToken=some-access",
        },
      });

      expect(res.status).toBe(200);
      const setCookies = res.headers.get("set-cookie") || "";
      expect(setCookies).toContain("accessToken=;");
      expect(setCookies).toContain("refreshToken=;");
    });
  });
});
