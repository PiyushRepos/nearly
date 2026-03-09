import { db } from "../config/db.js";
import { messages, bookings, providerProfiles, user } from "../db/schema.js";
import { eq, and, sql } from "drizzle-orm";
import { getIO } from "../lib/socket.js";
import { randomUUID } from "node:crypto";

export async function getMessages(req, res, next) {
    try {
        const { bookingId } = req.params;
        const userId = req.user.id;

        const [bookingData] = await db
            .select({
                customerId: bookings.customerId,
                providerUserId: providerProfiles.userId,
            })
            .from(bookings)
            .leftJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
            .where(eq(bookings.id, bookingId));

        if (!bookingData) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (bookingData.customerId !== userId && bookingData.providerUserId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const chatHistory = await db
            .select({
                id: messages.id,
                bookingId: messages.bookingId,
                senderId: messages.senderId,
                content: messages.content,
                isRead: messages.isRead,
                createdAt: messages.createdAt,
            })
            .from(messages)
            .where(eq(messages.bookingId, bookingId))
            .orderBy(sql`${messages.createdAt} asc`);

        res.json({ data: chatHistory });
    } catch (err) {
        next(err);
    }
}

export async function sendMessage(req, res, next) {
    try {
        const { bookingId } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!content) return res.status(400).json({ error: "Message content is required" });

        const [bookingData] = await db
            .select({
                customerId: bookings.customerId,
                providerUserId: providerProfiles.userId,
            })
            .from(bookings)
            .leftJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
            .where(eq(bookings.id, bookingId));

        if (!bookingData) {
            return res.status(404).json({ error: "Booking not found" });
        }
        if (bookingData.customerId !== userId && bookingData.providerUserId !== userId) {
            return res.status(403).json({ error: "Access denied" });
        }

        const id = randomUUID();
        const [newMessage] = await db
            .insert(messages)
            .values({
                id,
                bookingId,
                senderId: userId,
                content,
            })
            .returning();

        const io = getIO();
        io.to(`booking-${bookingId}`).emit("newMessage", newMessage);

        res.status(201).json({ data: newMessage });
    } catch (err) {
        next(err);
    }
}
