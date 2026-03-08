import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { requireRole } from "../middleware/requireRole.js";
import {
  createOrder,
  verifyPayment,
  getPaymentHistory,
  getEarnings,
} from "../controllers/payments.controller.js";

const router = Router();

router.use(requireAuth);

// Customer pays after provider marks job complete
router.post("/create-order",  requireRole("customer"), createOrder);
router.post("/verify",        requireRole("customer"), verifyPayment);
router.get("/history",        requireRole("customer"), getPaymentHistory);

// Provider earnings
router.get("/earnings",       requireRole("provider"), getEarnings);

export default router;
