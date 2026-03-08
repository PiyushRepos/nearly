import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createOrder,
  verifyPayment,
} from "../controllers/payments.controller.js";

const router = Router();

router.use(requireAuth);

// Customer pays after provider marks job complete
router.post("/create-order",  requireRole("customer"), createOrder);
router.post("/verify",        requireRole("customer"), verifyPayment);

export default router;
