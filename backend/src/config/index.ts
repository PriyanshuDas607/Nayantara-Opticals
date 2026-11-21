import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { z } from "zod";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from backend directory and workspace root
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

export const envSchema = z.object({
  PORT: z.string().optional().default("5000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  CLIENT_URL: z.string().url().optional().default("http://localhost:3000"),
  BACKEND_URL: z.string().optional(),
  RENDER_EXTERNAL_URL: z.string().optional(),
  CORS_ORIGINS: z.string().optional(),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional(),
  REDIS_URL: z.string().optional().default("redis://localhost:6379"),

  // Secrets: strictly required, NO hardcoded fallbacks
  JWT_ACCESS_SECRET: z.string().min(16, "JWT_ACCESS_SECRET must be at least 16 characters long"),
  JWT_REFRESH_SECRET: z.string().min(16, "JWT_REFRESH_SECRET must be at least 16 characters long"),
  SUPER_ADMIN_PASSWORD: z.string().min(8, "SUPER_ADMIN_PASSWORD must be at least 8 characters long"),
  SUPER_ADMIN_EMAIL: z.string().email().optional().default("admin@nayantaraopticals.com"),
  SUPER_ADMIN_PHONE: z.string().optional().default("+919876543210"),

  // Webhook Security: Explicit flag, strictly forbidden in production
  ALLOW_INSECURE_WEBHOOKS: z.enum(["true", "false"]).optional().default("false"),

  // Supabase Storage
  SUPABASE_URL: z.string().url().optional().default("https://zxiatmlrdfzfettbyqmj.supabase.co"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional().default(""),
  SUPABASE_ANON_KEY: z.string().optional().default(""),
  SUPABASE_STORAGE_BUCKET: z.string().optional().default("prescriptions"),

  // AWS S3 / Cloudflare R2
  AWS_ACCESS_KEY_ID: z.string().optional().default(""),
  AWS_SECRET_ACCESS_KEY: z.string().optional().default(""),
  AWS_REGION: z.string().optional().default("ap-south-1"),
  AWS_S3_BUCKET: z.string().optional().default("nayantara-prescriptions-private"),
  AWS_ENDPOINT: z.string().optional(),

  // Razorpay
  RAZORPAY_KEY_ID: z.string().optional().default("rzp_test_placeholder"),
  RAZORPAY_KEY_SECRET: z.string().optional().default("rzp_secret_placeholder"),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional().default("webhook_secret_placeholder"),

  // Third-party keys
  GEMINI_API_KEY: z.string().optional().default(""),
  GOOGLE_CLIENT_ID: z.string().optional().default(""),
  GOOGLE_CLIENT_SECRET: z.string().optional().default(""),
  GOOGLE_REDIRECT_URI: z.string().optional(),
  EMAIL_PROVIDER: z.string().optional().default("resend"),
  EMAIL_FROM: z.string().optional().default("no-reply@nayantaraopticals.com"),
  RESEND_API_KEY: z.string().optional(),
  SMS_PROVIDER: z.string().optional().default("fast2sms"),
  FAST2SMS_API_KEY: z.string().optional(),
  WHATSAPP_PROVIDER: z.string().optional().default("meta"),
  WHATSAPP_API_TOKEN: z.string().optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().optional(),
});

export function validateEnv(rawEnv: Record<string, string | undefined> = process.env) {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => ` - ${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    console.error(`\n❌ FATAL: Environment validation failed:\n${errorDetails}\n`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw new Error(`Environment validation failed:\n${errorDetails}`);
  }

  const parsed = result.data;

  // Security Gate: Reject ALLOW_INSECURE_WEBHOOKS in production
  if (parsed.NODE_ENV === "production" && parsed.ALLOW_INSECURE_WEBHOOKS === "true") {
    const msg = "FATAL SECURITY ERROR: ALLOW_INSECURE_WEBHOOKS cannot be enabled in production.";
    console.error(`\n❌ ${msg}\n`);
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }
    throw new Error(msg);
  }

  return parsed;
}

const parsedEnv = validateEnv(process.env);

// Ensure process.env.DATABASE_URL is set for Prisma
process.env.DATABASE_URL = parsedEnv.DATABASE_URL;
if (parsedEnv.DIRECT_URL) {
  process.env.DIRECT_URL = parsedEnv.DIRECT_URL;
} else if (!process.env.DIRECT_URL) {
  process.env.DIRECT_URL = parsedEnv.DATABASE_URL;
}

export const config = {
  port: parseInt(parsedEnv.PORT, 10),
  nodeEnv: parsedEnv.NODE_ENV,
  isProduction: parsedEnv.NODE_ENV === "production",
  clientUrl: parsedEnv.CLIENT_URL,
  corsOrigins: (parsedEnv.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean),
  backendUrl: (() => {
    if (parsedEnv.BACKEND_URL) return parsedEnv.BACKEND_URL.trim().replace(/\/$/, "");
    if (parsedEnv.RENDER_EXTERNAL_URL) return parsedEnv.RENDER_EXTERNAL_URL.trim().replace(/\/$/, "");
    if (parsedEnv.NODE_ENV === "production") return "https://nayantara-backend.onrender.com";
    return `http://localhost:${parsedEnv.PORT}`;
  })(),

  // Database & Redis
  databaseUrl: parsedEnv.DATABASE_URL,
  directUrl: parsedEnv.DIRECT_URL || parsedEnv.DATABASE_URL,
  redisUrl: parsedEnv.REDIS_URL,

  // Google Gemini AI & OAuth
  geminiApiKey: parsedEnv.GEMINI_API_KEY.trim(),
  googleClientId: parsedEnv.GOOGLE_CLIENT_ID.trim(),
  googleClientSecret: parsedEnv.GOOGLE_CLIENT_SECRET.trim(),
  googleRedirectUri: (() => {
    const raw = (parsedEnv.GOOGLE_REDIRECT_URI || "").trim();
    if (raw) {
      return raw.endsWith("/api/auth/google/callback")
        ? raw
        : `${raw.replace(/\/$/, "")}/api/auth/google/callback`;
    }
    if (parsedEnv.RENDER_EXTERNAL_URL) {
      return `${parsedEnv.RENDER_EXTERNAL_URL.trim().replace(/\/$/, "")}/api/auth/google/callback`;
    }
    return "http://localhost:5000/api/auth/google/callback";
  })(),

  // Authentication
  jwt: {
    accessSecret: parsedEnv.JWT_ACCESS_SECRET,
    refreshSecret: parsedEnv.JWT_REFRESH_SECRET,
    accessExpiresIn: "15m",
    refreshExpiresInDays: 30,
  },

  // Super Admin Default Credentials (for seeding)
  admin: {
    email: parsedEnv.SUPER_ADMIN_EMAIL,
    password: parsedEnv.SUPER_ADMIN_PASSWORD,
    phone: parsedEnv.SUPER_ADMIN_PHONE,
    name: "Super Admin",
  },

  business: {
    name: "Nayantara Opticals",
    contactPhone: parsedEnv.SUPER_ADMIN_PHONE,
  },

  // Webhook Security
  allowInsecureWebhooks: parsedEnv.ALLOW_INSECURE_WEBHOOKS === "true",

  // Supabase Storage
  supabase: {
    url: parsedEnv.SUPABASE_URL,
    serviceRoleKey: parsedEnv.SUPABASE_SERVICE_ROLE_KEY,
    anonKey: parsedEnv.SUPABASE_ANON_KEY,
    bucketName: parsedEnv.SUPABASE_STORAGE_BUCKET,
  },

  // AWS S3 / Cloudflare R2
  s3: {
    bucketName: parsedEnv.AWS_S3_BUCKET,
    region: parsedEnv.AWS_REGION,
    accessKeyId: parsedEnv.AWS_ACCESS_KEY_ID,
    secretAccessKey: parsedEnv.AWS_SECRET_ACCESS_KEY,
    endpoint: parsedEnv.AWS_ENDPOINT || undefined,
    signedUrlExpirySeconds: 300, // 5 minutes
    maxFileSizeMb: 10,
  },

  // Razorpay
  razorpay: {
    keyId: parsedEnv.RAZORPAY_KEY_ID,
    keySecret: parsedEnv.RAZORPAY_KEY_SECRET,
    webhookSecret: parsedEnv.RAZORPAY_WEBHOOK_SECRET,
  },

  // Notification Providers
  notifications: {
    email: {
      provider: parsedEnv.EMAIL_PROVIDER,
      fromAddress: parsedEnv.EMAIL_FROM,
      apiKey: parsedEnv.RESEND_API_KEY || "",
    },
    sms: {
      provider: parsedEnv.SMS_PROVIDER,
      apiKey: parsedEnv.FAST2SMS_API_KEY || "",
    },
    whatsapp: {
      provider: parsedEnv.WHATSAPP_PROVIDER,
      apiToken: parsedEnv.WHATSAPP_API_TOKEN || "",
      phoneNumberId: parsedEnv.WHATSAPP_PHONE_NUMBER_ID || "",
    },
  },
} as const;
