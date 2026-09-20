import { Router } from "express";
import { AnalyticsController } from "../controllers/analytics.controller.js";
import { optionalAuthenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { trackAnalyticsEventSchema } from "../validation/schemas.js";

const router = Router();

router.post("/event", optionalAuthenticate, validate(trackAnalyticsEventSchema), AnalyticsController.track);
router.post("/heartbeat", optionalAuthenticate, validate(trackAnalyticsEventSchema), AnalyticsController.track);
router.post("/error-log", optionalAuthenticate, AnalyticsController.reportClientError);
router.post("/session/end", AnalyticsController.endSession);
router.get("/top-pages", AnalyticsController.getTopPages);
router.get("/page-engagement", AnalyticsController.getGlobalMetrics);

export default router;
