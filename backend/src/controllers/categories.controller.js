import { db } from "../config/db.js";
import { serviceCategories } from "../db/schema.js";
import { eq } from "drizzle-orm";

export async function getCategories(_req, res, next) {
  try {
    const categories = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.isActive, true))
      .orderBy(serviceCategories.name);

    res.json({ data: categories });
  } catch (err) {
    next(err);
  }
}

export async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const [category] = await db
      .select()
      .from(serviceCategories)
      .where(eq(serviceCategories.slug, slug))
      .limit(1);

    if (!category) return res.status(404).json({ error: "Category not found" });
    res.json({ data: category });
  } catch (err) {
    next(err);
  }
}
