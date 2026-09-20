import crypto from "crypto";
import bcrypt from "bcryptjs";

const BCRYPT_SALT_ROUNDS = 12;

export class CryptoUtil {
  /**
   * Hashes a password using bcrypt (with 12 salt rounds)
   */
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  }

  /**
   * Compares a plaintext password against a hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Generates a cryptographically random SHA256 hash of a string
   */
  static hashToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Generates a 6-digit numeric OTP
   */
  static generateOtp(): string {
    const num = crypto.randomInt(100000, 999999);
    return num.toString();
  }

  /**
   * Generates a random secure hexadecimal token
   */
  static generateSecureToken(bytes = 32): string {
    return crypto.randomBytes(bytes).toString("hex");
  }

  /**
   * Verifies a Razorpay webhook or payment signature using HMAC SHA256
   */
  static verifyHmacSha256(data: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto.createHmac("sha256", secret).update(data).digest("hex");
    return crypto.timingSafeEqual(
      Buffer.from(signature, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    );
  }
}
