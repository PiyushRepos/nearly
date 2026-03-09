import { db } from "../config/db.js";
import {
  providerProfiles,
  providerServices,
  bookings,
  bookingUpdates,
  serviceCategories,
  user,
} from "../db/schema.js";
import { eq, and, inArray, sql } from "drizzle-orm";
import { uploadBuffer } from "../config/cloudinary.js";
import { notify } from "../lib/notify.js";

// ─── GET /api/provider/profile ────────────────────────────────────────────────
export async function getProfile(req, res, next) {
  try {
    const [profile] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const services = await db
      .select({
        id: serviceCategories.id,
        name: serviceCategories.name,
        slug: serviceCategories.slug,
        icon: serviceCategories.icon,
      })
      .from(providerServices)
      .innerJoin(
        serviceCategories,
        eq(providerServices.categoryId, serviceCategories.id)
      )
      .where(eq(providerServices.providerId, profile.id));

    res.json({ data: { ...profile, services } });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/provider/profile ───────────────────────────────────────────────
export async function createProfile(req, res, next) {
  try {
    const existing = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Profile already exists. Use PUT to update." });
    }

    const { bio, city, area, latitude, longitude, hourlyRate, categoryIds } = req.body;

    let coverPhotoUrl = null;
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, {
        folder: "nearly/provider-covers",
      });
      coverPhotoUrl = result.secure_url;
    }

    const profileId = crypto.randomUUID();
    await db.insert(providerProfiles).values({
      id: profileId,
      userId: req.user.id,
      bio: bio ?? null,
      city,
      area,
      latitude: latitude ? String(latitude) : null,
      longitude: longitude ? String(longitude) : null,
      hourlyRate: hourlyRate ? String(hourlyRate) : null,
      coverPhotoUrl,
      isApproved: false,
      availabilityStatus: "available",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Link offered categories
    if (Array.isArray(categoryIds) && categoryIds.length > 0) {
      await db.insert(providerServices).values(
        categoryIds.map((cid) => ({ providerId: profileId, categoryId: cid }))
      );
    }

    const [created] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.id, profileId))
      .limit(1);

    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/provider/profile ────────────────────────────────────────────────
export async function updateProfile(req, res, next) {
  try {
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const { bio, city, area, latitude, longitude, hourlyRate, categoryIds } = req.body;

    let coverPhotoUrl = undefined;
    if (req.file) {
      const result = await uploadBuffer(req.file.buffer, {
        folder: "nearly/provider-covers",
      });
      coverPhotoUrl = result.secure_url;
    }

    const updates = {
      bio: bio ?? null,
      city,
      area,
      latitude: latitude !== undefined ? String(latitude) : undefined,
      longitude: longitude !== undefined ? String(longitude) : undefined,
      hourlyRate: hourlyRate ? String(hourlyRate) : null,
      updatedAt: new Date(),
    };
    if (coverPhotoUrl !== undefined) updates.coverPhotoUrl = coverPhotoUrl;

    await db
      .update(providerProfiles)
      .set(updates)
      .where(eq(providerProfiles.id, profile.id));

    // Sync offered categories
    if (Array.isArray(categoryIds)) {
      await db
        .delete(providerServices)
        .where(eq(providerServices.providerId, profile.id));

      if (categoryIds.length > 0) {
        await db.insert(providerServices).values(
          categoryIds.map((cid) => ({ providerId: profile.id, categoryId: cid }))
        );
      }
    }

    const [updated] = await db
      .select()
      .from(providerProfiles)
      .where(eq(providerProfiles.id, profile.id))
      .limit(1);

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/provider/profile/availability ─────────────────────────────────
export async function updateAvailability(req, res, next) {
  try {
    const { status } = req.body;

    await db
      .update(providerProfiles)
      .set({ availabilityStatus: status, updatedAt: new Date() })
      .where(eq(providerProfiles.userId, req.user.id));

    res.json({ message: "Availability updated", status });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/provider/bookings/:id ─────────────────────────────────────────
export async function getProviderBooking(req, res, next) {
  try {
    const { id } = req.params;
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not set up" });

    const [booking] = await db
      .select({
        id: bookings.id,
        status: bookings.status,
        scheduledAt: bookings.scheduledAt,
        address: bookings.address,
        city: bookings.city,
        area: bookings.area,
        notes: bookings.notes,
        attachmentUrl: bookings.attachmentUrl,
        quotedPrice: bookings.quotedPrice,
        finalPrice: bookings.finalPrice,
        paymentStatus: bookings.paymentStatus,
        createdAt: bookings.createdAt,
        updatedAt: bookings.updatedAt,
        categoryId: bookings.categoryId,
        categoryName: serviceCategories.name,
        categoryIcon: serviceCategories.icon,
        customerId: bookings.customerId,
        customerName: user.name,
        customerImage: user.image,
      })
      .from(bookings)
      .leftJoin(serviceCategories, eq(bookings.categoryId, serviceCategories.id))
      .leftJoin(user, eq(bookings.customerId, user.id))
      .where(and(eq(bookings.id, id), eq(bookings.providerId, profile.id)))
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const updates = await db
      .select()
      .from(bookingUpdates)
      .where(eq(bookingUpdates.bookingId, id))
      .orderBy(sql`${bookingUpdates.createdAt} asc`);

    res.json({ data: { ...booking, updates } });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/provider/bookings ───────────────────────────────────────────────
export async function getProviderBookings(req, res, next) {
  try {
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not set up" });

    const { status, page = "1", limit = "10" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(bookings.providerId, profile.id)];
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
        customerName: user.name,
        customerImage: user.image,
      })
      .from(bookings)
      .leftJoin(serviceCategories, eq(bookings.categoryId, serviceCategories.id))
      .leftJoin(user, eq(bookings.customerId, user.id))
      .where(and(...conditions))
      .orderBy(sql`${bookings.createdAt} desc`)
      .limit(parseInt(limit))
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(bookings)
      .where(and(...conditions));

    res.json({ data, total: count });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/provider/bookings/:id/accept ─────────────────────────────────
export async function acceptBooking(req, res, next) {
  try {
    const { id } = req.params;
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not set up" });

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.providerId, profile.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "requested") {
      return res.status(409).json({ error: "Booking is no longer in requested state" });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(bookings)
        .set({ status: "confirmed", updatedAt: new Date() })
        .where(eq(bookings.id, id));

      await tx.insert(bookingUpdates).values({
        id: crypto.randomUUID(),
        bookingId: id,
        status: "confirmed",
        message: "Your booking has been accepted by the professional.",
        images: [],
        createdById: req.user.id,
        createdAt: new Date(),
      });
    });

    await notify(booking.customerId, {
      title: "Booking confirmed! 🎉",
      body: "Your service professional has accepted your booking.",
      link: `/customer/bookings/${id}`,
    });

    res.json({ message: "Booking accepted" });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/provider/bookings/:id/reject ─────────────────────────────────
export async function rejectBooking(req, res, next) {
  try {
    const { id } = req.params;
    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not set up" });

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.providerId, profile.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });
    if (booking.status !== "requested") {
      return res.status(409).json({ error: "Booking is no longer in requested state" });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(bookings)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(eq(bookings.id, id));

      await tx.insert(bookingUpdates).values({
        id: crypto.randomUUID(),
        bookingId: id,
        status: "cancelled",
        message: "Your booking was declined by the professional.",
        images: [],
        createdById: req.user.id,
        createdAt: new Date(),
      });
    });

    await notify(booking.customerId, {
      title: "Booking declined",
      body: "The professional was unable to accept your booking. Try another provider.",
      link: `/browse`,
    });

    res.json({ message: "Booking rejected" });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/provider/bookings/:id/status ─────────────────────────────────
// Valid transitions:  confirmed → in_progress → completed
export async function updateJobStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not set up" });

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.providerId, profile.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    const allowed = {
      confirmed: "in_progress",
      in_progress: "completed",
    };

    if (allowed[booking.status] !== status) {
      return res.status(409).json({
        error: `Cannot transition from '${booking.status}' to '${status}'`,
      });
    }

    const updates = { status, updatedAt: new Date() };
    if (status === "completed") updates.finalPrice = booking.quotedPrice;

    const messages = {
      in_progress: "Work has started on your booking.",
      completed: "Work is complete! Please pay to close the booking.",
    };

    await db.transaction(async (tx) => {
      await tx.update(bookings).set(updates).where(eq(bookings.id, id));

      await tx.insert(bookingUpdates).values({
        id: crypto.randomUUID(),
        bookingId: id,
        status,
        message: messages[status],
        images: [],
        createdById: req.user.id,
        createdAt: new Date(),
      });

      // Increment totalBookings on completion
      if (status === "completed") {
        await tx
          .update(providerProfiles)
          .set({
            totalBookings: sql`${providerProfiles.totalBookings} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(providerProfiles.id, profile.id));
      }
    });

    await notify(booking.customerId, {
      title: status === "completed" ? "Job complete — pay now" : "Work has started",
      body: messages[status],
      link: `/customer/bookings/${id}`,
    });

    res.json({ message: "Status updated", status });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/provider/bookings/:id/updates ─────────────────────────────────
export async function addWorkUpdate(req, res, next) {
  try {
    const { id } = req.params;
    const { message } = req.body;

    const [profile] = await db
      .select({ id: providerProfiles.id })
      .from(providerProfiles)
      .where(eq(providerProfiles.userId, req.user.id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Profile not set up" });

    const [booking] = await db
      .select()
      .from(bookings)
      .where(
        and(eq(bookings.id, id), eq(bookings.providerId, profile.id))
      )
      .limit(1);

    if (!booking) return res.status(404).json({ error: "Booking not found" });

    // Upload any attached images
    const imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadBuffer(file.buffer, {
          folder: "nearly/work-updates",
        });
        imageUrls.push(result.secure_url);
      }
    }

    const [update] = await db
      .insert(bookingUpdates)
      .values({
        id: crypto.randomUUID(),
        bookingId: id,
        status: booking.status,
        message: message || null,
        images: imageUrls,
        createdById: req.user.id,
        createdAt: new Date(),
      })
      .returning();

    await notify(booking.customerId, {
      title: "Update from your professional",
      body: message || "New work photos added.",
      link: `/customer/bookings/${id}`,
    });

    res.status(201).json({ data: update });
  } catch (err) {
    next(err);
  }
}
