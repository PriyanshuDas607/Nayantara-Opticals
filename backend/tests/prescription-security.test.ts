import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { Server } from "http";
import { createApp } from "../src/app.js";
import { TokenService } from "../src/services/token.service.js";
import { Role } from "../src/constants/index.js";
import { prisma } from "../src/utils/prisma.js";
import { StorageService } from "../src/services/storage.service.js";
import { AuditService } from "../src/services/audit.service.js";

describe("Phase 0.4: Prescriptions Security & Authorization", () => {
  let server: Server;
  let baseUrl: string;

  const customerAToken = TokenService.generateAccessToken({
    userId: "cust-a",
    role: Role.CUSTOMER,
  });

  const customerBToken = TokenService.generateAccessToken({
    userId: "cust-b",
    role: Role.CUSTOMER,
  });

  const ownerToken = TokenService.generateAccessToken({
    userId: "owner-1",
    role: Role.OWNER,
  });

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

  describe("Direct Streaming Authentication Requirements", () => {
    it("should return 401 when accessing /:id/file without token", async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/rx-b-1/file`);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });

    it("should return 401 when accessing /raw/:objectKey without token", async () => {
      const res = await fetch(`${baseUrl}/api/v1/prescriptions/raw/prescriptions%2Ffile.pdf`);
      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("UNAUTHORIZED");
    });
  });

  describe("IDOR Ownership & Authorization Verification", () => {
    it("should return 403 when Customer A tries to view Customer B prescription", async () => {
      vi.spyOn(prisma.prescription, "findUnique").mockResolvedValueOnce({
        id: "rx-b-1",
        userId: "cust-b",
        fileUploadId: "upload-b-1",
        fileUpload: {
          id: "upload-b-1",
          objectKey: "prescriptions/b-file.pdf",
          originalFileName: "b-rx.pdf",
        },
      } as any);

      const res = await fetch(`${baseUrl}/api/v1/prescriptions/rx-b-1/file`, {
        headers: {
          Authorization: `Bearer ${customerAToken}`,
        },
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("should allow Customer B to view their own prescription and record AuditLog", async () => {
      vi.spyOn(prisma.prescription, "findUnique").mockResolvedValueOnce({
        id: "rx-b-1",
        userId: "cust-b",
        fileUploadId: "upload-b-1",
        fileUpload: {
          id: "upload-b-1",
          objectKey: "prescriptions/b-file.pdf",
          originalFileName: "b-rx.pdf",
        },
      } as any);

      vi.spyOn(StorageService, "getFile").mockResolvedValueOnce({
        buffer: Buffer.from("%PDF-1.4 test prescription content"),
        fileName: "b-rx.pdf",
        mimeType: "application/pdf",
      });

      const auditSpy = vi.spyOn(AuditService, "log").mockResolvedValueOnce();

      const res = await fetch(`${baseUrl}/api/v1/prescriptions/rx-b-1/file`, {
        headers: {
          Authorization: `Bearer ${customerBToken}`,
        },
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("application/pdf");
      const text = await res.text();
      expect(text).toContain("%PDF-1.4");

      expect(auditSpy).toHaveBeenCalledTimes(1);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "cust-b",
          action: "VIEW_PRESCRIPTION_FILE",
          resource: "Prescription:rx-b-1",
        })
      );
    });

    it("should allow Owner to view any customer prescription", async () => {
      vi.spyOn(prisma.prescription, "findUnique").mockResolvedValueOnce({
        id: "rx-b-1",
        userId: "cust-b",
        fileUploadId: "upload-b-1",
        fileUpload: {
          id: "upload-b-1",
          objectKey: "prescriptions/b-file.pdf",
          originalFileName: "b-rx.pdf",
        },
      } as any);

      vi.spyOn(StorageService, "getFile").mockResolvedValueOnce({
        buffer: Buffer.from("%PDF-1.4 staff prescription content"),
        fileName: "b-rx.pdf",
        mimeType: "application/pdf",
      });

      const auditSpy = vi.spyOn(AuditService, "log").mockResolvedValueOnce();

      const res = await fetch(`${baseUrl}/api/v1/prescriptions/rx-b-1/file`, {
        headers: {
          Authorization: `Bearer ${ownerToken}`,
        },
      });

      expect(res.status).toBe(200);
      expect(auditSpy).toHaveBeenCalledTimes(1);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "owner-1",
          action: "VIEW_PRESCRIPTION_FILE",
        })
      );
    });

    it("should authenticate browser download using ?token query parameter", async () => {
      vi.spyOn(prisma.prescription, "findUnique").mockResolvedValueOnce({
        id: "rx-b-1",
        userId: "cust-b",
        fileUploadId: "upload-b-1",
        fileUpload: {
          id: "upload-b-1",
          objectKey: "prescriptions/b-file.pdf",
          originalFileName: "b-rx.pdf",
        },
      } as any);

      vi.spyOn(StorageService, "getFile").mockResolvedValueOnce({
        buffer: Buffer.from("image dummy bytes"),
        fileName: "b-rx.png",
        mimeType: "image/png",
      });

      vi.spyOn(AuditService, "log").mockResolvedValueOnce();

      const res = await fetch(`${baseUrl}/api/v1/prescriptions/rx-b-1/file?token=${encodeURIComponent(customerBToken)}`);
      expect(res.status).toBe(200);
      expect(res.headers.get("content-type")).toBe("image/png");
    });
  });

  describe("Download URL Endpoint & IDOR Security", () => {
    it("should return 403 when customer attempts to get download URL for another customer prescription", async () => {
      vi.spyOn(prisma.prescription, "findUnique").mockResolvedValueOnce({
        id: "rx-b-1",
        userId: "cust-b",
        fileUploadId: "upload-b-1",
        fileUpload: {
          id: "upload-b-1",
          objectKey: "prescriptions/b-file.pdf",
          originalFileName: "b-rx.pdf",
        },
      } as any);

      const res = await fetch(`${baseUrl}/api/v1/prescriptions/rx-b-1/download-url`, {
        headers: {
          Authorization: `Bearer ${customerAToken}`,
        },
      });

      expect(res.status).toBe(403);
    });
  });
});
