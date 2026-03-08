import { db } from "../config/db.js";
import { reviews, bookings, providerProfiles, serviceCategories, user } from "../db/schema.js";
import { eq, and, sql, desc } from "drizzle-orm";
import { notify } from "../lib/notify.js";

// ─── POST /api/reviews ────────────────────────────────────────────────────────
export async function submitReview(req, res, next) {
  try {
    const { bookingId, rating, comment } = req.body;

    // Verify the booking belongs to this customer and is completed + paid
    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.id, bookingId),
          eq(bookings.customerId, req.user.id)
        )
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    if (booking.status !== "completed" || booking.paymentStatus !== "paid") {
      return res
        .status(409)
        .json({ error: "Reviews can only be submitted for completed and paid bookings" });
    }

    if (!booking.providerId) {
      return res.status(409).json({ error: "No provider associated with this booking" });
    }

    // Prevent duplicate reviews
    const [existing] = await db
      .select({ id: reviews.id })
      .from(reviews)
      .where(eq(reviews.bookingId, bookingId))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Review already submitted for this booking" });
    }

    const [review] = await db
      .insert(reviews)
      .values({
        id: crypto.randomUUID(),
        bookingId,
        customerId: req.user.id,
        providerId: booking.providerId,
        rating,
        comment: comment ?? null,
        isApproved: true,
        isFlagged: false,
        createdAt: new Date(),
      })
      .returning();

    // Recalculate provider's avg rating
    const [stats] = await db
      .select({
        avg: sql`avg(rating)`.mapWith(Number),
        count: sql`count(*)`.mapWith(Number),
      })
      .from(reviews)
      .where(
        and(
          eq(reviews.providerId, booking.providerId),
          eq(reviews.isApproved, true)
        )
      );

    await db
      .update(providerProfiles)
      .set({
        avgRating: stats.avg.toFixed(2),
        totalReviews: stats.count,
        updatedAt: new Date(),
      })
      .where(eq(providerProfiles.id, booking.providerId));

    // Notify the provider
    const [provider] = await db
      .select({ userId: providerProfiles.userId })
      .from(providerProfiles)
      .where(eq(providerProfiles.id, booking.providerId))
      .limit(1);

    if (provider) {
      await notify(provider.userId, {
        title: `New ${rating}★ review`,
        body: comment
          ? `"${comment.slice(0, 60)}${comment.length > 60 ? "…" : ""}"`
          : "A customer left you a review.",
        link: `/provider/dashboard`,
      });
    }

    res.status(201).json({ data: review });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/reviews/provider/:providerId ────────────────────────────────────
// Public — no auth required
export async function getProviderReviews(req, res, next) {
  try {
    const { providerId } = req.params;

    const customerUser = user;
    const data = await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customerName: customerUser.name,
        customerImage: customerUser.image,
      })
      .from(reviews)
      .leftJoin(customerUser, eq(reviews.customerId, customerUser.id))
      .where(and(eq(reviews.providerId, providerId), eq(reviews.isApproved, true)))
      .orderBy(desc(reviews.createdAt));

    res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/reviews/mine ────────────────────────────────────────────────────
// Customer auth — reviews submitted by this customer
export async function getMyReviews(req, res, next) {
  try {
    const providerUser = user;
    const data = await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        categoryName: serviceCategories.name,
        categoryIcon: serviceCategories.icon,
        providerName: providerUser.name,
        providerImage: providerUser.image,
      })
      .from(reviews)
      .leftJoin(bookings, eq(reviews.bookingId, bookings.id))
      .leftJoin(serviceCategories, eq(bookings.categoryId, serviceCategories.id))
      .leftJoin(providerProfiles, eq(reviews.providerId, providerProfiles.id))
      .leftJoin(providerUser, eq(providerProfiles.userId, providerUser.id))
      .where(eq(reviews.customerId, req.user.id))
      .orderBy(desc(reviews.createdAt));

    res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/reviews/received ────────────────────────────────────────────────
// Provider auth — reviews received by this provider
export async function getReceivedReviews(req, res, next) {
  try {
    // Get provider profile id for this user
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Provider profile not found" });

    const customerUser = user;
    const data = await db
      .select({
        id: reviews.id,
        bookingId: reviews.bookingId,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        categoryName: serviceCategories.name,
        categoryIcon: serviceCategories.icon,
        customerName: customerUser.name,
        customerImage: customerUser.image,
      })
      .from(reviews)
      .leftJoin(bookings, eq(reviews.bookingId, bookings.id))
      .leftJoin(serviceCategories, eq(bookings.categoryId, serviceCategories.id))
      .leftJoin(customerUser, eq(reviews.customerId, customerUser.id))
      .where(eq(reviews.providerId, profile.id))
      .orderBy(desc(reviews.createdAt));

    res.json({ data, total: data.length });
  } catch (err) {
    next(err);
  }
}
