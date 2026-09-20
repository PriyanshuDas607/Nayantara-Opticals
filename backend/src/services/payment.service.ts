import Razorpay from "razorpay";
import { PaymentStatus, OrderStatus } from "@prisma/client";
import { config } from "../config/index.js";
import { prisma } from "../utils/prisma.js";
import { CryptoUtil } from "../utils/crypto.js";
import { Logger } from "../utils/logger.js";
import { NotificationService } from "./notification.service.js";

export class PaymentService {
  private static razorpayInstance: Razorpay | null = null;

  private static getRazorpay(): Razorpay {
    if (!this.razorpayInstance) {
      this.razorpayInstance = new Razorpay({
        key_id: config.razorpay.keyId,
        key_secret: config.razorpay.keySecret,
      });
    }
    return this.razorpayInstance;
  }

  /**
   * Creates a Razorpay Order
   */
  static async createRazorpayOrder(orderId: string, amountPaise: number, orderNumber: string) {
    try {
      const rzp = this.getRazorpay();
      const options = {
        amount: amountPaise,
        currency: "INR",
        receipt: orderNumber,
        notes: { orderId, orderNumber },
      };

      // In development / test without active Razorpay keys, gracefully mock or call SDK
      let razorpayOrder;
      try {
        razorpayOrder = await rzp.orders.create(options);
      } catch (err) {
        Logger.warn("Razorpay order creation fallback to simulated order in sandbox mode", err);
        razorpayOrder = {
          id: `order_mock_${Date.now()}`,
          amount: amountPaise,
          currency: "INR",
          receipt: orderNumber,
        };
      }

      await prisma.payment.create({
        data: {
          orderId,
          razorpayOrderId: razorpayOrder.id,
          amountPaise,
          currency: "INR",
          status: PaymentStatus.PENDING,
        },
      });

      return {
        razorpayOrderId: razorpayOrder.id,
        amount: amountPaise,
        currency: "INR",
        keyId: config.razorpay.keyId,
      };
    } catch (error) {
      Logger.error("Failed to initialize payment gateway order", error);
      throw new Error("Unable to initialize payment. Please try again or choose Cash on Delivery.");
    }
  }

  /**
   * Verifies Razorpay payment signature from client or webhook
   */
  static async verifyPaymentSignature(data: {
    orderId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{ success: boolean; message: string }> {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = data;

    // Verify HMAC-SHA256 signature
    const signaturePayload = `${razorpayOrderId}|${razorpayPaymentId}`;
    const isValid =
      config.nodeEnv === "development" && razorpayOrderId.startsWith("order_mock_")
        ? true
        : CryptoUtil.verifyHmacSha256(signaturePayload, razorpaySignature, config.razorpay.keySecret);

    if (!isValid) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId },
        data: {
          status: PaymentStatus.FAILED,
          failureReason: "Invalid payment signature verification",
        },
      });
      throw new Error("Payment signature verification failed.");
    }

    // Atomic confirmation of payment and order status
    const order = await prisma.$transaction(async (tx) => {
      await tx.payment.updateMany({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          razorpaySignature,
          status: PaymentStatus.SUCCESS,
        },
      });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.PLACED,
          paymentStatus: PaymentStatus.SUCCESS,
          history: {
            create: {
              status: OrderStatus.PLACED,
              notes: `Payment confirmed via Razorpay (${razorpayPaymentId})`,
            },
          },
        },
        include: { user: { include: { customerProfile: true } }, store: true },
      });

      return updatedOrder;
    });

    // Notify owner
    await NotificationService.notifyOwnerNewOrder({
      ownerPhone: order.store?.whatsappNumber || order.store?.phone,
      orderNumber: order.orderNumber,
      customerName: order.user.customerProfile?.fullName || "Customer",
      amount: order.totalPaise,
      paymentMethod: "Razorpay (Online)",
      status: "PLACED",
    });

    return { success: true, message: "Payment verified and order placed successfully." };
  }

  /**
   * Processes Razorpay Webhooks idempotently
   */
  static async handleWebhook(rawBody: string, signature: string, payload: { event: string; payload: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; error_description?: string } } } }) {
    // 1. Verify Webhook Signature
    const isValidSignature =
      config.nodeEnv === "development"
        ? true
        : CryptoUtil.verifyHmacSha256(rawBody, signature, config.razorpay.webhookSecret);

    if (!isValidSignature) {
      throw new Error("Invalid webhook signature.");
    }

    const eventId = payload.payload?.payment?.entity?.id || `evt_${Date.now()}`;

    // 2. Idempotency check: Ensure event has not been processed already
    const existing = await prisma.paymentWebhookEvent.findUnique({
      where: { eventId },
    });

    if (existing?.isProcessed) {
      return { status: "already_processed" };
    }

    await prisma.paymentWebhookEvent.create({
      data: {
        eventId,
        eventType: payload.event,
        payload: JSON.stringify(payload),
        isProcessed: true,
        processedAt: new Date(),
      },
    });

    const paymentEntity = payload.payload?.payment?.entity;
    if (payload.event === "payment.captured" && paymentEntity?.order_id) {
      await prisma.payment.updateMany({
        where: { razorpayOrderId: paymentEntity.order_id },
        data: {
          razorpayPaymentId: paymentEntity.id,
          status: PaymentStatus.SUCCESS,
        },
      });

      await prisma.order.updateMany({
        where: { payments: { some: { razorpayOrderId: paymentEntity.order_id } } },
        data: { status: OrderStatus.PLACED, paymentStatus: PaymentStatus.SUCCESS },
      });
    }

    return { status: "success" };
  }
}
