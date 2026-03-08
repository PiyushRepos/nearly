import { Navigate, Outlet, Link } from "react-router";
import { useSession } from "@/lib/auth-client";

export default function AuthLayout() {
  const { data: session, isPending } = useSession();

  if (!isPending && session?.user) {
    const role = (session.user as { role?: string }).role;
    const map: Record<string, string> = {
      customer: "/customer/dashboard",
      provider: "/provider/dashboard",
      admin: "/admin",
    };
    return <Navigate to={map[role ?? ""] ?? "/"} replace />;
  }

  return (
    <div className="relative flex min-h-svh flex-col items-center justify-start sm:justify-center bg-background px-4 py-10 sm:py-12 overflow-y-auto">
      {/* Subtle background blobs matching landing page aesthetic */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-secondary/5 blur-3xl" />
      </div>

      {/* Brand wordmark */}
      <Link
        to="/"
        className="relative mb-8 flex items-center gap-1 text-2xl font-bold tracking-tight"
        style={{ fontFamily: "Fraunces, serif" }}
      >
        Nearly
        <span className="text-primary">.</span>
      </Link>

      {/* Card shell — page content renders inside */}
      <div className="relative w-full max-w-sm sm:max-w-md">
        <Outlet />
      </div>

      {/* Footer */}
      <p className="relative mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Nearly. All rights reserved.
      </p>
    </div>
  );
}
