import { Request, Response, NextFunction } from "express";
import { TokenService, AccessTokenPayload } from "../services/token.service.js";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AccessTokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: "Authentication required. Please provide a valid Bearer token.",
      error: { code: "UNAUTHORIZED" },
    });
    return;
  }

  try {
    const payload = TokenService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({
      success: false,
      message: "Access token is invalid or has expired. Please refresh your session.",
      error: { code: "TOKEN_EXPIRED" },
    });
  }
};

/**
 * Optional authentication middleware for guest/authenticated hybrid routes
 */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  let token: string | undefined;

  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  }

  if (token) {
    try {
      const payload = TokenService.verifyAccessToken(token);
      req.user = payload;
    } catch {
      // Ignore token error for optional auth
    }
  }
  next();
};
