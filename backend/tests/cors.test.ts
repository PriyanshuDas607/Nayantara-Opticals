import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { Server } from "http";
import { createApp } from "../src/app.js";

describe("Phase 0.6: CORS Exact Allowlist Security", () => {
  let server: Server;
  let baseUrl: string;

  beforeAll(async () => {
    const app = createApp();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const address = server.address();
        if (address && typeof address === "object") {
          baseUrl = `http://127.0.0.1:${address.port}`;
        }
        resolve();
      });
    });
  });

  afterAll(async () => {
    await new Promise<void>((resolve) => {
      server?.close(() => resolve());
    });
  });

  it("should allow requests from official production frontend", async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: "GET",
      headers: {
        Origin: "https://nayantara-opticals.vercel.app",
      },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("access-control-allow-origin")).toBe("https://nayantara-opticals.vercel.app");
    expect(res.headers.get("access-control-allow-credentials")).toBe("true");
  });

  it("should allow requests without an Origin header (mobile apps, webhooks, curl)", async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: "GET",
    });

    expect(res.status).toBe(200);
  });

  it("should block unauthorized origins including attacker vercel deployments", async () => {
    const res = await fetch(`${baseUrl}/api/health`, {
      method: "GET",
      headers: {
        Origin: "https://attacker-phishing-app.vercel.app",
      },
    });

    // When CORS rejects, Express error handler responds or omits CORS headers
    const corsHeader = res.headers.get("access-control-allow-origin");
    expect(corsHeader).not.toBe("https://attacker-phishing-app.vercel.app");
  });
});
