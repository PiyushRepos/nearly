import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { z } from "zod";
import {
  createBooking,
  getBookings,
  getBooking,
  cancelBooking,
  rescheduleBooking,
} from "../controllers/bookings.controller.js";

const createBookingSchema = z.object({
  providerId: z.string().min(1),
  categoryId: z.string().min(1),
  address: z.string().min(5),
  city: z.string().min(1),
  area: z.string().min(1),
  scheduledAt: z.string().datetime(),
  notes: z.string().optional(),
});

const rescheduleSchema = z.object({
  scheduledAt: z.string().datetime(),
});

const router = Router();

router.use(requireAuth, requireRole("customer"));

router.post("/",                            upload.single("attachment"), createBooking);
router.get("/",                             getBookings);
router.get("/:id",                          getBooking);
router.patch("/:id/cancel",                 cancelBooking);
router.patch("/:id/reschedule",             validate(rescheduleSchema), rescheduleBooking);

export default router;
