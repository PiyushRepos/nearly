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
    const { categoryId, city, area, latitude, longitude, radius = "50", page = "1", limit = "12" } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    const conditions = [eq(providerProfiles.isApproved, true)];
    if (city) conditions.push(ilike(providerProfiles.city, `%${city}%`));
    if (area) conditions.push(ilike(providerProfiles.area, `%${area}%`));

    let distanceSql = sql`null`;
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lon = parseFloat(longitude);
      const rad = parseFloat(radius);

      distanceSql = sql`
        (6371 * acos(
          least(1.0,
            cos(radians(${lat})) * 
            cos(radians(cast(${providerProfiles.latitude} as numeric))) * 
            cos(radians(cast(${providerProfiles.longitude} as numeric)) - radians(${lon})) + 
            sin(radians(${lat})) * 
            sin(radians(cast(${providerProfiles.latitude} as numeric)))
          )
        ))
      `;

      conditions.push(sql`${providerProfiles.latitude} IS NOT NULL`);
      conditions.push(sql`${distanceSql} <= ${rad}`);
    }

    const selectionTemplate = {
      id: providerProfiles.id,
      userId: providerProfiles.userId,
      city: providerProfiles.city,
      area: providerProfiles.area,
      latitude: providerProfiles.latitude,
      longitude: providerProfiles.longitude,
      distance: distanceSql.mapWith(Number),
      bio: providerProfiles.bio,
      hourlyRate: providerProfiles.hourlyRate,
      availabilityStatus: providerProfiles.availabilityStatus,
      coverPhotoUrl: providerProfiles.coverPhotoUrl,
      avgRating: providerProfiles.avgRating,
      totalReviews: providerProfiles.totalReviews,
      name: user.name,
      image: user.image,
    };

    let query = db
      .select(selectionTemplate)
      .from(providerProfiles)
      .innerJoin(user, eq(providerProfiles.userId, user.id));

    if (categoryId) {
      query = query
        .innerJoin(
          providerServices,
          eq(providerServices.providerId, providerProfiles.id)
        )
        .where(and(...conditions, eq(providerServices.categoryId, categoryId)));
    } else {
      query = query.where(and(...conditions));
    }

    if (latitude && longitude) {
      query = query.orderBy(sql`${distanceSql} asc`);
    }

    const data = await query.limit(parseInt(limit)).offset(offset);

    let countQuery = db
      .select({ count: sql`count(*)`.mapWith(Number) })
      .from(providerProfiles)
      .where(and(...conditions));

    if (categoryId) {
      countQuery = db
        .select({ count: sql`count(*)`.mapWith(Number) })
        .from(providerProfiles)
        .innerJoin(
          providerServices,
          eq(providerServices.providerId, providerProfiles.id)
        )
        .where(and(...conditions, eq(providerServices.categoryId, categoryId)));
    }

    const [{ count }] = await countQuery;

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
        latitude: providerProfiles.latitude,
        longitude: providerProfiles.longitude,
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
