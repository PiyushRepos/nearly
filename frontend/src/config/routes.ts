// All route path constants in one place — use these everywhere instead of raw strings.
export const ROUTES = {
  HOME: "/",

  // Auth
  LOGIN: "/auth/login",
  SIGNUP: "/auth/signup",

  // Browse (public)
  BROWSE: "/browse",
  PROVIDER_PROFILE: "/providers/:id",

  // Customer (protected)
  CUSTOMER_DASHBOARD: "/customer/dashboard",
  CUSTOMER_BOOKINGS: "/customer/bookings",
  CUSTOMER_BOOKING_DETAIL: "/customer/bookings/:id",
  CUSTOMER_BOOK_SERVICE: "/book/:providerId",
  CUSTOMER_REVIEW: "/customer/bookings/:id/review",
  CUSTOMER_PAY: "/customer/bookings/:id/pay",

  // Provider (protected)
  PROVIDER_DASHBOARD: "/provider/dashboard",
  PROVIDER_BOOKINGS: "/provider/bookings",
  PROVIDER_BOOKING_DETAIL: "/provider/bookings/:id",
  PROVIDER_PROFILE_SETUP: "/provider/profile",

  // Admin (protected)
  ADMIN_DASHBOARD: "/admin",
  ADMIN_PROVIDERS: "/admin/providers",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_REVIEWS: "/admin/reviews",

  // Shared (all authenticated roles)
  NOTIFICATIONS: "/notifications",
} as const;

/** Build a route path with a concrete param — e.g. r(ROUTES.PROVIDER_PROFILE, { id: "abc" }) */
export function r(path: string, params: Record<string, string> = {}): string {
  return Object.entries(params).reduce(
    (acc, [key, value]) => acc.replace(`:${key}`, value),
    path,
  );
}
