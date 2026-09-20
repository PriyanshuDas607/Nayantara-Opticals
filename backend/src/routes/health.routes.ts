import { Router, Request, Response } from "express";
import { config } from "../config/index.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "Nayantara Opticals API",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

export default router;
