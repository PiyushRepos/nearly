import { db } from "../config/db.js";
import { notifications } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";

// ─── GET /api/notifications ───────────────────────────────────────────────────
export async function getNotifications(req, res, next) {
  try {
    const { unread } = req.query;

    const conditions = [eq(notifications.userId, req.user.id)];
    if (unread === "true") {
      conditions.push(eq(notifications.isRead, false));
    }

    const data = await db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt))
      .limit(30);

    const unreadCount = data.filter((n) => !n.isRead).length;

    res.json({ data, unreadCount });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/notifications/read-all ───────────────────────────────────────
export async function markAllRead(req, res, next) {
  try {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.userId, req.user.id),
          eq(notifications.isRead, false)
        )
      );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/notifications/:id/read ───────────────────────────────────────
export async function markOneRead(req, res, next) {
  try {
    const { id } = req.params;

    await db
      .update(notifications)
      .set({ isRead: true })
      .where(
        and(
          eq(notifications.id, id),
          eq(notifications.userId, req.user.id)
        )
      );

    res.json({ message: "Notification marked as read" });
  } catch (err) {
    next(err);
  }
}
