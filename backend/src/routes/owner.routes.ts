import { Router } from "express";
import { Role } from "../constants/index.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { ProductController } from "../controllers/product.controller.js";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { OrderController } from "../controllers/order.controller.js";
import { PrescriptionController } from "../controllers/prescription.controller.js";
import { FinanceController } from "../controllers/finance.controller.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../validation/schemas.js";

const router = Router();

// Only OWNER (and SUPER_ADMIN) allowed on owner routes
router.use(authenticate, authorize([Role.OWNER, Role.SUPER_ADMIN]));

// Store Financial Intelligence
router.get("/finance", FinanceController.getOwnerFinance);

// Store Products
router.post("/products", validate(createProductSchema), ProductController.createProduct);
router.patch("/products/:id", ProductController.updateProduct);
router.delete("/products/:id", ProductController.deleteProduct);

// Store Appointments
router.get("/appointments", AppointmentController.getOwnerAppointments);
router.patch("/appointments/:id/status", AppointmentController.updateStatus);

// Store Orders
router.get("/orders", OrderController.getOwnerOrders);
router.patch("/orders/:id/status", OrderController.updateStatus);

// Prescriptions related to store orders/appointments
router.get("/prescriptions/:id/download-url", PrescriptionController.getDownloadUrl);

// Store Visitor Traffic & Page Dwell Time Analytics
router.get("/analytics/engagement", AnalyticsController.getGlobalMetrics);

export default router;
