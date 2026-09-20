import { Router } from "express";
import { CartController } from "../controllers/cart.controller.js";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.use(authenticate);

router.get("/", CartController.getCart);
router.post("/items", CartController.addItem);
router.patch("/items/:id", CartController.updateQuantity);
router.delete("/items/:id", CartController.removeItem);
router.delete("/", CartController.clearCart);

export default router;
