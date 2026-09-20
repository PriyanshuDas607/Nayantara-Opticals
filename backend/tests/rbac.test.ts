import { describe, it, expect } from "vitest";
import { Role, Permission, ROLE_PERMISSIONS } from "../src/constants/index.js";

describe("Role-Based Access Control (RBAC) Matrix", () => {
  it("should grant SUPER_ADMIN full operational permissions", () => {
    const adminPermissions = ROLE_PERMISSIONS[Role.SUPER_ADMIN];
    expect(adminPermissions).toContain(Permission.MANAGE_STORES);
    expect(adminPermissions).toContain(Permission.MANAGE_OWNERS);
    expect(adminPermissions).toContain(Permission.MANAGE_ALL_PRODUCTS);
    expect(adminPermissions).toContain(Permission.MANAGE_ALL_ORDERS);
    expect(adminPermissions).toContain(Permission.VIEW_GLOBAL_ANALYTICS);
    expect(adminPermissions).toContain(Permission.VIEW_AUDIT_LOGS);
  });

  it("should restrict OWNER from creating other owners or viewing global admin settings", () => {
    const ownerPermissions = ROLE_PERMISSIONS[Role.OWNER];
    expect(ownerPermissions).not.toContain(Permission.MANAGE_OWNERS);
    expect(ownerPermissions).not.toContain(Permission.MANAGE_STORES);
    expect(ownerPermissions).not.toContain(Permission.VIEW_GLOBAL_ANALYTICS);
    expect(ownerPermissions).toContain(Permission.CREATE_PRODUCT);
    expect(ownerPermissions).toContain(Permission.MANAGE_STORE_ORDERS);
    expect(ownerPermissions).toContain(Permission.VIEW_STORE_ANALYTICS);
  });

  it("should strictly limit CUSTOMER to self-service permissions", () => {
    const customerPermissions = ROLE_PERMISSIONS[Role.CUSTOMER];
    expect(customerPermissions).toContain(Permission.BOOK_APPOINTMENT);
    expect(customerPermissions).toContain(Permission.VIEW_OWN_ORDERS);
    expect(customerPermissions).toContain(Permission.UPLOAD_PRESCRIPTION);
    expect(customerPermissions).not.toContain(Permission.CREATE_PRODUCT);
    expect(customerPermissions).not.toContain(Permission.MANAGE_STORE_ORDERS);
  });
});
