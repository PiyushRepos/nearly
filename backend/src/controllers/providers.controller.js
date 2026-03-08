import { db } from "../config/db.js";
import {
  providerProfiles,
  user,
  providerServices,
  serviceCategories,
  reviews,
} from "../db/schema.js";
import { eq, and, ilike, sql } from "drizzle-orm";

export async function getProviders(req, res, next) {
  try {
    const { category, city, area, page = "1", limit = "12" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(providerProfiles.isApproved, true)];
    if (city) conditions.push(ilike(providerProfiles.city, `%${city}%`));
    if (area) conditions.push(ilike(providerProfiles.area, `%${area}%`));

    // If filtering by category, join providerServices
    let query = db
      .select({
        id: providerProfiles.id,
        userId: providerProfiles.userId,
        city: providerProfiles.city,
        area: providerProfiles.area,
        bio: providerProfiles.bio,
        hourlyRate: providerProfiles.hourlyRate,
        availabilityStatus: providerProfiles.availabilityStatus,
        coverPhotoUrl: providerProfiles.coverPhotoUrl,
        avgRating: providerProfiles.avgRating,
        totalReviews: providerProfiles.totalReviews,
        name: user.name,
        image: user.image,
      })
      .from(providerProfiles)
      .innerJoin(user, eq(providerProfiles.userId, user.id))
      .where(and(...conditions))
      .limit(parseInt(limit))
      .offset(offset);

    if (category) {
      query = db
        .select({
          id: providerProfiles.id,
          userId: providerProfiles.userId,
          city: providerProfiles.city,
          area: providerProfiles.area,
          bio: providerProfiles.bio,
          hourlyRate: providerProfiles.hourlyRate,
          availabilityStatus: providerProfiles.availabilityStatus,
          coverPhotoUrl: providerProfiles.coverPhotoUrl,
          avgRating: providerProfiles.avgRating,
          totalReviews: providerProfiles.totalReviews,
          name: user.name,
          image: user.image,
        })
        .from(providerProfiles)
        .innerJoin(user, eq(providerProfiles.userId, user.id))
        .innerJoin(
          providerServices,
          eq(providerServices.providerId, providerProfiles.id)
        )
        .innerJoin(
          serviceCategories,
          eq(providerServices.categoryId, serviceCategories.id)
        )
        .where(
          and(...conditions, eq(serviceCategories.slug, category))
        )
        .limit(parseInt(limit))
        .offset(offset);
    }

    const data = await query;

    const [{ count }] = await db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(providerProfiles)
      .where(and(...conditions));

    res.json({ data, total: count, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getProviderById(req, res, next) {
  try {
    const { id } = req.params;

    const [profile] = await db
      .select({
        id: providerProfiles.id,
        userId: providerProfiles.userId,
        bio: providerProfiles.bio,
        city: providerProfiles.city,
        area: providerProfiles.area,
        hourlyRate: providerProfiles.hourlyRate,
        availabilityStatus: providerProfiles.availabilityStatus,
        coverPhotoUrl: providerProfiles.coverPhotoUrl,
        avgRating: providerProfiles.avgRating,
        totalReviews: providerProfiles.totalReviews,
        totalBookings: providerProfiles.totalBookings,
        name: user.name,
        image: user.image,
      })
      .from(providerProfiles)
      .innerJoin(user, eq(providerProfiles.userId, user.id))
      .where(eq(providerProfiles.id, id))
      .limit(1);

    if (!profile) return res.status(404).json({ error: "Provider not found" });

    // Fetch offered categories
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
      .where(eq(providerServices.providerId, id));

    res.json({ data: { ...profile, services } });
  } catch (err) {
    next(err);
  }
}

export async function getProviderReviews(req, res, next) {
  try {
    const { id } = req.params;
    const { page = "1", limit = "10" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const data = await db
      .select({
        id: reviews.id,
        rating: reviews.rating,
        comment: reviews.comment,
        createdAt: reviews.createdAt,
        customerName: user.name,
        customerImage: user.image,
      })
      .from(reviews)
      .innerJoin(user, eq(reviews.customerId, user.id))
      .where(
        and(
          eq(reviews.providerId, id),
          eq(reviews.isApproved, true),
          eq(reviews.isFlagged, false)
        )
      )
      .orderBy(sql`${reviews.createdAt} desc`)
      .limit(parseInt(limit))
      .offset(offset);

    res.json({ data });
  } catch (err) {
    next(err);
  }
}
