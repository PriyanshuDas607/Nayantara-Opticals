import { Logger } from "./logger.js";
import { prisma } from "./prisma.js";
import { config } from "../config/index.js";

const PING_INTERVAL_MS = 14 * 60 * 1000; // Exactly 14 minutes to prevent Render 15-minute sleep

export function startKeepAliveCron() {
  const targetUrl =
    process.env.BACKEND_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    `http://localhost:${config.port}`;

  const pingUrl = `${targetUrl.replace(/\/$/, "")}/api/v1/health`;

  Logger.info(
    `⏰ [KeepAlive Cron] Active. Scheduled self-ping every 14 mins to keep Backend & Database warm.`
  );

  const performPing = async () => {
    const startTime = Date.now();
    try {
      // 1. Self-ping HTTP endpoint to keep Render web service awake
      const res = await fetch(pingUrl, {
        headers: { "User-Agent": "Nayantara-KeepAlive-Cron/1.0" },
      });
      const durationMs = Date.now() - startTime;

      // 2. Keep-warm database query to prevent PostgreSQL pool disconnects
      let dbStatus = "connected";
      try {
        await Promise.race([
          prisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) => setTimeout(() => reject(new Error("DB timeout")), 3000)),
        ]);
      } catch {
        dbStatus = "standby";
      }

      Logger.info(
        `💓 [KeepAlive Ping] HTTP ${res.status} (${durationMs}ms) | DB: ${dbStatus} | Server uptime: ${Math.round(process.uptime())}s`
      );
    } catch (err: any) {
      Logger.warn(`⚠️ [KeepAlive Notice] Ping to ${pingUrl}: ${err?.message}`);
    }
  };

  // Initial check after 30 seconds, then every 14 minutes
  setTimeout(performPing, 30 * 1000);
  const interval = setInterval(performPing, PING_INTERVAL_MS);

  if (interval.unref) {
    interval.unref();
  }

  return interval;
}
