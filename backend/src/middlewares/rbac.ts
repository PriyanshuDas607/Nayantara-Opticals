import { Request, Response, NextFunction } from "express";
import { Role, Permission, ROLE_PERMISSIONS, ERROR_CODES } from "../constants/index.js";

/**
 * Checks if a user has specific fine-grained permissions based on their role
 */
export const requirePermission = (...requiredPermissions: Permission[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Authentication required to access this resource.",
        error: { code: ERROR_CODES.UNAUTHORIZED },
      });
      return;
    }

    const userRole = req.user.role as Role;
    const userPermissions = ROLE_PERMISSIONS[userRole] || [];

    const hasAll = requiredPermissions.every((perm) => userPermissions.includes(perm));

    if (!hasAll) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Missing required permission(s): ${requiredPermissions.join(", ")}`,
        error: {
          code: ERROR_CODES.FORBIDDEN,
          required: requiredPermissions,
          role: userRole,
        },
      });
      return;
    }

    next();
  };
};

/**
 * Enforces store tenant isolation.
 * - If user is SUPER_ADMIN: has global tenant bypass.
 * - If user is OWNER: must have a valid storeId and can only query their own store.
 * - Attaches validated storeId to request.
 */
export const requireStoreTenant = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
      error: { code: ERROR_CODES.UNAUTHORIZED },
    });
    return;
  }

  // Super Admin can access all or optionally filter by store
  if (req.user.role === Role.SUPER_ADMIN) {
    return next();
  }

  if (req.user.role === Role.OWNER) {
    if (!req.user.storeId) {
      res.status(403).json({
        success: false,
        message: "Forbidden: No optical store assigned to this owner account. Please contact Super Admin.",
        error: { code: ERROR_CODES.FORBIDDEN },
      });
      return;
    }

    // If a storeId is supplied in body/query/params, verify it matches
    const requestedStoreId = (req.params.storeId || req.query.storeId || req.body?.storeId) as string | undefined;
    if (requestedStoreId && requestedStoreId !== req.user.storeId) {
      res.status(403).json({
        success: false,
        message: "Tenant Isolation Violation: You are not authorized to view or modify other stores' data.",
        error: { code: ERROR_CODES.FORBIDDEN },
      });
      return;
    }

    return next();
  }

  res.status(403).json({
    success: false,
    message: "Forbidden: Store owner or Super Admin privileges required.",
    error: { code: ERROR_CODES.FORBIDDEN },
  });
};
