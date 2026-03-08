import { db } from "../config/db.js";
import {
  user,
  providerProfiles,
  serviceCategories,
  reviews,
  bookings,
} from "../db/schema.js";
import { eq, and, or, sql } from "drizzle-orm";

// ─── POST /api/admin/seed ──────────────────────────────────────────────────────
// One-time bootstrap: promotes a user to admin by email.
export async function seedAdmin(req, res, next) {
  try {
    const { email, secret } = req.body;

    if (!secret || secret !== process.env.ADMIN_SEED_SECRET) {
      return res.status(403).json({ error: "Invalid seed secret" });
    }

    const [target] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!target) return res.status(404).json({ error: "User not found" });

    await db
      .update(user)
      .set({ role: "admin" })
      .where(eq(user.email, email));

    res.json({ message: `${email} promoted to admin` });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/providers?status=pending ──────────────────────────────────
export async function getPendingProviders(req, res, next) {
  try {
    const { status = "pending", page = "1", limit = "20" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const isApproved = status === "approved";

    const data = await db
      .select({
        id: providerProfiles.id,
        userId: providerProfiles.userId,
        bio: providerProfiles.bio,
        city: providerProfiles.city,
        area: providerProfiles.area,
        isApproved: providerProfiles.isApproved,
        documentsUrl: providerProfiles.documentsUrl,
        createdAt: providerProfiles.createdAt,
        name: user.name,
        email: user.email,
        image: user.image,
      })
      .from(providerProfiles)
      .innerJoin(user, eq(providerProfiles.userId, user.id))
      .where(eq(providerProfiles.isApproved, isApproved))
      .orderBy(sql`${providerProfiles.createdAt} desc`)
      .limit(parseInt(limit))
      .offset(offset);

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/providers/:id/approve ───────────────────────────────────
export async function approveProvider(req, res, next) {
  try {
    const { id } = req.params;
    await db
      .update(providerProfiles)
      .set({ isApproved: true, updatedAt: new Date() })
      .where(eq(providerProfiles.id, id));

    res.json({ message: "Provider approved" });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/providers/:id/reject ────────────────────────────────────
export async function rejectProvider(req, res, next) {
  try {
    const { id } = req.params;
    await db
      .update(providerProfiles)
      .set({ isApproved: false, updatedAt: new Date() })
      .where(eq(providerProfiles.id, id));

    res.json({ message: "Provider rejected" });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/categories ────────────────────────────────────────────────
export async function getAdminCategories(_req, res, next) {
  try {
    const data = await db
      .select()
      .from(serviceCategories)
      .orderBy(serviceCategories.name);

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/admin/categories ───────────────────────────────────────────────
export async function createCategory(req, res, next) {
  try {
    const { name, slug, description, icon, basePrice } = req.body;

    const [existing] = await db
      .select({ id: serviceCategories.id })
      .from(serviceCategories)
      .where(eq(serviceCategories.slug, slug))
      .limit(1);

    if (existing) {
      return res.status(409).json({ error: "Slug already exists" });
    }

    const [created] = await db
      .insert(serviceCategories)
      .values({
        id: crypto.randomUUID(),
        name,
        slug,
        description: description ?? null,
        icon: icon ?? null,
        basePrice: basePrice ? String(basePrice) : null,
        isActive: true,
        createdAt: new Date(),
      })
      .returning();

    res.status(201).json({ data: created });
  } catch (err) {
    next(err);
  }
}

// ─── PUT /api/admin/categories/:id ────────────────────────────────────────────
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, basePrice, isActive } = req.body;

    const [updated] = await db
      .update(serviceCategories)
      .set({
        name,
        slug,
        description: description ?? null,
        icon: icon ?? null,
        basePrice: basePrice ? String(basePrice) : null,
        isActive: isActive !== undefined ? isActive : true,
      })
      .where(eq(serviceCategories.id, id))
      .returning();

    if (!updated) return res.status(404).json({ error: "Category not found" });

    res.json({ data: updated });
  } catch (err) {
    next(err);
  }
}

// ─── DELETE /api/admin/categories/:id ────────────────────────────────────────
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    await db
      .update(serviceCategories)
      .set({ isActive: false })
      .where(eq(serviceCategories.id, id));

    res.json({ message: "Category deactivated" });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/reviews ───────────────────────────────────────────────────
export async function getAdminReviews(req, res, next) {
  try {
    const { flagged = "false" } = req.query;

    const conditions = flagged === "true"
      ? [eq(reviews.isFlagged, true)]
      : [];

    const data = await db
      .select()
      .from(reviews)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(sql`${reviews.createdAt} desc`)
      .limit(50);

    res.json({ data });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/reviews/:id/approve ────────────────────────────────────
export async function approveReview(req, res, next) {
  try {
    const { id } = req.params;
    await db
      .update(reviews)
      .set({ isApproved: true, isFlagged: false })
      .where(eq(reviews.id, id));

    res.json({ message: "Review approved" });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/admin/reviews/:id/flag ───────────────────────────────────────
export async function flagReview(req, res, next) {
  try {
    const { id } = req.params;
    await db
      .update(reviews)
      .set({ isFlagged: true, isApproved: false })
      .where(eq(reviews.id, id));

    res.json({ message: "Review flagged" });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/stats ─────────────────────────────────────────────────────
export async function getStats(_req, res, next) {
  try {
    const [bookingStats] = await db
      .select({
        total: sql`count(*)`.mapWith(Number),
        requested: sql`count(*) filter (where status = 'requested')`.mapWith(Number),
        confirmed: sql`count(*) filter (where status = 'confirmed')`.mapWith(Number),
        in_progress: sql`count(*) filter (where status = 'in_progress')`.mapWith(Number),
        completed: sql`count(*) filter (where status = 'completed')`.mapWith(Number),
        cancelled: sql`count(*) filter (where status = 'cancelled')`.mapWith(Number),
      })
      .from(bookings);

    const [userStats] = await db
      .select({
        total: sql`count(*)`.mapWith(Number),
        customers: sql`count(*) filter (where role = 'customer')`.mapWith(Number),
        providers: sql`count(*) filter (where role = 'provider')`.mapWith(Number),
      })
      .from(user);

    const [pendingProviders] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(providerProfiles)
      .where(eq(providerProfiles.isApproved, false));

    res.json({
      data: {
        bookings: bookingStats,
        users: userStats,
        pendingProviderApprovals: pendingProviders.count,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
export async function getAdminUsers(req, res, next) {
  try {
    const { role, page = "1", limit = "30" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = role ? [eq(user.role, role)] : [];

    const data = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        image: user.image,
        phone: user.phone,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      })
      .from(user)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(sql`${user.createdAt} desc`)
      .limit(parseInt(limit))
      .offset(offset);

    res.json({ data });
  } catch (err) {
    next(err);
  }
}
