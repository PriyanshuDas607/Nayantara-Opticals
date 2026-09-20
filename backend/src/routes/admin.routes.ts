import { Router } from "express";
import { Role } from "../constants/index.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { AdminController } from "../controllers/admin.controller.js";
import { ProductController } from "../controllers/product.controller.js";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { OrderController } from "../controllers/order.controller.js";
import { PrescriptionController } from "../controllers/prescription.controller.js";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { FinanceController } from "../controllers/finance.controller.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../validation/schemas.js";

const router = Router();

// Only SUPER_ADMIN allowed on admin routes
router.use(authenticate, authorize([Role.SUPER_ADMIN]));

// Platform Financial Intelligence
router.get("/finance", FinanceController.getAdminFinance);

// Owner Management (Admin only)
router.post("/owners", AdminController.createOwner);
router.get("/owners", AdminController.getOwners);
router.patch("/owners/:id/status", AdminController.updateOwnerStatus);

// Stores
router.get("/stores", AdminController.getStores);
router.post("/stores", AdminController.createStore);

// Products Management
router.post("/products", validate(createProductSchema), ProductController.createProduct);
router.patch("/products/:id", ProductController.updateProduct);
router.delete("/products/:id", ProductController.deleteProduct);

// Global Appointments
router.get("/appointments", AppointmentController.getAdminAppointments);
router.patch("/appointments/:id/status", AppointmentController.updateStatus);

// Global Orders
router.get("/orders", OrderController.getAdminOrders);
router.patch("/orders/:id/status", OrderController.updateStatus);

// Global Prescriptions with Audit
router.get("/prescriptions", PrescriptionController.getAllPrescriptions);
router.get("/prescriptions/:id/download-url", PrescriptionController.getDownloadUrl);

// Global Analytics & Audits
router.get("/analytics/global", AnalyticsController.getGlobalMetrics);
router.get("/audit-logs", AdminController.getAuditLogs);

// System Health & Error Monitoring
router.get("/error-monitoring", AdminController.getErrorMonitoring);
router.patch("/error-monitoring/:id/status", AdminController.updateErrorStatus);
router.delete("/error-monitoring/resolved", AdminController.clearResolvedErrors);

export default router;
