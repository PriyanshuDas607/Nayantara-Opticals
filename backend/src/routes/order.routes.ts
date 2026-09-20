import { Router } from "express";
import { OrderController } from "../controllers/order.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { createOrderSchema, verifyPaymentSchema } from "../validation/schemas.js";

const router = Router();

router.use(authenticate);

router.post("/validate-checkout", OrderController.validateCheckout);
router.post("/create", validate(createOrderSchema), OrderController.createOrder);
router.post("/verify-payment", validate(verifyPaymentSchema), OrderController.verifyPayment);
router.get("/me", OrderController.getMyOrders);
router.get("/me/:id", OrderController.getOrderById);

export default router;
