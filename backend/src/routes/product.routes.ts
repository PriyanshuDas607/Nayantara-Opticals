import { Router } from "express";
import { ProductController } from "../controllers/product.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { Role } from "../constants/index.js";
import { validate } from "../middlewares/validate.js";
import { createProductSchema } from "../validation/schemas.js";

const router = Router();

// Public Read Endpoints
router.get("/categories", ProductController.getCategories);
router.get("/", ProductController.getProducts);
router.get("/:id", ProductController.getProductBySlugOrId);

// RBAC Protected Owner & Admin CRUD Endpoints
router.post(
  "/",
  authenticate,
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  validate(createProductSchema),
  ProductController.createProduct
);

router.patch(
  "/:id",
  authenticate,
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  ProductController.updateProduct
);

router.put(
  "/:id",
  authenticate,
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  ProductController.updateProduct
);

router.delete(
  "/:id",
  authenticate,
  authorize([Role.OWNER, Role.SUPER_ADMIN]),
  ProductController.deleteProduct
);

export default router;
