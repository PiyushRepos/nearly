import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { upload } from "../middleware/upload.js";
import { uploadImage } from "../controllers/uploads.controller.js";

const router = Router();

router.post("/image", requireAuth, upload.single("file"), uploadImage);

export default router;
