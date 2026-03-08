import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import { submitReview } from "../controllers/reviews.controller.js";

const reviewSchema = z.object({
  bookingId: z.string().min(1),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

const router = Router();

router.post("/", requireAuth, requireRole("customer"), validate(reviewSchema), submitReview);

export default router;
