import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { authenticate, optionalAuthenticate } from "../middlewares/authenticate.js";
import { authRateLimiter, otpRateLimiter } from "../middlewares/rateLimiter.js";
import {
  registerSchema,
  loginSchema,
  twoFactorVerifySchema,
  phoneOtpRequestSchema,
  phoneOtpVerifySchema,
  forgotPasswordRequestSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from "../validation/auth.schema.js";

const router = Router();

router.post("/register", authRateLimiter, validate(registerSchema), AuthController.register);
router.post("/login", authRateLimiter, validate(loginSchema), AuthController.login);
router.post("/2fa/verify", authRateLimiter, validate(twoFactorVerifySchema), AuthController.verify2FA);
router.post("/phone-otp/request", otpRateLimiter, validate(phoneOtpRequestSchema), AuthController.requestPhoneOtp);
router.post("/phone-otp/verify", validate(phoneOtpVerifySchema), AuthController.verifyPhoneOtp);
router.post("/forgot-password/request", otpRateLimiter, validate(forgotPasswordRequestSchema), AuthController.requestForgotPassword);
router.post("/reset-password", validate(resetPasswordSchema), AuthController.resetPassword);
router.post("/refresh", validate(refreshTokenSchema), AuthController.refreshToken);
router.post("/logout", AuthController.logout);
router.post("/logout-all", authenticate, AuthController.logoutAll);
router.get("/me", authenticate, AuthController.getMe);
router.put("/profile", authenticate, AuthController.updateProfile);

// Address Management
router.get("/addresses", optionalAuthenticate, AuthController.getAddresses);
router.post("/addresses", optionalAuthenticate, AuthController.addAddress);
router.put("/addresses/:id", optionalAuthenticate, AuthController.updateAddress);
router.delete("/addresses/:id", optionalAuthenticate, AuthController.deleteAddress);
router.patch("/addresses/:id/default", optionalAuthenticate, AuthController.setDefaultAddress);

export default router;
