import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import { Server } from "http";
import { createApp } from "../src/app.js";
import { TokenService } from "../src/services/token.service.js";
import { Role } from "../src/constants/index.js";
import { prisma } from "../src/utils/prisma.js";

describe("Phase 1.5: Notification Read State & Scalable Unread Count", () => {
  let server: Server;
  let baseUrl: string;

  const testUserToken = TokenService.generateAccessToken({
    userId: "notif-user-1",
    role: Role.CUSTOMER,
  });

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

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should query database count for unreadCount where readAt is null", async () => {
    const mockNotifs = [
      {
        id: "notif-1",
        userId: "notif-user-1",
        channel: "IN_APP",
        title: "Order Shipped",
        body: "Your glasses are on the way",
        metadata: null,
        readAt: null,
        status: "DELIVERED",
        createdAt: new Date(),
      },
      {
        id: "notif-2",
        userId: "notif-user-1",
        channel: "IN_APP",
        title: "Appointment Reminder",
        body: "See you tomorrow at 11 AM",
        metadata: null,
        readAt: new Date(),
        status: "DELIVERED",
        createdAt: new Date(),
      },
    ];

    vi.spyOn(prisma.notification, "findMany").mockResolvedValueOnce(mockNotifs as any);
    const countSpy = vi.spyOn(prisma.notification, "count").mockResolvedValueOnce(42); // 42 unread total

    const res = await fetch(`${baseUrl}/api/v1/notifications`, {
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.unreadCount).toBe(42);
    expect(json.data).toHaveLength(2);
    expect(json.data[0].read).toBe(false);
    expect(json.data[1].read).toBe(true);

    expect(countSpy).toHaveBeenCalledWith({
      where: { userId: "notif-user-1", readAt: null },
    });
  });

  it("should mark a single notification as read by setting readAt via updateMany", async () => {
    const updateManySpy = vi.spyOn(prisma.notification, "updateMany").mockResolvedValueOnce({ count: 1 });

    const res = await fetch(`${baseUrl}/api/v1/notifications/notif-1/read`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("Notification marked as read.");

    expect(updateManySpy).toHaveBeenCalledWith({
      where: {
        id: "notif-1",
        userId: "notif-user-1",
        readAt: null,
      },
      data: {
        readAt: expect.any(Date),
      },
    });
  });

  it("should mark all user notifications as read in a single atomic updateMany query", async () => {
    const updateManySpy = vi.spyOn(prisma.notification, "updateMany").mockResolvedValueOnce({ count: 5 });

    const res = await fetch(`${baseUrl}/api/v1/notifications/read-all`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${testUserToken}`,
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toBe("All notifications marked as read.");
    expect(json.count).toBe(5);

    expect(updateManySpy).toHaveBeenCalledTimes(1);
    expect(updateManySpy).toHaveBeenCalledWith({
      where: {
        userId: "notif-user-1",
        readAt: null,
      },
      data: {
        readAt: expect.any(Date),
      },
    });
  });
});
