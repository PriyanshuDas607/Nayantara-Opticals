import { Router } from "express";
import { Role } from "../constants/index.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { NotificationController } from "../controllers/notification.controller.js";

const router = Router();

// 1. All routes require authentication
router.use(authenticate);

// 2. Customer & User self-notification management
router.get("/", NotificationController.getUserNotifications);
router.patch("/read-all", NotificationController.markAllRead);
router.patch("/:id/read", NotificationController.markRead);
router.delete("/:id", NotificationController.deleteNotification);

// 3. Admin & Store Owner Broadcast & Campaign Management
router.get(
  "/customers",
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  NotificationController.getCustomers
);
router.post(
  "/broadcast",
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  NotificationController.broadcast
);
router.get(
  "/broadcast-history",
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  NotificationController.getBroadcastHistory
);

export default router;
