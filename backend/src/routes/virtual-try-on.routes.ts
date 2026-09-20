import { Router } from "express";
import { VirtualTryOnController } from "../controllers/virtual-try-on.controller.js";
import { optionalAuthenticate } from "../middlewares/authenticate.js";

const router = Router();

router.post("/session", optionalAuthenticate, VirtualTryOnController.createSession);
router.get("/:id", VirtualTryOnController.getStatus);

export default router;
