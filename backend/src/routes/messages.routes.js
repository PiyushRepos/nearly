import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getMessages, sendMessage } from "../controllers/messages.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/:bookingId", getMessages);
router.post("/:bookingId", sendMessage);

export default router;
