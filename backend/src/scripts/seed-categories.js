/**
 * Seed script — run once to populate service categories.
 * Usage: node --env-file=.env src/scripts/seed-categories.js
 */
import { db } from "../config/db.js";
import { serviceCategories } from "../db/schema.js";
import { sql } from "drizzle-orm";

const CATEGORIES = [
  { name: "Plumbing",          slug: "plumbing",          icon: "🔧", description: "Pipe repairs, leaks, fixture installations",     basePrice: "300" },
  { name: "Electrician",       slug: "electrician",       icon: "⚡", description: "Wiring, fuse repairs, appliance fitting",         basePrice: "350" },
  { name: "Home Cleaning",     slug: "home-cleaning",     icon: "🧹", description: "Deep cleaning, regular housekeeping",             basePrice: "500" },
  { name: "Carpentry",         slug: "carpentry",         icon: "🪵", description: "Furniture assembly, repairs, woodwork",           basePrice: "400" },
  { name: "Painting",          slug: "painting",          icon: "🎨", description: "Interior & exterior wall painting",               basePrice: "800" },
  { name: "AC Repair",         slug: "ac-repair",         icon: "❄️", description: "AC servicing, gas refill, installation",         basePrice: "600" },
  { name: "Pest Control",      slug: "pest-control",      icon: "🐜", description: "Cockroach, rodent, termite treatments",           basePrice: "700" },
  { name: "Appliance Repair",  slug: "appliance-repair",  icon: "🔌", description: "Washing machine, fridge, microwave repairs",     basePrice: "400" },
  { name: "Gardening",         slug: "gardening",         icon: "🌿", description: "Lawn care, plant maintenance, landscaping",      basePrice: "250" },
  { name: "Security Systems",  slug: "security-systems",  icon: "🔒", description: "CCTV, door locks, alarm installation",           basePrice: "1000" },
];

const id = () => crypto.randomUUID();

async function seed() {
  console.log("Seeding service categories…");

  for (const cat of CATEGORIES) {
    await db
      .insert(serviceCategories)
      .values({ id: id(), ...cat, isActive: true })
      .onConflictDoNothing({ target: serviceCategories.slug });
  }

  const rows = await db.select({ name: serviceCategories.name }).from(serviceCategories);
  console.log(`✓ ${rows.length} categories in DB:`);
  rows.forEach((r) => console.log(`  • ${r.name}`));
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
