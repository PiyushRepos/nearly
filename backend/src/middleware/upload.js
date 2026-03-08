import multer from "multer";

/**
 * Multer instance using in-memory storage.
 * Files arrive as req.file.buffer — upload to Cloudinary in the controller.
 */
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are accepted"));
    }
  },
});
