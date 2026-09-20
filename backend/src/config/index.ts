import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory and workspace root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

// Ensure process.env.DATABASE_URL is always defined for Prisma
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/nayantara_opticals?schema=public";
}

export const config = {
  port: parseInt(process.env.PORT || "5000", 10),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  clientUrl: process.env.CLIENT_URL || "http://localhost:3000",

  // Database & Redis
  databaseUrl: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/nayantara_opticals?schema=public",
  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  // Authentication
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "nayantara_super_secret_access_jwt_key_2026",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "nayantara_super_secret_refresh_jwt_key_2026",
    accessExpiresIn: "15m",
    refreshExpiresInDays: 7,
  },

  // Super Admin Default Credentials (for seeding)
  admin: {
    email: process.env.SUPER_ADMIN_EMAIL || "admin@nayantaraopticals.com",
    password: process.env.SUPER_ADMIN_PASSWORD || "Admin@Nayantara2026!",
    phone: process.env.SUPER_ADMIN_PHONE || "+919876543210",
    name: "Super Admin",
  },

  // AWS S3 / Cloudflare R2
  s3: {
    bucketName: process.env.AWS_S3_BUCKET || "nayantara-prescriptions-private",
    region: process.env.AWS_REGION || "ap-south-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    endpoint: process.env.AWS_ENDPOINT || undefined, // For Cloudflare R2 / MinIO
    signedUrlExpirySeconds: 300, // 5 minutes
    maxFileSizeMb: 10,
  },

  // Razorpay
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
    keySecret: process.env.RAZORPAY_KEY_SECRET || "rzp_secret_placeholder",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || "webhook_secret_placeholder",
  },

  // Notification Providers (Email, SMS, WhatsApp)
  notifications: {
    email: {
      provider: process.env.EMAIL_PROVIDER || "resend", // "resend" | "ses" | "mock"
      fromAddress: process.env.EMAIL_FROM || "no-reply@nayantaraopticals.com",
      apiKey: process.env.RESEND_API_KEY || "",
    },
    sms: {
      provider: process.env.SMS_PROVIDER || "fast2sms", // "fast2sms" | "twilio" | "mock"
      apiKey: process.env.FAST2SMS_API_KEY || "",
    },
    whatsapp: {
      provider: process.env.WHATSAPP_PROVIDER || "meta", // "meta" | "mock"
      apiToken: process.env.WHATSAPP_API_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
    },
  },

  // Business Metadata
  business: {
    name: "Nayantara Opticals",
    address: "WZ-27, Shop No.1, Om Vihar, Phase-1, Near Metro Pillar 703, Uttam Nagar, New Delhi-110059",
    contactPhone: "+919876543210",
    supportEmail: "support@nayantaraopticals.com",
  },
};
