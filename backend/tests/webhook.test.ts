import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import crypto from "crypto";
import { Server } from "http";
import { createApp } from "../src/app.js";
import { CryptoUtil } from "../src/utils/crypto.js";
import { PaymentService } from "../src/services/payment.service.js";
import { prisma } from "../src/utils/prisma.js";
import { config } from "../src/config/index.js";

describe("Phase 0.1: Razorpay Webhook Security & Idempotency", () => {
  const secret = config.razorpay.webhookSecret || "webhook_secret_placeholder";
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

  describe("CryptoUtil.verifyHmacSha256 - Timing and Length Security", () => {
    it("should return false instead of throwing RangeError on length mismatch", () => {
      const data = "sample_webhook_payload";
      const wrongLengthSig = "abc"; // much shorter than 64-char sha256 hex
      expect(() => {
        const result = CryptoUtil.verifyHmacSha256(data, wrongLengthSig, secret);
        expect(result).toBe(false);
      }).not.toThrow();
    });

    it("should return false on empty or undefined signature or secret", () => {
      expect(CryptoUtil.verifyHmacSha256("data", "", secret)).toBe(false);
      expect(CryptoUtil.verifyHmacSha256("data", "sig", "")).toBe(false);
    });

    it("should return true for valid HMAC and false for 1-byte tampered payload", () => {
      const payloadString = JSON.stringify({ event: "payment.captured", id: "pay_123" });
      const validHmac = crypto.createHmac("sha256", secret).update(payloadString).digest("hex");

      expect(CryptoUtil.verifyHmacSha256(payloadString, validHmac, secret)).toBe(true);

      // Tamper 1 byte
      const tamperedPayload = JSON.stringify({ event: "payment.captured", id: "pay_124" });
      expect(CryptoUtil.verifyHmacSha256(tamperedPayload, validHmac, secret)).toBe(false);
    });
  });

  describe("Webhook HTTP Endpoint End-to-End Verification", () => {
    it("should reject tampered or invalid signature with 400 Bad Request", async () => {
      const payload = { event: "payment.captured", payload: { payment: { entity: { id: "pay_tamper", order_id: "order_123" } } } };
      const rawBody = JSON.stringify(payload);
      const invalidSignature = "invalid_signature_hex_which_has_some_characters_and_does_not_match";

      const res = await fetch(`${baseUrl}/api/v1/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": invalidSignature,
          "x-razorpay-event-id": "evt_tamper_1",
        },
        body: rawBody,
      });

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.message).toContain("Invalid webhook signature");
    });

    it("should accept valid signed raw body and process successfully", async () => {
      const payload = {
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_valid_1", order_id: "order_valid_1" } } },
      };
      const rawBody = JSON.stringify(payload);
      const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      // Mock prisma calls for this test
      vi.spyOn(prisma.paymentWebhookEvent, "findUnique").mockResolvedValueOnce(null);
      vi.spyOn(prisma.paymentWebhookEvent, "create").mockResolvedValueOnce({
        id: "mock_uuid",
        eventId: "evt_valid_1",
        eventType: "payment.captured",
        payload: payload as any,
        isProcessed: true,
        processedAt: new Date(),
        createdAt: new Date(),
      });
      vi.spyOn(prisma.payment, "updateMany").mockResolvedValueOnce({ count: 1 });
      vi.spyOn(prisma.order, "updateMany").mockResolvedValueOnce({ count: 1 });

      const res = await fetch(`${baseUrl}/api/v1/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature,
          "x-razorpay-event-id": "evt_valid_1",
        },
        body: rawBody,
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("success");
    });

    it("should be idempotent: replaying same eventId returns already_processed without mutation", async () => {
      const payload = {
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_replay_1", order_id: "order_replay_1" } } },
      };
      const rawBody = JSON.stringify(payload);
      const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      // Mock prisma finding an already processed event
      vi.spyOn(prisma.paymentWebhookEvent, "findUnique").mockResolvedValueOnce({
        id: "mock_uuid",
        eventId: "evt_replay_1",
        eventType: "payment.captured",
        payload: payload as any,
        isProcessed: true,
        processedAt: new Date(),
        createdAt: new Date(),
      });
      const createSpy = vi.spyOn(prisma.paymentWebhookEvent, "create");
      const paymentUpdateSpy = vi.spyOn(prisma.payment, "updateMany");

      const res = await fetch(`${baseUrl}/api/v1/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature,
          "x-razorpay-event-id": "evt_replay_1",
        },
        body: rawBody,
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("already_processed");
      expect(createSpy).not.toHaveBeenCalled();
      expect(paymentUpdateSpy).not.toHaveBeenCalled();
    });

    it("should handle concurrency race condition (P2002) gracefully and return already_processed", async () => {
      const payload = {
        event: "payment.captured",
        payload: { payment: { entity: { id: "pay_race_1", order_id: "order_race_1" } } },
      };
      const rawBody = JSON.stringify(payload);
      const validSignature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

      vi.spyOn(prisma.paymentWebhookEvent, "findUnique").mockResolvedValueOnce(null);
      const p2002Error: any = new Error("Unique constraint failed on the fields: (`eventId`)");
      p2002Error.code = "P2002";
      vi.spyOn(prisma.paymentWebhookEvent, "create").mockRejectedValueOnce(p2002Error);

      const res = await fetch(`${baseUrl}/api/v1/webhooks/razorpay`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-razorpay-signature": validSignature,
          "x-razorpay-event-id": "evt_race_1",
        },
        body: rawBody,
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.status).toBe("already_processed");
    });
  });
});
