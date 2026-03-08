import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import { validate } from "../middleware/validate.js";
import { z } from "zod";
import {
  getPendingProviders,
  approveProvider,
  rejectProvider,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminReviews,
  approveReview,
  flagReview,
  getStats,
  seedAdmin,
} from "../controllers/admin.controller.js";

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  icon: z.string().optional(),
  basePrice: z.coerce.number().positive().optional(),
});

const router = Router();

// Public seed endpoint (protected by secret in body)
router.post("/seed", seedAdmin);

router.use(requireAuth, requireRole("admin"));

// Provider approval
router.get("/providers",              getPendingProviders);
router.patch("/providers/:id/approve",approveProvider);
router.patch("/providers/:id/reject", rejectProvider);

// Categories CRUD
router.get("/categories",             getAdminCategories);
router.post("/categories",            validate(categorySchema), createCategory);
router.put("/categories/:id",         validate(categorySchema), updateCategory);
router.delete("/categories/:id",      deleteCategory);

// Reviews moderation
router.get("/reviews",                getAdminReviews);
router.patch("/reviews/:id/approve",  approveReview);
router.patch("/reviews/:id/flag",     flagReview);

// Dashboard stats
router.get("/stats",                  getStats);

export default router;
