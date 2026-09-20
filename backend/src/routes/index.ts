import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import appointmentRoutes from "./appointment.routes.js";
import prescriptionRoutes from "./prescription.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import ownerRoutes from "./owner.routes.js";
import adminRoutes from "./admin.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import virtualTryOnRoutes from "./virtual-try-on.routes.js";
import webhookRoutes from "./webhook.routes.js";
import { config } from "../config/index.js";

const apiRouter = Router();

// Health Check
apiRouter.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Nayantara Opticals Production API",
    version: "1.0.0",
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

// Mount Routes
apiRouter.use("/auth", authRoutes);
apiRouter.use("/products", productRoutes);
apiRouter.use("/appointments", appointmentRoutes);
apiRouter.use("/prescriptions", prescriptionRoutes);
apiRouter.use("/cart", cartRoutes);
apiRouter.use("/orders", orderRoutes);
apiRouter.use("/owner", ownerRoutes);
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/analytics", analyticsRoutes);
apiRouter.use("/virtual-try-on", virtualTryOnRoutes);
apiRouter.use("/webhooks", webhookRoutes);

export default apiRouter;
