import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";
import { TokenService } from "../services/token.service.js";
import { prisma } from "../utils/prisma.js";
import { Role } from "../constants/index.js";
import { config } from "../config/index.js";
import { Logger } from "../utils/logger.js";

const setAuthCookies = (res: Response, accessToken?: string, refreshToken?: string) => {
  const isProd = config.isProduction || config.nodeEnv === "production";
  if (accessToken) {
    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: "/",
    });
  }
  if (refreshToken) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      path: "/",
    });
  }
};

const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
};

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

      // Standard login: Set HttpOnly cookies
      setAuthCookies(res, result.tokens?.accessToken, result.tokens?.refreshToken);

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

      setAuthCookies(res, result.tokens?.accessToken, result.tokens?.refreshToken);

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

      setAuthCookies(res, result.tokens?.accessToken, result.tokens?.refreshToken);

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

      setAuthCookies(res, result.accessToken, result.refreshToken);

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
      clearAuthCookies(res);
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
      clearAuthCookies(res);
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

      const userId = req.user.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
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

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const userId = req.user.userId;
      const { fullName, phone, gender, dateOfBirth, whatsappOptIn } = req.body;

      const updated = await prisma.user.update({
        where: { id: userId },
        data: {
          phone: phone || undefined,
          customerProfile: {
            upsert: {
              create: {
                fullName: fullName || "Valued Customer",
                gender: gender || undefined,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                whatsappOptIn: Boolean(whatsappOptIn),
              },
              update: {
                fullName: fullName || undefined,
                gender: gender || undefined,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
                whatsappOptIn: whatsappOptIn !== undefined ? Boolean(whatsappOptIn) : undefined,
              },
            },
          },
        },
        include: {
          customerProfile: true,
        },
      });

      res.json({
        success: true,
        message: "Profile updated successfully.",
        data: {
          id: userId,
          fullName: updated.customerProfile?.fullName,
          phone: updated.phone,
          gender: updated.customerProfile?.gender,
          dateOfBirth: updated.customerProfile?.dateOfBirth,
          whatsappOptIn: updated.customerProfile?.whatsappOptIn,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAddresses(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        res.json({ success: true, data: [] });
        return;
      }

      const addresses = await prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      });

      res.json({ success: true, data: addresses });
    } catch (error) {
      next(error);
    }
  }

  static async addAddress(req: Request, res: Response, next: NextFunction) {
    try {
      let userId = req.user?.userId;
      const {
        fullName,
        phone,
        alternatePhone,
        addressLine1,
        addressLine2,
        landmark,
        city,
        state,
        pincode,
        country = "India",
        type = "HOME",
        isDefault = false,
      } = req.body;

      if (!fullName || !phone || !addressLine1 || !city || !state || !pincode) {
        res.status(400).json({
          success: false,
          message: "Please fill in all required address fields.",
        });
        return;
      }

      let freshAccessToken: string | undefined;

      if (!userId) {
        let user = await prisma.user.findFirst({
          where: { phone },
          include: { customerProfile: true },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              phone,
              role: Role.CUSTOMER,
              customerProfile: {
                create: {
                  fullName,
                  whatsappOptIn: true,
                },
              },
            },
            include: { customerProfile: true },
          });
        }
        userId = user.id;
        freshAccessToken = TokenService.generateAccessToken({
          userId: user.id,
          role: user.role as any,
          storeId: null,
        });
      }

      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const created = await prisma.address.create({
        data: {
          userId,
          fullName,
          phone,
          addressLine1,
          addressLine2: addressLine2 || "",
          landmark: landmark || null,
          city,
          state,
          pincode,
          country,
          type: (type.toUpperCase() as any) || "HOME",
          isDefault: Boolean(isDefault),
        },
      });

      res.status(201).json({
        success: true,
        message: "Address added successfully.",
        data: created,
        token: freshAccessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const userId = req.user.userId;
      const id = String(req.params.id);
      const updates = req.body;

      if (updates.isDefault) {
        await prisma.address.updateMany({
          where: { userId },
          data: { isDefault: false },
        });
      }

      const updated = await prisma.address.update({
        where: { id },
        data: {
          fullName: updates.fullName,
          phone: updates.phone,
          addressLine1: updates.addressLine1,
          addressLine2: updates.addressLine2,
          landmark: updates.landmark,
          city: updates.city,
          state: updates.state,
          pincode: updates.pincode,
          type: updates.type ? (updates.type.toUpperCase() as any) : undefined,
          isDefault: updates.isDefault !== undefined ? Boolean(updates.isDefault) : undefined,
        },
      });

      res.json({
        success: true,
        message: "Address updated successfully.",
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const id = String(req.params.id);

      await prisma.address.delete({
        where: { id },
      });

      res.json({
        success: true,
        message: "Address deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async setDefaultAddress(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        res.status(401).json({ success: false, message: "Unauthorized." });
        return;
      }

      const userId = req.user.userId;
      const id = String(req.params.id);

      await prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false },
      });

      await prisma.address.update({
        where: { id },
        data: { isDefault: true },
      });

      res.json({
        success: true,
        message: "Default address updated.",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getGoogleConfig(req: Request, res: Response, next: NextFunction) {
    try {
      res.json({
        success: true,
        data: {
          clientId: config.googleClientId || process.env.GOOGLE_CLIENT_ID || "",
        },
      });
    } catch (error) {
      next(error);
    }
  }

  static async googleAuth(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await AuthService.googleAuth({
        ...req.body,
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      setAuthCookies(res, result.tokens?.accessToken, result.tokens?.refreshToken);

      res.json({
        success: true,
        message: "Google sign-in successful.",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || "Google authentication failed. Please try again.",
      });
    }
  }

  static async redirectToGoogle(req: Request, res: Response) {
    const redirectUri = config.googleRedirectUri;
    const clientId = config.googleClientId;

    let origin = config.clientUrl || "http://localhost:3000";
    if (req.query.origin && typeof req.query.origin === "string") {
      origin = req.query.origin;
    } else if (req.headers.referer) {
      try {
        origin = new URL(req.headers.referer).origin;
      } catch {
        // use default
      }
    }

    const redirectTo = req.query.redirectTo ? String(req.query.redirectTo) : "/";
    const state = JSON.stringify({ origin, redirectTo });

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      access_type: "offline",
      prompt: "select_account",
      state,
    });
    res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`);
  }

  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const code = req.query.code as string;
      const error = req.query.error as string;
      let clientOrigin = config.clientUrl || "http://localhost:3000";
      if (req.query.state && typeof req.query.state === "string") {
        try {
          const parsed = JSON.parse(req.query.state);
          if (parsed?.origin && typeof parsed.origin === "string") {
            clientOrigin = parsed.origin;
          }
        } catch {
          // state was not json
        }
      }

      if (error || !code) {
        Logger.warn(`Google OAuth callback error or cancel: ${error || "missing code"}`);
        res.redirect(`${clientOrigin}/login?error=${encodeURIComponent(error || "Google login cancelled")}`);
        return;
      }

      // Exchange authorization code for tokens with Google using Google OAuth token endpoint
      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: config.googleClientId,
          client_secret: config.googleClientSecret,
          redirect_uri: config.googleRedirectUri,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const tokenErr = await tokenRes.text();
        Logger.error(`Google token exchange error: ${tokenErr}`);
        res.redirect(`${clientOrigin}/login?error=Failed to exchange Google authorization token`);
        return;
      }

      const tokenData = (await tokenRes.json()) as any;
      const accessToken = tokenData.access_token;
      const idToken = tokenData.id_token;

      // Retrieve user profile directly from Google
      let profile: any = {};
      if (accessToken) {
        const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (userinfoRes.ok) {
          profile = await userinfoRes.json();
        }
      }

      const authResult = await AuthService.googleAuth({
        credential: idToken,
        accessToken,
        profile: {
          email: profile.email,
          name: profile.name,
          picture: profile.picture,
          sub: profile.sub,
        },
        ipAddress: req.ip,
        userAgent: req.headers["user-agent"],
      });

      // Set HttpOnly cookies
      setAuthCookies(res, authResult.tokens?.accessToken, authResult.tokens?.refreshToken);

      // Redirect user to frontend with token & user info
      const redirectUrl = new URL(`${clientOrigin}/login`);
      redirectUrl.searchParams.set("google_auth", "success");
      redirectUrl.searchParams.set("token", authResult.tokens.accessToken);
      if (authResult.tokens?.refreshToken) {
        redirectUrl.searchParams.set("refreshToken", authResult.tokens.refreshToken);
      }
      redirectUrl.searchParams.set("user", JSON.stringify(authResult.user));

      res.redirect(redirectUrl.toString());
    } catch (err: any) {
      Logger.error(`Google callback exception: ${err?.message}`);
      let fallbackOrigin = config.clientUrl || "http://localhost:3000";
      if (req.query.state && typeof req.query.state === "string") {
        try {
          const parsed = JSON.parse(req.query.state);
          if (parsed?.origin && typeof parsed.origin === "string") {
            fallbackOrigin = parsed.origin;
          }
        } catch {
          // ignore
        }
      }
      res.redirect(
        `${fallbackOrigin}/login?error=${encodeURIComponent(err?.message || "Google sign-in failed")}`
      );
    }
  }
}


