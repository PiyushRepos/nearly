import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import {
  getNotifications,
  markAllRead,
  markOneRead,
} from "../controllers/notifications.controller.js";

const router = Router();

router.use(requireAuth);

router.get("/",             getNotifications);   // ?unread=true
router.patch("/read-all",   markAllRead);
router.patch("/:id/read",   markOneRead);

export default router;
