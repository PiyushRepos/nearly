import { Router } from "express";
import categoriesRouter from "./categories.routes.js";
import providersRouter from "./providers.routes.js";
import bookingsRouter from "./bookings.routes.js";
import providerJobRouter from "./providerJob.routes.js";
import adminRouter from "./admin.routes.js";
import uploadsRouter from "./uploads.routes.js";
import paymentsRouter from "./payments.routes.js";
import notificationsRouter from "./notifications.routes.js";
import reviewsRouter from "./reviews.routes.js";

const router = Router();

router.use("/categories",         categoriesRouter);
router.use("/providers",          providersRouter);
router.use("/customer/bookings",  bookingsRouter);
router.use("/provider",           providerJobRouter);
router.use("/admin",              adminRouter);
router.use("/uploads",            uploadsRouter);
router.use("/payments",           paymentsRouter);
router.use("/notifications",      notificationsRouter);
router.use("/reviews",            reviewsRouter);

export default router;
