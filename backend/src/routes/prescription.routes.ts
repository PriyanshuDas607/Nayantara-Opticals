import { Router } from "express";
import { PrescriptionController } from "../controllers/prescription.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  prescriptionUploadUrlSchema,
  prescriptionCompleteUploadSchema,
  manualPrescriptionSchema,
} from "../validation/schemas.js";

const router = Router();

router.post(
  "/upload-url",
  authenticate,
  validate(prescriptionUploadUrlSchema),
  PrescriptionController.getUploadUrl
);

router.post(
  "/complete-upload",
  authenticate,
  validate(prescriptionCompleteUploadSchema),
  PrescriptionController.completeUpload
);

router.post(
  "/manual",
  authenticate,
  validate(manualPrescriptionSchema),
  PrescriptionController.submitManual
);

router.get("/me", authenticate, PrescriptionController.getMyPrescriptions);
router.get("/:id/download-url", authenticate, PrescriptionController.getDownloadUrl);

export default router;
