import { db } from "../config/db.js";
import {
  bookings,
  bookingUpdates,
  providerProfiles,
  serviceCategories,
  user,
  reviews,
} from "../db/schema.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import { uploadBuffer } from "../config/cloudinary.js";
import { notify } from "../lib/notify.js";

// ─── POST /api/customer/bookings ──────────────────────────────────────────────
export async function createBooking(req, res, next) {
  try {
    const { providerId, categoryId, address, city, area, latitude, longitude, scheduledAt, notes } =
      req.body;

    // Validate provider exists and is approved
    const [provider] = await db
      .select()
      .from(providerProfiles)
      .where(
        and(
          eq(providerProfiles.id, providerId),
          eq(providerProfiles.isApproved, true)
        )
      )
      .limit(1);

    if (!provider) {
      return res.status(404).json({ error: "Provider not found or not approved" });
    }

    // Calculate quoted price from hourly rate (1 hour default)
    const quotedPrice = provider.hourlyRate ?? null;

    // Handle optional image upload
    let attachmentUrl = null;
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, {
        folder: "nearly/booking-attachments",
      });
      attachmentUrl = result.secure_url;
    }

    const bookingId = crypto.randomUUID();

    const created = await db.transaction(async (tx) => {
      await tx.insert(bookings).values({
        id: bookingId,
        customerId: req.user.id,
        providerId,
        categoryId,
        address,
        city,
        area,
        latitude: latitude ? String(latitude) : null,
        longitude: longitude ? String(longitude) : null,
        scheduledAt: new Date(scheduledAt),
        notes: notes ?? null,
        attachmentUrl,
        status: "requested",
        quotedPrice,
        paymentStatus: "unpaid",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Insert initial status update
      await tx.insert(bookingUpdates).values({
        id: crypto.randomUUID(),
        bookingId,
        status: "requested",
        message: "Booking request submitted.",
        images: [],
        createdById: req.user.id,
        createdAt: new Date(),
      });

      const [newBooking] = await tx
        .select()
        .from(bookings)
        .where(eq(bookings.id, bookingId))
        .limit(1);

      return newBooking;
    });

    // Notify provider via in-app notification
    await notify(provider.userId, {
      title: "New booking request",
      body: `You have a new booking request for ${address}.`,
      link: `/provider/bookings/${bookingId}`,
    });

    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/customer/bookings ───────────────────────────────────────────────
export async function getBookings(req, res, next) {
  try {
    const { status, page = "1", limit = "10" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(bookings.customerId, req.user.id)];
    if (status) {
      const statuses = status.split(",");
      conditions.push(inArray(bookings.status, statuses));
    }

    const data = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        scheduledAt: bookings.scheduledAt,
        address: bookings.address,
        city: bookings.city,
        area: bookings.area,
        quotedPrice: bookings.quotedPrice,
        paymentStatus: bookings.paymentStatus,
        createdAt: bookings.createdAt,
        categoryName: serviceCategories.name,
        categoryIcon: serviceCategories.icon,
        providerName: user.name,
        providerImage: user.image,
      })
      .from(bookings)
      .leftJoin(serviceCategories, eq(bookings.categoryId, serviceCategories.id))
      .leftJoin(providerProfiles, eq(bookings.providerId, providerProfiles.id))
      .leftJoin(user, eq(providerProfiles.userId, user.id))
      .where(and(...conditions))
      .orderBy(sql`${bookings.createdAt} desc`)
      .limit(parseInt(limit))
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(bookings)
      .where(and(...conditions));

    res.json({ data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/customer/bookings/:id ──────────────────────────────────────────
export async function getBooking(req, res, next) {
  try {
    const { id } = req.params;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.customerId, req.user.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const updates = await db
      .select()
      .from(bookingUpdates)
      .where(eq(bookingUpdates.bookingId, id))
      .orderBy(sql`${bookingUpdates.createdAt} asc`);

    const [existingReview] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.bookingId, id))
      .limit(1);

    res.json({ data: { ...booking, updates, hasReview: !!existingReview } });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/customer/bookings/:id/cancel ─────────────────────────────────
export async function cancelBooking(req, res, next) {
  try {
    const { id } = req.params;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.customerId, req.user.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const cancellableStatuses = ["requested", "confirmed"];
    if (!cancellableStatuses.includes(booking.status)) {
      return res
        .status(409)
        .json({ error: `Cannot cancel a booking with status '${booking.status}'` });
    }

    await db
      .update(bookings)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(bookings.id, id));

    await db.insert(bookingUpdates).values({
      id: crypto.randomUUID(),
      bookingId: id,
      status: "cancelled",
      message: "Booking cancelled by customer.",
      images: [],
      createdById: req.user.id,
      createdAt: new Date(),
    });

    // Notify provider if one was assigned
    if (booking.providerId) {
      const [provider] = await db
        .select()
        .from(providerProfiles)
        .where(eq(providerProfiles.id, booking.providerId))
        .limit(1);

      if (provider) {
        await notify(provider.userId, {
          title: "Booking cancelled",
          body: "A customer has cancelled their booking request.",
          link: `/provider/bookings/${id}`,
        });
      }
    }

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/customer/bookings/:id/reschedule ─────────────────────────────
export async function rescheduleBooking(req, res, next) {
  try {
    const { id } = req.params;
    const { scheduledAt } = req.body;

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.customerId, req.user.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const reschedulableStatuses = ["requested", "confirmed"];
    if (!reschedulableStatuses.includes(booking.status)) {
      return res
        .status(409)
        .json({ error: `Cannot reschedule a booking with status '${booking.status}'` });
    }

    await db
      .update(bookings)
      .set({ scheduledAt: new Date(scheduledAt), updatedAt: new Date() })
      .where(eq(bookings.id, id));

    res.json({ message: "Booking rescheduled" });
  } catch (err) {
    next(err);
  }
}
