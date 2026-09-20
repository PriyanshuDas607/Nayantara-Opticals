import { NotificationChannel, NotificationStatus } from "@prisma/client";
import { prisma } from "../utils/prisma.js";
import { Logger } from "../utils/logger.js";
import { config } from "../config/index.js";

export interface SendNotificationOptions {
  userId?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  channels: NotificationChannel[];
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
  forceTransactional?: boolean;
}

export class NotificationService {
  /**
   * Sends a notification across specified channels, saves records, and logs delivery status
   */
  static async send(options: SendNotificationOptions): Promise<void> {
    const { userId, recipientPhone, recipientEmail, channels, title, body, metadata } = options;

    let notificationRecordId: string | undefined;

    if (userId) {
      // Check notification preferences
      const preferences = await prisma.notificationPreference.findUnique({
        where: { userId },
      });

      const notification = await prisma.notification.create({
        data: {
          userId,
          channel: channels[0] || NotificationChannel.IN_APP,
          title,
          body,
          metadata: metadata ? JSON.stringify(metadata) : undefined,
          status: NotificationStatus.QUEUED,
        },
      });
      notificationRecordId = notification.id;

      // Filter channels if user opted out (unless forceTransactional)
      if (!options.forceTransactional && preferences) {
        // e.g. marketing checks
      }
    }

    // Execute delivery for each channel
    for (const channel of channels) {
      try {
        if (channel === NotificationChannel.EMAIL && recipientEmail) {
          await this.deliverEmail(recipientEmail, title, body);
        } else if (channel === NotificationChannel.SMS && recipientPhone) {
          await this.deliverSms(recipientPhone, body);
        } else if (channel === NotificationChannel.WHATSAPP && recipientPhone) {
          await this.deliverWhatsapp(recipientPhone, body);
        } else if (channel === NotificationChannel.IN_APP) {
          // Already saved to Notification table
        }

        if (notificationRecordId) {
          await prisma.notificationDeliveryLog.create({
            data: {
              notificationId: notificationRecordId,
              channel,
              recipient: recipientEmail || recipientPhone || userId || "in-app",
              status: NotificationStatus.DELIVERED,
              deliveredAt: new Date(),
            },
          });
        }
      } catch (error) {
        Logger.error(`Failed to deliver notification via ${channel}`, error);
        if (notificationRecordId) {
          await prisma.notificationDeliveryLog.create({
            data: {
              notificationId: notificationRecordId,
              channel,
              recipient: recipientEmail || recipientPhone || userId || "unknown",
              status: NotificationStatus.FAILED,
              errorMessage: (error as Error).message,
            },
          });
        }
      }
    }

    if (notificationRecordId) {
      await prisma.notification.update({
        where: { id: notificationRecordId },
        data: { status: NotificationStatus.SENT },
      });
    }
  }

  // --- Specific Channel Dispatchers ---

  private static async deliverEmail(to: string, subject: string, content: string): Promise<void> {
    Logger.info(`[Email Service] Sending email to ${to}: "${subject}"`);
    // In production, integrate Resend, AWS SES, or SendGrid
    // Resend snippet: await resend.emails.send({ from: config.notifications.email.fromAddress, to, subject, html: content });
  }

  private static async deliverSms(phone: string, text: string): Promise<void> {
    Logger.info(`[SMS Service] Sending SMS to ${phone}: "${text}"`);
    // In production, integrate Fast2SMS / Twilio
  }

  private static async deliverWhatsapp(phone: string, text: string): Promise<void> {
    Logger.info(`[WhatsApp Service] Sending WhatsApp message to ${phone}: "${text}"`);
    // In production, integrate Meta WhatsApp Cloud API with approved templates
  }

  // --- Convenience Template Alerts ---

  /**
   * Alert sent to owner/admin on new appointment booking
   */
  static async notifyOwnerNewAppointment(data: {
    ownerPhone?: string;
    customerName: string;
    customerPhone: string;
    date: string;
    timeSlot: string;
    appointmentType: string;
  }) {
    const phone = data.ownerPhone || config.business.contactPhone;
    const body = `New appointment booked at NAYANTARA OPTICALS.\nCustomer: ${data.customerName}\nPhone: ${data.customerPhone}\nDate: ${data.date}\nSlot: ${data.timeSlot}\nType: ${data.appointmentType}`;

    await this.send({
      recipientPhone: phone,
      channels: [NotificationChannel.WHATSAPP, NotificationChannel.SMS],
      title: "New Appointment Booked",
      body,
      forceTransactional: true,
    });
  }

  /**
   * Alert sent to owner/admin on new order received
   */
  static async notifyOwnerNewOrder(data: {
    ownerPhone?: string;
    orderNumber: string;
    customerName: string;
    amount: number;
    paymentMethod: string;
    status: string;
  }) {
    const phone = data.ownerPhone || config.business.contactPhone;
    const amountInr = (data.amount / 100).toFixed(2);
    const body = `New order received at NAYANTARA OPTICALS.\nOrder: ${data.orderNumber}\nCustomer: ${data.customerName}\nAmount: INR ${amountInr}\nPayment: ${data.paymentMethod}\nStatus: ${data.status}`;

    await this.send({
      recipientPhone: phone,
      channels: [NotificationChannel.WHATSAPP, NotificationChannel.SMS],
      title: "New Order Placed",
      body,
      forceTransactional: true,
    });
  }
}
