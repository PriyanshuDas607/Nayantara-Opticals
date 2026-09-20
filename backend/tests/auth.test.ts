import { describe, it, expect } from "vitest";
import { CryptoUtil } from "../src/utils/crypto.js";
import { isDisposableEmail } from "../src/utils/disposableEmails.js";
import { normalizePhone, isValidIndianPhone } from "../src/utils/phone.js";
import { TokenService } from "../src/services/token.service.js";
import { Role } from "../src/constants/index.js";

describe("Authentication & Security Utilities", () => {
  it("should securely hash and verify passwords using bcrypt", async () => {
    const rawPassword = "SecurePassword@1234!";
    const hash = await CryptoUtil.hashPassword(rawPassword);

    expect(hash).not.toBe(rawPassword);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await CryptoUtil.comparePassword(rawPassword, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await CryptoUtil.comparePassword("WrongPassword", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("should detect and block disposable email domains", () => {
    expect(isDisposableEmail("test@mailinator.com")).toBe(true);
    expect(isDisposableEmail("user@tempmail.com")).toBe(true);
    expect(isDisposableEmail("customer@10minutemail.com")).toBe(true);
    expect(isDisposableEmail("legit.customer@gmail.com")).toBe(false);
    expect(isDisposableEmail("doctor@yahoo.co.in")).toBe(false);
  });

  it("should normalize Indian phone numbers to E.164 format and validate", () => {
    expect(normalizePhone("9876543210")).toBe("+919876543210");
    expect(normalizePhone("09876543210")).toBe("+919876543210");
    expect(normalizePhone("+91 98765-43210")).toBe("+919876543210");

    expect(isValidIndianPhone("+919876543210")).toBe(true);
    expect(isValidIndianPhone("12345")).toBe(false);
  });

  it("should generate and verify short-lived access JWT tokens", () => {
    const payload = {
      userId: "test-user-uuid-123",
      role: Role.CUSTOMER,
    };

    const token = TokenService.generateAccessToken(payload);
    expect(typeof token).toBe("string");

    const decoded = TokenService.verifyAccessToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.role).toBe(Role.CUSTOMER);
  });

  it("should generate cryptographically secure 6-digit OTPs", () => {
    const otp = CryptoUtil.generateOtp();
    expect(otp.length).toBe(6);
    expect(/^\d{6}$/.test(otp)).toBe(true);
  });
});
