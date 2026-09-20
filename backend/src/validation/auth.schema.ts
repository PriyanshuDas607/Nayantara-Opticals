import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().optional(),
  whatsappOptIn: z.boolean().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  password: z.string().min(1, "Password is required"),
});

export const twoFactorVerifySchema = z.object({
  twoFactorToken: z.string().min(1, "2FA session token is required"),
  code: z.string().min(6, "2FA security code is required"),
});

export const phoneOtpRequestSchema = z.object({
  phone: z.string().min(10, "Please provide a valid 10-digit mobile number"),
  purpose: z.enum(["LOGIN", "PHONE_VERIFY", "PASSWORD_RESET"]).optional(),
});

export const phoneOtpVerifySchema = z.object({
  phone: z.string().min(10, "Please provide a valid 10-digit mobile number"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  purpose: z.enum(["LOGIN", "PHONE_VERIFY", "PASSWORD_RESET"]).optional(),
});

export const forgotPasswordRequestSchema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
});

export const resetPasswordSchema = z.object({
  identifier: z.string().min(3, "Email or phone number is required"),
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});
