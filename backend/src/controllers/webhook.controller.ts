import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";

export class WebhookController {
  static async handleRazorpay(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = (req.headers["x-razorpay-signature"] as string) || "";
      const eventHeaderId = req.headers["x-razorpay-event-id"] as string | undefined;

      // Extract raw body bytes without re-encoding to preserve HMAC integrity
      const rawBodyBuffer = Buffer.isBuffer(req.body)
        ? req.body
        : Buffer.from(typeof req.body === "string" ? req.body : JSON.stringify(req.body || {}), "utf-8");
      const rawBodyString = rawBodyBuffer.toString("utf-8");

      let payload: any;
      try {
        payload = JSON.parse(rawBodyString);
      } catch {
        return res.status(400).json({ success: false, message: "Invalid JSON webhook payload" });
      }

      // Event ID: x-razorpay-event-id header takes precedence, then event_id, id, or fallback
      const eventId =
        eventHeaderId ||
        payload.event_id ||
        payload.id ||
        (payload.payload?.payment?.entity?.id ? `evt_${payload.payload.payment.entity.id}_${payload.event}` : undefined) ||
        `evt_${Date.now()}`;

      const result = await PaymentService.handleWebhook({
        rawBody: rawBodyString,
        signature,
        payload,
        eventId,
      });

      return res.status(200).json(result);
    } catch (error: any) {
      if (error.statusCode === 400 || error.message?.includes("Invalid webhook signature")) {
        return res.status(400).json({ success: false, message: error.message || "Invalid webhook signature" });
      }
      next(error);
    }
  }
}
