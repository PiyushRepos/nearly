import { createBrowserRouter, RouterProvider } from "react-router";
import { lazy, Suspense } from "react";

// Layouts
import PublicLayout from "@/components/layouts/PublicLayout";
import AuthLayout from "@/components/layouts/AuthLayout";
import AppLayout from "@/components/layouts/AppLayout";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

// Eagerly loaded (above fold)
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";

// Lazily loaded pages — split by role to keep initial bundle lean
const BrowsePage = lazy(() => import("@/pages/BrowsePage"));
const ProviderPublicProfilePage = lazy(
  () => import("@/pages/ProviderPublicProfilePage"),
);
const BookServicePage = lazy(() => import("@/pages/customer/BookServicePage"));
const CustomerDashboardPage = lazy(
  () => import("@/pages/customer/DashboardPage"),
);
const CustomerBookingsPage = lazy(
  () => import("@/pages/customer/BookingsPage"),
);
const CustomerBookingDetailPage = lazy(
  () => import("@/pages/customer/BookingDetailPage"),
);
const CustomerReviewPage = lazy(() => import("@/pages/customer/ReviewPage"));
const CustomerPayPage = lazy(() => import("@/pages/customer/PayPage"));
const CustomerMyReviewsPage = lazy(
  () => import("@/pages/customer/MyReviewsPage"),
);
const CustomerPaymentHistoryPage = lazy(
  () => import("@/pages/customer/PaymentHistoryPage"),
);
const ProviderSetupPage = lazy(
  () => import("@/pages/provider/ProfileSetupPage"),
);
const ProviderDashboardPage = lazy(
  () => import("@/pages/provider/DashboardPage"),
);
const ProviderBookingsPage = lazy(
  () => import("@/pages/provider/BookingsPage"),
);
const ProviderBookingDetailPage = lazy(
  () => import("@/pages/provider/BookingDetailPage"),
);
const ProviderReceivedReviewsPage = lazy(
  () => import("@/pages/provider/ReceivedReviewsPage"),
);
const ProviderEarningsPage = lazy(
  () => import("@/pages/provider/EarningsPage"),
);
const AdminDashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const AdminProvidersPage = lazy(() => import("@/pages/admin/ProvidersPage"));
const AdminCategoriesPage = lazy(() => import("@/pages/admin/CategoriesPage"));
const AdminReviewsPage = lazy(() => import("@/pages/admin/ReviewsPage"));
const AdminUsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const NotificationsPage = lazy(() => import("@/pages/NotificationsPage"));

// Full-page fallback for lazy boundaries
function PageLoader() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-background">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );
}

const router = createBrowserRouter([
  // ─── Public (Landing + Browse) ───────────────────────────────────────────
  {
    element: <PublicLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      {
        path: "browse",
        element: (
          <Suspense fallback={<PageLoader />}>
            <BrowsePage />
          </Suspense>
        ),
      },
      {
        path: "providers/:id",
        element: (
          <Suspense fallback={<PageLoader />}>
            <ProviderPublicProfilePage />
          </Suspense>
        ),
      },
    ],
  },

  // ─── Auth ────────────────────────────────────────────────────────────────
  {
    element: <AuthLayout />,
    children: [
      { path: "auth/login", element: <LoginPage /> },
      { path: "auth/signup", element: <SignupPage /> },
    ],
  },

  // ─── Customer (protected) ───────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["customer"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "customer/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "customer/bookings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerBookingsPage />
              </Suspense>
            ),
          },
          {
            path: "customer/bookings/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerBookingDetailPage />
              </Suspense>
            ),
          },
          {
            path: "customer/bookings/:id/review",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerReviewPage />
              </Suspense>
            ),
          },
          {
            path: "customer/bookings/:id/pay",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerPayPage />
              </Suspense>
            ),
          },
          {
            path: "customer/reviews",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerMyReviewsPage />
              </Suspense>
            ),
          },
          {
            path: "customer/payments",
            element: (
              <Suspense fallback={<PageLoader />}>
                <CustomerPaymentHistoryPage />
              </Suspense>
            ),
          },
          {
            path: "book/:providerId",
            element: (
              <Suspense fallback={<PageLoader />}>
                <BookServicePage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // ─── Provider (protected) ───────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["provider"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "provider/profile",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProviderSetupPage />
              </Suspense>
            ),
          },
          {
            path: "provider/dashboard",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProviderDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "provider/bookings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProviderBookingsPage />
              </Suspense>
            ),
          },
          {
            path: "provider/bookings/:id",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProviderBookingDetailPage />
              </Suspense>
            ),
          },
          {
            path: "provider/reviews",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProviderReceivedReviewsPage />
              </Suspense>
            ),
          },
          {
            path: "provider/earnings",
            element: (
              <Suspense fallback={<PageLoader />}>
                <ProviderEarningsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // ─── Admin (protected) ──────────────────────────────────────────────────
  {
    element: <ProtectedRoute allowedRoles={["admin"]} />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "admin",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminDashboardPage />
              </Suspense>
            ),
          },
          {
            path: "admin/providers",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminProvidersPage />
              </Suspense>
            ),
          },
          {
            path: "admin/categories",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminCategoriesPage />
              </Suspense>
            ),
          },
          {
            path: "admin/reviews",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminReviewsPage />
              </Suspense>
            ),
          },
          {
            path: "admin/users",
            element: (
              <Suspense fallback={<PageLoader />}>
                <AdminUsersPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },

  // ─── Shared authenticated (all roles) ──────────────────────────────────
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            path: "notifications",
            element: (
              <Suspense fallback={<PageLoader />}>
                <NotificationsPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
