import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(2, "Product name is required"),
  category: z.string().optional(),
  categoryId: z.string().optional(),
  brand: z.string().optional(),
  brandId: z.string().optional(),
  price: z.number().positive().optional(),
  pricePaise: z.number().int().positive().optional(),
  originalPrice: z.number().positive().optional(),
  salePricePaise: z.number().int().positive().optional(),
  sku: z.string().optional(),
  description: z.string().optional(),
  frameShape: z.string().optional(),
  frameMaterial: z.string().optional(),
  frameType: z.string().optional(),
  gender: z.string().optional(),
  color: z.string().optional(),
  size: z.string().optional(),
  image: z.string().optional(),
  requiresPrescription: z.boolean().optional(),
  virtualTryOnEnabled: z.boolean().optional(),
  tryOnAssetUrl: z.string().url().optional().or(z.literal("")),
  isFeatured: z.boolean().optional(),
  isBestSeller: z.boolean().optional(),
  stockCount: z.number().int().nonnegative().optional(),
  initialStock: z.number().int().nonnegative().optional(),
  imageUrls: z.array(z.string()).optional(),
});

export const bookAppointmentSchema = z.object({
  storeId: z.string().uuid().optional(),
  type: z.enum([
    "EYE_TEST",
    "FRAME_CONSULTATION",
    "LENS_CONSULTATION",
    "PRESCRIPTION_CONSULTATION",
    "CONTACT_LENS_CONSULTATION",
    "OTHER",
  ]),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  timeSlot: z.string().min(3, "Time slot is required (e.g. 10:30 AM)"),
  notes: z.string().optional(),
});

export const prescriptionUploadUrlSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
});

export const prescriptionCompleteUploadSchema = z.object({
  objectKey: z.string().min(1, "Storage object key is required"),
  originalFileName: z.string().min(1, "Original file name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  sizeBytes: z.number().int().positive("Size must be greater than 0"),
  appointmentId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

export const manualPrescriptionSchema = z.object({
  appointmentId: z.string().uuid().optional(),
  orderId: z.string().uuid().optional(),
  sphereOD: z.string().optional(),
  cylinderOD: z.string().optional(),
  axisOD: z.string().optional(),
  sphereOS: z.string().optional(),
  cylinderOS: z.string().optional(),
  axisOS: z.string().optional(),
  addition: z.string().optional(),
  pd: z.string().optional(),
  notes: z.string().optional(),
});

export const createOrderSchema = z.object({
  addressId: z.string().uuid("Valid delivery address ID is required"),
  paymentMethod: z.enum(["COD", "RAZORPAY"]),
  idempotencyKey: z.string().optional(),
  prescriptionId: z.string().uuid().optional(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().optional(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1, "Order must contain at least one item"),
});

export const verifyPaymentSchema = z.object({
  orderId: z.string().uuid(),
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export const trackAnalyticsEventSchema = z.object({
  anonymousId: z.string().min(1, "Anonymous ID is required"),
  eventName: z.string().min(1, "Event name is required"),
  pagePath: z.string().min(1, "Page path is required"),
  pageTitle: z.string().optional(),
  productId: z.string().optional(),
  activeDurationSec: z.number().int().nonnegative().optional(),
  metadata: z.record(z.unknown()).optional(),
  deviceType: z.string().optional(),
  browser: z.string().optional(),
});
