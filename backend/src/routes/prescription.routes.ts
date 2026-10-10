import { Router } from "express";
import multer from "multer";
import { PrescriptionController } from "../controllers/prescription.controller.js";
import { authenticate, optionalAuthenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import {
  prescriptionUploadUrlSchema,
  prescriptionCompleteUploadSchema,
  manualPrescriptionSchema,
} from "../validation/schemas.js";

const router = Router();

// Configure Multer: in-memory upload, 10MB limit, strictly JPEG, PNG, PDF
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png", "image/jpg"];
    if (allowed.includes(file.mimetype.toLowerCase())) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file format (${file.mimetype}). Only JPEG (.jpg, .jpeg), PNG (.png), and PDF (.pdf) files are allowed.`
        )
      );
    }
  },
});

// 1. Direct Multipart upload into Supabase Storage
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  PrescriptionController.uploadFile
);

// 2. Local vault stream endpoint (used as fallback when Supabase keys pending)
router.get("/raw/:objectKey(*)", PrescriptionController.getRawFile);

// 3. Presigned direct-to-storage APIs
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
