/**
 * Comprehensive seed script — populates the DB with realistic mock data.
 *
 * Order of operations (mimics real-life usage):
 *   1. Ensure service categories exist (re-uses seed-categories logic)
 *   2. Create users via Better Auth API (customers, providers, 1 admin)
 *   3. Create provider profiles + link services
 *   4. Admin approves providers
 *   5. Customers create bookings
 *   6. Providers accept → start → complete bookings
 *   7. Mark some bookings as paid
 *   8. Customers leave reviews
 *   9. Create notifications for various events
 *
 * Usage:  node --env-file=.env src/scripts/seed-mock-data.js
 */
import "dotenv/config";
import { db } from "../config/db.js";
import { auth } from "../config/auth.js";
import {
    user,
    account,
    serviceCategories,
    providerProfiles,
    providerServices,
    bookings,
    bookingUpdates,
    reviews,
    notifications,
} from "../db/schema.js";
import { eq, sql } from "drizzle-orm";

const uuid = () => crypto.randomUUID();
const now = () => new Date();

// Helper — random item from array
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
};

// Random date within last N days
const daysAgo = (n) => {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
};
const randomDateBetween = (from, to) => {
    const f = from.getTime();
    const t = to.getTime();
    return new Date(f + Math.random() * (t - f));
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const CATEGORIES = [
    { name: "Plumbing", slug: "plumbing", icon: "🔧", description: "Pipe repairs, leaks, fixture installations", basePrice: "300" },
    { name: "Electrician", slug: "electrician", icon: "⚡", description: "Wiring, fuse repairs, appliance fitting", basePrice: "350" },
    { name: "Home Cleaning", slug: "home-cleaning", icon: "🧹", description: "Deep cleaning, regular housekeeping", basePrice: "500" },
    { name: "Carpentry", slug: "carpentry", icon: "🪵", description: "Furniture assembly, repairs, woodwork", basePrice: "400" },
    { name: "Painting", slug: "painting", icon: "🎨", description: "Interior & exterior wall painting", basePrice: "800" },
    { name: "AC Repair", slug: "ac-repair", icon: "❄️", description: "AC servicing, gas refill, installation", basePrice: "600" },
    { name: "Pest Control", slug: "pest-control", icon: "🐜", description: "Cockroach, rodent, termite treatments", basePrice: "700" },
    { name: "Appliance Repair", slug: "appliance-repair", icon: "🔌", description: "Washing machine, fridge, microwave repairs", basePrice: "400" },
    { name: "Gardening", slug: "gardening", icon: "🌿", description: "Lawn care, plant maintenance, landscaping", basePrice: "250" },
    { name: "Security Systems", slug: "security-systems", icon: "🔒", description: "CCTV, door locks, alarm installation", basePrice: "1000" },
];

const CUSTOMERS = [
    { name: "Aarav Mehta", email: "aarav@demo.nearly.in", phone: "9876543210", image: "https://i.pravatar.cc/300?img=11" },
    { name: "Diya Sharma", email: "diya@demo.nearly.in", phone: "9876543211", image: "https://i.pravatar.cc/300?img=47" },
    { name: "Rohan Gupta", email: "rohan@demo.nearly.in", phone: "9876543212", image: "https://i.pravatar.cc/300?img=67" },
    { name: "Ananya Singh", email: "ananya@demo.nearly.in", phone: "9876543213", image: "https://i.pravatar.cc/300?img=44" },
    { name: "Vivaan Reddy", email: "vivaan@demo.nearly.in", phone: "9876543214", image: "https://i.pravatar.cc/300?img=15" },
    { name: "Meera Patel", email: "meera@demo.nearly.in", phone: "9876543215", image: "https://i.pravatar.cc/300?img=49" },
    { name: "Ishaan Nair", email: "ishaan@demo.nearly.in", phone: "9876543216", image: "https://i.pravatar.cc/300?img=33" },
    { name: "Priya Desai", email: "priya@demo.nearly.in", phone: "9876543217", image: "https://i.pravatar.cc/300?img=56" },
];

const PROVIDERS = [
    {
        name: "Rajesh Kumar",
        email: "rajesh@demo.nearly.in",
        phone: "9898001001",
        image: "https://i.pravatar.cc/300?img=70",
        bio: "15 years of plumbing experience. Certified master plumber with expertise in all residential and commercial plumbing solutions.",
        city: "Mumbai",
        area: "Andheri West",
        hourlyRate: "450",
        categorySlugs: ["plumbing", "ac-repair"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    },
    {
        name: "Suresh Electricals",
        email: "suresh@demo.nearly.in",
        phone: "9898001002",
        image: "https://i.pravatar.cc/300?img=12",
        bio: "Licensed electrician serving Mumbai for 10+ years. Specialise in smart home wiring, panel upgrades, and appliance installations.",
        city: "Mumbai",
        area: "Bandra East",
        hourlyRate: "500",
        categorySlugs: ["electrician", "security-systems"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800&q=80",
    },
    {
        name: "CleanSpace Pro",
        email: "cleanspace@demo.nearly.in",
        phone: "9898001003",
        image: "https://i.pravatar.cc/300?img=48",
        bio: "Professional deep-cleaning service with eco-friendly products. We handle homes, offices, and post-renovation cleanups.",
        city: "Delhi",
        area: "Lajpat Nagar",
        hourlyRate: "600",
        categorySlugs: ["home-cleaning", "pest-control"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&q=80",
    },
    {
        name: "Vikram Carpenter",
        email: "vikram@demo.nearly.in",
        phone: "9898001004",
        image: "https://i.pravatar.cc/300?img=59",
        bio: "Custom furniture maker & repair specialist. From modular kitchens to antique restoration — quality woodwork guaranteed.",
        city: "Bangalore",
        area: "Koramangala",
        hourlyRate: "550",
        categorySlugs: ["carpentry", "painting"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800&q=80",
    },
    {
        name: "CoolAir Services",
        email: "coolair@demo.nearly.in",
        phone: "9898001005",
        image: "https://i.pravatar.cc/300?img=61",
        bio: "Expert AC technicians for all brands — installation, servicing, gas refill & repair. Same-day service available.",
        city: "Pune",
        area: "Kothrud",
        hourlyRate: "500",
        categorySlugs: ["ac-repair", "appliance-repair"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1527689368864-3a821dbccc34?w=800&q=80",
    },
    {
        name: "GreenThumb Gardens",
        email: "greenthumb@demo.nearly.in",
        phone: "9898001006",
        image: "https://i.pravatar.cc/300?img=45",
        bio: "Transform your outdoor spaces! We offer landscaping, lawn maintenance, terrace gardening & plant care services.",
        city: "Mumbai",
        area: "Powai",
        hourlyRate: "350",
        categorySlugs: ["gardening"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
    },
    {
        name: "SafeGuard Systems",
        email: "safeguard@demo.nearly.in",
        phone: "9898001007",
        image: "https://i.pravatar.cc/300?img=52",
        bio: "Complete home security solutions — CCTV, smart locks, alarm systems, video doorbells. Installation & maintenance.",
        city: "Delhi",
        area: "Saket",
        hourlyRate: "800",
        categorySlugs: ["security-systems", "electrician"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1558002038-1055907df827?w=800&q=80",
    },
    {
        name: "PaintPerfect Studio",
        email: "paintperfect@demo.nearly.in",
        phone: "9898001008",
        image: "https://i.pravatar.cc/300?img=32",
        bio: "Premium wall painting & texture work. Asian Paints certified. Free color consultation included with every project.",
        city: "Bangalore",
        area: "Indiranagar",
        hourlyRate: "700",
        categorySlugs: ["painting"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&q=80",
    },
    {
        name: "QuickFix Appliances",
        email: "quickfix@demo.nearly.in",
        phone: "9898001009",
        image: "https://i.pravatar.cc/300?img=57",
        bio: "Multi-brand appliance repair — washing machines, refrigerators, microwaves, dishwashers. 90-day service warranty.",
        city: "Hyderabad",
        area: "Madhapur",
        hourlyRate: "400",
        categorySlugs: ["appliance-repair", "electrician"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800&q=80",
    },
    {
        name: "PestFree Solutions",
        email: "pestfree@demo.nearly.in",
        phone: "9898001010",
        image: "https://i.pravatar.cc/300?img=68",
        bio: "Government licensed pest control. Termite, cockroach, rodent treatments. Annual maintenance contracts available.",
        city: "Chennai",
        area: "T. Nagar",
        hourlyRate: "650",
        categorySlugs: ["pest-control", "home-cleaning"],
        coverPhotoUrl: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800&q=80",
    },
];

const ADMIN = {
    name: "Piyush Admin",
    email: "admin@demo.nearly.in",
    phone: "9000000001",
    image: "https://i.pravatar.cc/300?img=18",
};

const CITIES = ["Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"];
const AREAS = {
    Mumbai: ["Andheri West", "Bandra East", "Powai", "Juhu", "Dadar", "Worli"],
    Delhi: ["Lajpat Nagar", "Saket", "Dwarka", "Rohini", "Vasant Kunj", "Hauz Khas"],
    Bangalore: ["Koramangala", "Indiranagar", "Whitefield", "HSR Layout", "JP Nagar"],
    Pune: ["Kothrud", "Baner", "Hinjewadi", "Viman Nagar", "Aundh"],
    Hyderabad: ["Madhapur", "HITEC City", "Gachibowli", "Banjara Hills", "Jubilee Hills"],
    Chennai: ["T. Nagar", "Anna Nagar", "Adyar", "Velachery", "Mylapore"],
};

const ADDRESSES = [
    "Flat 301, Sea Breeze Apartments, Near City Mall",
    "12/B, Green Park Society, Main Road",
    "House No. 42, Sector 5, Behind Metro Station",
    "203, Sunrise Tower, Ring Road",
    "15, Lakshmi Nagar, 3rd Cross Street",
    "Bungalow 8, Palm Grove Layout",
    "Flat 602, Crystal Heights, IT Park Road",
    "21/A, Shanti Nagar, Near Hospital",
    "Plot 35, Orchid Enclave, Highway Junction",
    "1st Floor, MG Complex, Station Road",
];

const REVIEW_COMMENTS = [
    "Excellent work! Very professional and punctual. Would definitely hire again.",
    "Good service but arrived a bit late. The actual work was top-notch though.",
    "Amazing attention to detail. Left the place spotless. Highly recommend!",
    "Fair pricing and honest assessment. Didn't try to upsell unnecessary services.",
    "Very skilled professional. Fixed the issue in half the estimated time.",
    "Great communication throughout the job. Kept me updated at every step.",
    "Could improve on time management, but the quality of work was excellent.",
    "Professional, courteous, and efficient. Five stars well deserved!",
    "Did an outstanding job. The results exceeded my expectations completely.",
    "Reliable and trustworthy. This is my go-to service provider now.",
    "Neat and tidy work. Cleaned up everything after finishing. Impressed!",
    "Very knowledgeable and answered all my questions patiently. Great experience.",
    "Prompt response and quick resolution. Saved me a lot of hassle.",
    "The work quality is unmatched. Will recommend to friends and family.",
    "Showed up on time, completed the work as promised. No complaints at all.",
];

const PASSWORD = "Demo@1234"; // All seed users share this password

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function createUser({ name, email, phone, role, image }) {
    // Check if user already exists
    const [existing] = await db
        .select({ id: user.id })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);

    if (existing) {
        console.log(`  ↩ ${email} already exists, skipping`);
        return existing.id;
    }

    // Use Better Auth API to create the user with properly hashed password
    const result = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password: PASSWORD,
            role: role || "customer",
            ...(phone && { phone }),
        },
    });

    if (!result?.user?.id) {
        throw new Error(`Failed to create user ${email}: ${JSON.stringify(result)}`);
    }

    // Patch the image — Better Auth signUpEmail doesn't accept image field
    if (image) {
        await db.update(user).set({ image }).where(eq(user.id, result.user.id));
    }

    console.log(`  ✓ Created ${role}: ${name} (${email})`);
    return result.user.id;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
    console.log("\n🌱 Starting comprehensive seed…\n");

    // ── 1. Seed categories ─────────────────────────────────────────────────────
    console.log("1️⃣  Seeding service categories…");
    for (const cat of CATEGORIES) {
        await db
            .insert(serviceCategories)
            .values({ id: uuid(), ...cat, isActive: true })
            .onConflictDoNothing({ target: serviceCategories.slug });
    }
    const allCategories = await db.select().from(serviceCategories);
    const catBySlug = Object.fromEntries(allCategories.map((c) => [c.slug, c]));
    console.log(`  ✓ ${allCategories.length} categories ready\n`);

    // ── 2. Create users ────────────────────────────────────────────────────────
    console.log("2️⃣  Creating customer accounts…");
    const customerIds = [];
    for (const c of CUSTOMERS) {
        const id = await createUser({ ...c, role: "customer", image: c.image });
        customerIds.push(id);
    }

    console.log("\n3️⃣  Creating provider accounts…");
    const providerUserIds = [];
    for (const p of PROVIDERS) {
        const id = await createUser({ name: p.name, email: p.email, phone: p.phone, role: "provider", image: p.image });
        providerUserIds.push(id);
    }

    console.log("\n4️⃣  Creating admin account…");
    const adminId = await createUser({ ...ADMIN, role: "admin", image: ADMIN.image });
    // Promote to admin role
    await db.update(user).set({ role: "admin" }).where(eq(user.id, adminId));
    console.log(`  ✓ Admin promoted\n`);

    // ── 3. Create provider profiles ────────────────────────────────────────────
    console.log("5️⃣  Setting up provider profiles…");
    const profileIds = [];

    for (let i = 0; i < PROVIDERS.length; i++) {
        const p = PROVIDERS[i];
        const userId = providerUserIds[i];

        // Check if profile already exists
        const [existing] = await db
            .select({ id: providerProfiles.id })
            .from(providerProfiles)
            .where(eq(providerProfiles.userId, userId))
            .limit(1);

        if (existing) {
            console.log(`  ↩ Profile for ${p.name} already exists`);
            profileIds.push(existing.id);
            continue;
        }

        const profileId = uuid();
        await db.insert(providerProfiles).values({
            id: profileId,
            userId,
            bio: p.bio,
            city: p.city,
            area: p.area,
            hourlyRate: p.hourlyRate,
            availabilityStatus: pick(["available", "available", "available", "busy"]), // mostly available
            isApproved: true, // Pre-approve for demo
            coverPhotoUrl: p.coverPhotoUrl ?? null,
            avgRating: "0.00",
            totalReviews: 0,
            totalBookings: 0,
            createdAt: daysAgo(Math.floor(Math.random() * 60) + 30), // created 30-90 days ago
            updatedAt: now(),
        });

        // Link services
        const catIds = p.categorySlugs.map((slug) => catBySlug[slug]?.id).filter(Boolean);
        if (catIds.length > 0) {
            await db.insert(providerServices).values(
                catIds.map((categoryId) => ({ providerId: profileId, categoryId }))
            );
        }

        console.log(`  ✓ ${p.name} — ${p.city}, ${p.area} (${p.categorySlugs.join(", ")})`);
        profileIds.push(profileId);
    }
    console.log();

    // ── 4. Create bookings ─────────────────────────────────────────────────────
    console.log("6️⃣  Creating bookings across all statuses…");

    const bookingStatuses = ["completed", "completed", "completed", "completed",
        "in_progress", "in_progress",
        "confirmed", "confirmed",
        "requested", "requested",
        "cancelled"];

    const allBookingIds = [];
    let bookingCount = 0;

    for (const customerId of customerIds) {
        // Each customer gets 3-5 bookings with different providers
        const numBookings = 3 + Math.floor(Math.random() * 3);

        for (let b = 0; b < numBookings; b++) {
            const providerIdx = (customerIds.indexOf(customerId) + b) % profileIds.length;
            const profileId = profileIds[providerIdx];
            const providerData = PROVIDERS[providerIdx];

            // Pick a service the provider offers
            const categorySlug = pick(providerData.categorySlugs);
            const category = catBySlug[categorySlug];
            if (!category) continue;

            const status = pick(bookingStatuses);
            const createdDate = randomDateBetween(daysAgo(60), daysAgo(2));
            const scheduledDate = new Date(createdDate.getTime() + (1 + Math.random() * 5) * 24 * 60 * 60 * 1000);

            const city = providerData.city;
            const area = pick(AREAS[city] || [providerData.area]);
            const quotedPrice = String(parseFloat(providerData.hourlyRate) + Math.floor(Math.random() * 300));

            const isCompleted = status === "completed";
            const isPaid = isCompleted && Math.random() > 0.2; // 80% of completed are paid

            const bookingId = uuid();
            await db.insert(bookings).values({
                id: bookingId,
                customerId,
                providerId: profileId,
                categoryId: category.id,
                address: pick(ADDRESSES),
                city,
                area,
                scheduledAt: scheduledDate,
                notes: Math.random() > 0.5 ? "Please come with all required tools and materials." : null,
                attachmentUrl: null,
                status,
                quotedPrice,
                finalPrice: isCompleted ? quotedPrice : null,
                paymentStatus: isPaid ? "paid" : "unpaid",
                razorpayOrderId: isPaid ? `order_seed_${bookingId.slice(0, 8)}` : null,
                razorpayPaymentId: isPaid ? `pay_seed_${bookingId.slice(0, 8)}` : null,
                createdAt: createdDate,
                updatedAt: isCompleted ? new Date(scheduledDate.getTime() + 3 * 60 * 60 * 1000) : scheduledDate,
            });

            // Create booking updates (timeline)
            const updates = [
                { status: "requested", message: "Booking request submitted.", date: createdDate },
            ];

            if (["confirmed", "in_progress", "completed"].includes(status)) {
                updates.push({
                    status: "confirmed",
                    message: "Your booking has been accepted by the professional.",
                    date: new Date(createdDate.getTime() + 2 * 60 * 60 * 1000),
                });
            }
            if (["in_progress", "completed"].includes(status)) {
                updates.push({
                    status: "in_progress",
                    message: "Work has started on your booking.",
                    date: scheduledDate,
                });
            }
            if (status === "completed") {
                updates.push({
                    status: "completed",
                    message: "Work is complete! Please pay to close the booking.",
                    date: new Date(scheduledDate.getTime() + 3 * 60 * 60 * 1000),
                });
            }
            if (status === "cancelled") {
                updates.push({
                    status: "cancelled",
                    message: "Booking cancelled.",
                    date: new Date(createdDate.getTime() + 1 * 60 * 60 * 1000),
                });
            }

            for (const u of updates) {
                await db.insert(bookingUpdates).values({
                    id: uuid(),
                    bookingId,
                    status: u.status,
                    message: u.message,
                    images: [],
                    createdById: customerId,
                    createdAt: u.date,
                });
            }

            allBookingIds.push({ id: bookingId, customerId, profileId, status, isPaid, category });
            bookingCount++;
        }
    }

    console.log(`  ✓ ${bookingCount} bookings created\n`);

    // ── 5. Update provider totalBookings counters ──────────────────────────────
    console.log("7️⃣  Updating provider booking counters…");
    for (const profileId of profileIds) {
        const completedBookings = allBookingIds.filter(
            (b) => b.profileId === profileId && b.status === "completed"
        );
        if (completedBookings.length > 0) {
            await db
                .update(providerProfiles)
                .set({ totalBookings: completedBookings.length, updatedAt: now() })
                .where(eq(providerProfiles.id, profileId));
        }
    }
    console.log(`  ✓ Done\n`);

    // ── 6. Create reviews for completed + paid bookings ────────────────────────
    console.log("8️⃣  Submitting reviews…");
    let reviewCount = 0;

    const completedPaid = allBookingIds.filter((b) => b.status === "completed" && b.isPaid);

    for (const b of completedPaid) {
        // ~85% leave a review
        if (Math.random() > 0.85) continue;

        const rating = pick([4, 4, 4, 5, 5, 5, 5, 3, 5, 4]); // weighted towards 4-5
        const comment = pick(REVIEW_COMMENTS);

        await db.insert(reviews).values({
            id: uuid(),
            bookingId: b.id,
            customerId: b.customerId,
            providerId: b.profileId,
            rating,
            comment,
            isApproved: true,
            isFlagged: false,
            createdAt: randomDateBetween(daysAgo(30), daysAgo(1)),
        });
        reviewCount++;
    }

    console.log(`  ✓ ${reviewCount} reviews created\n`);

    // ── 7. Recalculate avgRating & totalReviews ────────────────────────────────
    console.log("9️⃣  Recalculating provider ratings…");
    for (const profileId of profileIds) {
        const [stats] = await db
            .select({
                avg: sql`COALESCE(avg(rating), 0)`.mapWith(Number),
                count: sql`count(*)`.mapWith(Number),
            })
            .from(reviews)
            .where(eq(reviews.providerId, profileId));

        await db
            .update(providerProfiles)
            .set({
                avgRating: stats.avg > 0 ? stats.avg.toFixed(2) : "0.00",
                totalReviews: stats.count,
                updatedAt: now(),
            })
            .where(eq(providerProfiles.id, profileId));
    }
    console.log(`  ✓ Ratings updated\n`);

    // ── 8. Create notifications ────────────────────────────────────────────────
    console.log("🔟  Creating notifications…");
    let notifCount = 0;

    // Notifications for customers
    for (const b of allBookingIds.slice(0, 20)) {
        const messages = {
            requested: { title: "Booking submitted", body: "Your booking request has been sent to the provider." },
            confirmed: { title: "Booking confirmed! 🎉", body: "Your service professional has accepted your booking." },
            in_progress: { title: "Work has started", body: "Your professional has begun working on your booking." },
            completed: { title: "Job complete — pay now", body: "Work is complete! Please pay to close the booking." },
            cancelled: { title: "Booking cancelled", body: "Your booking has been cancelled." },
        };

        const msg = messages[b.status];
        if (msg) {
            await db.insert(notifications).values({
                id: uuid(),
                userId: b.customerId,
                title: msg.title,
                body: msg.body,
                link: `/customer/bookings/${b.id}`,
                isRead: Math.random() > 0.4,
                createdAt: randomDateBetween(daysAgo(14), daysAgo(0)),
            });
            notifCount++;
        }
    }

    // Notifications for providers (new bookings, payments)
    for (let i = 0; i < Math.min(15, allBookingIds.length); i++) {
        const b = allBookingIds[i];
        const providerIdx = profileIds.indexOf(b.profileId);
        if (providerIdx === -1) continue;
        const providerUserId = providerUserIds[providerIdx];

        await db.insert(notifications).values({
            id: uuid(),
            userId: providerUserId,
            title: "New booking request",
            body: `You have a new booking request from a customer.`,
            link: `/provider/bookings/${b.id}`,
            isRead: Math.random() > 0.3,
            createdAt: randomDateBetween(daysAgo(14), daysAgo(0)),
        });
        notifCount++;

        if (b.isPaid) {
            await db.insert(notifications).values({
                id: uuid(),
                userId: providerUserId,
                title: "Payment received 💸",
                body: "The customer has paid for the completed booking.",
                link: `/provider/bookings/${b.id}`,
                isRead: Math.random() > 0.5,
                createdAt: randomDateBetween(daysAgo(7), daysAgo(0)),
            });
            notifCount++;
        }
    }

    // Admin notifications
    await db.insert(notifications).values({
        id: uuid(),
        userId: adminId,
        title: "Welcome to Nearly Admin",
        body: "Your admin dashboard is ready. Review pending providers and manage the platform.",
        link: "/admin",
        isRead: false,
        createdAt: now(),
    });
    notifCount++;

    console.log(`  ✓ ${notifCount} notifications created\n`);

    // ── Summary ─────────────────────────────────────────────────────────────────
    console.log("═══════════════════════════════════════════");
    console.log("  🎉 Seed complete!  Summary:");
    console.log("═══════════════════════════════════════════");
    console.log(`  👤 Customers:     ${CUSTOMERS.length}`);
    console.log(`  🔨 Providers:     ${PROVIDERS.length}`);
    console.log(`  👑 Admin:         1`);
    console.log(`  📦 Bookings:      ${bookingCount}`);
    console.log(`  ⭐ Reviews:       ${reviewCount}`);
    console.log(`  🔔 Notifications: ${notifCount}`);
    console.log(`  📂 Categories:    ${allCategories.length}`);
    console.log("───────────────────────────────────────────");
    console.log(`  🔑 All users share password: ${PASSWORD}`);
    console.log(`  🛡️  Admin login: ${ADMIN.email}`);
    console.log("═══════════════════════════════════════════\n");

    process.exit(0);
}

seed().catch((err) => {
    console.error("\n❌ Seed failed:", err);
    process.exit(1);
});
