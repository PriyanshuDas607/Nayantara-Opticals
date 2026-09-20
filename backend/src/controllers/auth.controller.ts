import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { prisma } from "../utils/prisma.js";

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.registerCustomer({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.status(201).json({
        success: true,
        message: "Customer account registered successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.login({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // If requires 2FA (Super Admin), return challenge without setting session cookie yet
      if (result.requires2FA) {
        res.json({
          success: true,
          message: result.message,
          data: result,
        });
        return;
      }

      // Standard login: Set HttpOnly cookie for refresh token
      if (result.tokens?.refreshToken) {
        res.cookie("refreshToken", result.tokens.refreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      res.json({
        success: true,
        message: "Login successful.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.verifySuperAdmin2FA({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Super Admin 2FA verified successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async requestPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, purpose } = req.body;
      const result = await AuthService.requestPhoneOtp(phone, purpose);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async verifyPhoneOtp(req: Request, res: Response, next: NextFunction) {
    try {
      const { phone, otp, purpose } = req.body;
      const result = await AuthService.verifyPhoneOtp(
        phone,
        otp,
        purpose,
        req.ip,
        req.headers["user-agent"]
      );

      res.cookie("refreshToken", result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Phone verified successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async requestForgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier } = req.body;
      const result = await AuthService.requestPasswordReset(identifier);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, otp, newPassword } = req.body;
      const result = await AuthService.resetPassword(identifier, otp, newPassword);
      res.json({ success: true, message: result.message });
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (!token) {
        res.status(400).json({ success: false, message: "Refresh token is required." });
        return;
      }

      const result = await TokenService.rotateRefreshToken(
        token,
        undefined,
        req.ip,
        req.headers["user-agent"]
      );

      res.cookie("refreshToken", result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.json({
        success: true,
        message: "Tokens rotated successfully.",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.body.refreshToken || req.cookies?.refreshToken;
      if (token) {
        await TokenService.revokeSession(token);
      }
      res.clearCookie("refreshToken");
      res.json({ success: true, message: "Logged out successfully." });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (req.user?.userId) {
        await TokenService.revokeAllUserSessions(req.user.userId);
      }
      res.clearCookie("refreshToken");
      res.json({ success: true, message: "Logged out from all devices successfully." });
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          customerProfile: true,
          ownerProfile: { include: { store: true } },
          addresses: true,
        },
      });

      if (!user) {
        res.status(404).json({ success: false, message: "User not found." });
        return;
      }

      res.json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          customerProfile: user.customerProfile,
          ownerProfile: user.ownerProfile,
          addresses: user.addresses,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}
