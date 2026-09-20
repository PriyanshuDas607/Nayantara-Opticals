import { Router } from "express";
import { AppointmentController } from "../controllers/appointment.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { validate } from "../middlewares/validate.js";
import { bookAppointmentSchema } from "../validation/schemas.js";

const router = Router();

router.get("/slots", AppointmentController.getSlots);
router.post("/", authenticate, validate(bookAppointmentSchema), AppointmentController.book);
router.get("/me", authenticate, AppointmentController.getMyAppointments);
router.patch("/:id/cancel", authenticate, AppointmentController.cancelAppointment);

export default router;
