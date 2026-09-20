import { Request, Response, NextFunction } from "express";
import { Role } from "../constants/index.js";

export const authorize = (allowedRoles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
        error: { code: "UNAUTHORIZED" },
      });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: You do not have permission to perform this action. Required role(s): ${allowedRoles.join(", ")}`,
        error: { code: "FORBIDDEN" },
      });
      return;
    }

    next();
  };
};
