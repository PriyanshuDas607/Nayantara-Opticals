/* eslint-disable @typescript-eslint/no-explicit-any */
export class Logger {
  private static redactSensitive(obj: any): any {
    if (!obj || typeof obj !== "object") return obj;

    const sensitiveKeys = [
      "password",
      "passwordHash",
      "token",
      "refreshToken",
      "otp",
      "otpHash",
      "razorpaySignature",
      "keySecret",
      "secretAccessKey",
      "authorization",
      "cookie",
    ];

    const copy = Array.isArray(obj) ? [...obj] : { ...obj };

    for (const key of Object.keys(copy)) {
      if (sensitiveKeys.some((s) => key.toLowerCase().includes(s.toLowerCase()))) {
        copy[key] = "[REDACTED]";
      } else if (typeof copy[key] === "object") {
        copy[key] = Logger.redactSensitive(copy[key]);
      }
    }

    return copy;
  }

  static info(message: string, context?: any) {
    const timestamp = new Date().toISOString();
    if (context) {
      console.log(`[INFO] [${timestamp}] ${message}`, Logger.redactSensitive(context));
    } else {
      console.log(`[INFO] [${timestamp}] ${message}`);
    }
  }

  static warn(message: string, context?: any) {
    const timestamp = new Date().toISOString();
    if (context) {
      console.warn(`[WARN] [${timestamp}] ${message}`, Logger.redactSensitive(context));
    } else {
      console.warn(`[WARN] [${timestamp}] ${message}`);
    }
  }

  static error(message: string, error?: any, context?: any) {
    const timestamp = new Date().toISOString();
    console.error(`[ERROR] [${timestamp}] ${message}`);
    if (error) console.error(error);
    if (context) console.error("Context:", Logger.redactSensitive(context));
  }
}
