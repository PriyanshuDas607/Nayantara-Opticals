import { describe, it, expect } from "vitest";
import { validateEnv } from "../src/config/index.js";

describe("Phase 0.3: Environment & Configuration Security", () => {
  const validBaseEnv = {
    DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
    JWT_ACCESS_SECRET: "test_access_jwt_secret_min_16_chars_12345",
    JWT_REFRESH_SECRET: "test_refresh_jwt_secret_min_16_chars_12345",
    SUPER_ADMIN_PASSWORD: "AdminTestPassword123!",
  };

  it("should successfully parse valid environment variables", () => {
    const parsed = validateEnv({
      ...validBaseEnv,
      NODE_ENV: "development",
      PORT: "5000",
      CORS_ORIGINS: "http://localhost:3000, https://nayantara-opticals.vercel.app",
    });

    expect(parsed.PORT).toBe("5000");
    expect(parsed.NODE_ENV).toBe("development");
    expect(parsed.JWT_ACCESS_SECRET).toBe(validBaseEnv.JWT_ACCESS_SECRET);
    expect(parsed.ALLOW_INSECURE_WEBHOOKS).toBe("false");
  });

  it("should fail validation if JWT_ACCESS_SECRET is missing or too short", () => {
    expect(() =>
      validateEnv({
        ...validBaseEnv,
        NODE_ENV: "test",
        JWT_ACCESS_SECRET: "too_short",
      })
    ).toThrow(/JWT_ACCESS_SECRET/);

    expect(() =>
      validateEnv({
        ...validBaseEnv,
        NODE_ENV: "test",
        JWT_ACCESS_SECRET: "",
      })
    ).toThrow(/JWT_ACCESS_SECRET/);
  });

  it("should fail validation if SUPER_ADMIN_PASSWORD is missing or too short", () => {
    expect(() =>
      validateEnv({
        ...validBaseEnv,
        NODE_ENV: "test",
        SUPER_ADMIN_PASSWORD: "short",
      })
    ).toThrow(/SUPER_ADMIN_PASSWORD/);
  });

  it("should strictly reject ALLOW_INSECURE_WEBHOOKS=true in production", () => {
    expect(() =>
      validateEnv({
        ...validBaseEnv,
        NODE_ENV: "production",
        ALLOW_INSECURE_WEBHOOKS: "true",
      })
    ).toThrow(/FATAL SECURITY ERROR: ALLOW_INSECURE_WEBHOOKS cannot be enabled in production/);
  });

  it("should allow ALLOW_INSECURE_WEBHOOKS=true only in development or test", () => {
    const parsedDev = validateEnv({
      ...validBaseEnv,
      NODE_ENV: "development",
      ALLOW_INSECURE_WEBHOOKS: "true",
    });
    expect(parsedDev.ALLOW_INSECURE_WEBHOOKS).toBe("true");

    const parsedTest = validateEnv({
      ...validBaseEnv,
      NODE_ENV: "test",
      ALLOW_INSECURE_WEBHOOKS: "true",
    });
    expect(parsedTest.ALLOW_INSECURE_WEBHOOKS).toBe("true");
  });
});
