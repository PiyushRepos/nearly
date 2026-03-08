import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types";

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    // Blank screen while session resolves — layouts handle skeleton states
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    // Redirect to the user's own dashboard instead of a generic 403
    const dashboardMap: Record<UserRole, string> = {
      customer: "/customer/dashboard",
      provider: "/provider/dashboard",
      admin: "/admin",
    };
    return <Navigate to={dashboardMap[role]} replace />;
  }

  return <Outlet />;
}
