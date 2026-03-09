// ─── Shared API response shapes ────────────────────────────────────────────────

export type UserRole = "customer" | "provider" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  phone: string | null;
  emailVerified: boolean;
  createdAt: string;
}

export interface Session {
  user: User;
  session: {
    id: string;
    expiresAt: string;
    token: string;
    userId: string;
  };
}

// ─── Categories ────────────────────────────────────────────────────────────────

export interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  basePrice: string | null;
  isActive: boolean;
  createdAt: string;
}

// ─── Providers ─────────────────────────────────────────────────────────────────

export type AvailabilityStatus = "available" | "busy" | "unavailable";

export interface ProviderProfile {
  id: string;
  userId: string;
  bio: string | null;
  city: string;
  area: string;
  latitude?: string | null;
  longitude?: string | null;
  hourlyRate: string | null;
  availabilityStatus: AvailabilityStatus;
  isApproved: boolean;
  coverPhotoUrl: string | null;
  avgRating: string;
  totalReviews: number;
  totalBookings: number;
  createdAt: string;
  updatedAt: string;
  // Joined
  name?: string;
  image?: string | null;
  distance?: number | null;
  services?: ServiceCategory[];
}

// ─── Bookings ──────────────────────────────────────────────────────────────────

export type BookingStatus =
  | "requested"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export interface Booking {
  id: string;
  customerId: string;
  providerId: string | null;
  categoryId: string;
  address: string;
  city: string;
  area: string;
  latitude?: string | null;
  longitude?: string | null;
  scheduledAt: string;
  notes: string | null;
  attachmentUrl: string | null;
  status: BookingStatus;
  quotedPrice: string | null;
  finalPrice: string | null;
  paymentStatus: PaymentStatus;
  razorpayOrderId: string | null;
  razorpayPaymentId: string | null;
  createdAt: string;
  updatedAt: string;
  // Joined
  categoryName?: string;
  categoryIcon?: string;
  providerName?: string;
  providerImage?: string | null;
  customerName?: string;
  customerImage?: string | null;
  updates?: BookingUpdate[];
  hasReview?: boolean;
}

export interface BookingUpdate {
  id: string;
  bookingId: string;
  status: BookingStatus | null;
  message: string | null;
  images: string[];
  createdById: string;
  createdAt: string;
}

// ─── Messages ──────────────────────────────────────────────────────────────────

export interface Message {
  id: string;
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

// ─── Reviews ───────────────────────────────────────────────────────────────────

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  isFlagged: boolean;
  createdAt: string;
  customerName?: string;
  customerImage?: string | null;
  // For getMyReviews
  providerName?: string;
  providerImage?: string | null;
  categoryName?: string;
  categoryIcon?: string | null;
}

// ─── Payment Record ────────────────────────────────────────────────────────────

export interface PaymentRecord {
  id: string;
  scheduledAt: string;
  finalPrice: string | null;
  quotedPrice: string | null;
  razorpayPaymentId: string | null;
  paymentStatus: PaymentStatus;
  updatedAt: string;
  categoryName?: string;
  categoryIcon?: string | null;
  providerName?: string;
  providerImage?: string | null;
  customerName?: string;
  customerImage?: string | null;
}

// ─── Notifications ─────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  link: string | null;
  isRead: boolean;
  createdAt: string;
}

// ─── API response wrappers ────────────────────────────────────────────────────

export interface ListResponse<T> {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface SingleResponse<T> {
  data: T;
}

export interface MessageResponse {
  message: string;
}

// ─── Admin Stats ───────────────────────────────────────────────────────────────

export interface AdminStats {
  bookings: {
    total: number;
    requested: number;
    confirmed: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  users: {
    total: number;
    customers: number;
    providers: number;
  };
  pendingProviderApprovals: number;
}
