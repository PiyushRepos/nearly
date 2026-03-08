import { db } from "../config/db.js";
import { notifications } from "../db/schema.js";

/**
 * Insert an in-app notification for a user.
 *
 * @param {string} userId
 * @param {{ title: string, body: string, link?: string }} payload
 */
export async function notify(userId, { title, body, link = null }) {
  await db.insert(notifications).values({
    id: crypto.randomUUID(),
    userId,
    title,
    body,
    link,
    isRead: false,
    createdAt: new Date(),
  });
}
