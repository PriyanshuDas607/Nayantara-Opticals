import { Request, Response, NextFunction } from "express";
import { PaymentService } from "../services/payment.service.js";

export class WebhookController {
  static async handleRazorpay(req: Request, res: Response, next: NextFunction) {
    try {
      const signature = req.headers["x-razorpay-signature"] as string;
      const rawBody = JSON.stringify(req.body);

      const result = await PaymentService.handleWebhook(rawBody, signature, req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
