import { Router } from "express";
import {
  getProviders,
  getProviderById,
  getProviderReviews,
} from "../controllers/providers.controller.js";

const router = Router();

// Public — no auth required
router.get("/",         getProviders);       // ?category=&city=&area=&page=&limit=
router.get("/:id",      getProviderById);
router.get("/:id/reviews", getProviderReviews);

export default router;
