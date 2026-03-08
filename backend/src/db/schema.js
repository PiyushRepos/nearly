import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  jsonb,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ─── Better Auth Tables ───────────────────────────────────────────────────────
// These must match Better Auth's expected column names exactly.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  // Custom fields added via additionalFields in auth config
  role: text("role").notNull().default("customer"), // "customer" | "provider" | "admin"
  phone: text("phone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// ─── App Tables ───────────────────────────────────────────────────────────────

export const serviceCategories = pgTable("service_categories", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),                                               // emoji or icon name
  basePrice: decimal("base_price", { precision: 10, scale: 2 }),  // ₹ per hour floor
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const providerProfiles = pgTable("provider_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  bio: text("bio"),
  city: text("city").notNull(),
  area: text("area").notNull(),
  hourlyRate: decimal("hourly_rate", { precision: 10, scale: 2 }),
  availabilityStatus: text("availability_status").notNull().default("available"), // available | busy | unavailable
  isApproved: boolean("is_approved").notNull().default(false),
  documentsUrl: jsonb("documents_url").$type(),                 // uploaded verification docs
  coverPhotoUrl: text("cover_photo_url"),
  avgRating: decimal("avg_rating", { precision: 3, scale: 2 }).default("0.00"),
  totalReviews: integer("total_reviews").notNull().default(0),
  totalBookings: integer("total_bookings").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const providerServices = pgTable(
  "provider_services",
  {
    providerId: text("provider_id")
      .notNull()
      .references(() => providerProfiles.id, { onDelete: "cascade" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => serviceCategories.id, { onDelete: "cascade" }),
  },
  (t) => [
    uniqueIndex("provider_services_uniq").on(t.providerId, t.categoryId),
  ]
);

export const bookings = pgTable("bookings", {
  id: text("id").primaryKey(),
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id),
  providerId: text("provider_id").references(() => providerProfiles.id),
  categoryId: text("category_id")
    .notNull()
    .references(() => serviceCategories.id),
  address: text("address").notNull(),
  city: text("city").notNull(),
  area: text("area").notNull(),
  scheduledAt: timestamp("scheduled_at").notNull(),
  notes: text("notes"),
  attachmentUrl: text("attachment_url"),
  // Status machine: requested → confirmed → in_progress → completed | cancelled
  status: text("status").notNull().default("requested"),
  quotedPrice: decimal("quoted_price", { precision: 10, scale: 2 }),
  finalPrice: decimal("final_price", { precision: 10, scale: 2 }),
  paymentStatus: text("payment_status").notNull().default("unpaid"), // unpaid | paid | refunded
  razorpayOrderId: text("razorpay_order_id"),
  razorpayPaymentId: text("razorpay_payment_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const bookingUpdates = pgTable("booking_updates", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .references(() => bookings.id, { onDelete: "cascade" }),
  status: text("status"),     // the status this update reflects
  message: text("message"),   // provider's work note
  images: jsonb("images").$type(), // before/after image URLs
  createdById: text("created_by_id")
    .notNull()
    .references(() => user.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: text("id").primaryKey(),
  bookingId: text("booking_id")
    .notNull()
    .unique()
    .references(() => bookings.id),
  customerId: text("customer_id")
    .notNull()
    .references(() => user.id),
  providerId: text("provider_id")
    .notNull()
    .references(() => providerProfiles.id),
  rating: integer("rating").notNull(),   // 1–5
  comment: text("comment"),
  isApproved: boolean("is_approved").notNull().default(true),
  isFlagged: boolean("is_flagged").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  body: text("body").notNull(),
  link: text("link"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ one, many }) => ({
  providerProfile: one(providerProfiles, {
    fields: [user.id],
    references: [providerProfiles.userId],
  }),
  customerBookings: many(bookings),
  reviews: many(reviews),
  notifications: many(notifications),
}));

export const providerProfilesRelations = relations(
  providerProfiles,
  ({ one, many }) => ({
    user: one(user, {
      fields: [providerProfiles.userId],
      references: [user.id],
    }),
    services: many(providerServices),
    bookings: many(bookings),
    reviews: many(reviews),
  })
);

export const serviceCategoriesRelations = relations(
  serviceCategories,
  ({ many }) => ({
    providerServices: many(providerServices),
    bookings: many(bookings),
  })
);

export const providerServicesRelations = relations(
  providerServices,
  ({ one }) => ({
    provider: one(providerProfiles, {
      fields: [providerServices.providerId],
      references: [providerProfiles.id],
    }),
    category: one(serviceCategories, {
      fields: [providerServices.categoryId],
      references: [serviceCategories.id],
    }),
  })
);

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  customer: one(user, {
    fields: [bookings.customerId],
    references: [user.id],
  }),
  provider: one(providerProfiles, {
    fields: [bookings.providerId],
    references: [providerProfiles.id],
  }),
  category: one(serviceCategories, {
    fields: [bookings.categoryId],
    references: [serviceCategories.id],
  }),
  updates: many(bookingUpdates),
  review: one(reviews, {
    fields: [bookings.id],
    references: [reviews.bookingId],
  }),
}));

export const bookingUpdatesRelations = relations(bookingUpdates, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingUpdates.bookingId],
    references: [bookings.id],
  }),
  createdBy: one(user, {
    fields: [bookingUpdates.createdById],
    references: [user.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  customer: one(user, {
    fields: [reviews.customerId],
    references: [user.id],
  }),
  provider: one(providerProfiles, {
    fields: [reviews.providerId],
    references: [providerProfiles.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(user, {
    fields: [notifications.userId],
    references: [user.id],
  }),
}));
