import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { upload } from "../middleware/upload.js";
import { z } from "zod";
import {
  getProfile,
  createProfile,
  updateProfile,
  updateAvailability,
  getProviderBookings,
  acceptBooking,
  rejectBooking,
  updateJobStatus,
  addWorkUpdate,
} from "../controllers/providerJob.controller.js";

const profileSchema = z.object({
  bio: z.string().optional(),
  city: z.string().min(1),
  area: z.string().min(1),
  hourlyRate: z.coerce.number().positive().optional(),
  categoryIds: z.array(z.string()).min(1),
});

const availabilitySchema = z.object({
  status: z.enum(["available", "busy", "unavailable"]),
});

const statusSchema = z.object({
  status: z.enum(["in_progress", "completed"]),
});

const workUpdateSchema = z.object({
  message: z.string().min(1),
});

const router = Router();

router.use(requireAuth, requireRole("provider"));

router.get("/profile",                          getProfile);
router.post("/profile",                         upload.single("coverPhoto"), createProfile);
router.put("/profile",                          upload.single("coverPhoto"), updateProfile);
router.patch("/profile/availability",           validate(availabilitySchema), updateAvailability);

router.get("/bookings",                         getProviderBookings);
router.patch("/bookings/:id/accept",            acceptBooking);
router.patch("/bookings/:id/reject",            rejectBooking);
router.patch("/bookings/:id/status",            validate(statusSchema), updateJobStatus);
router.post("/bookings/:id/updates",            upload.array("images", 5), addWorkUpdate);

export default router;
