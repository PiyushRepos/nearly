import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Search,
  Star,
  Users,
  Tag,
  Settings,
  LogOut,
  Bell,
  Briefcase,
  ShieldCheck,
  CreditCard,
  TrendingUp,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "@/lib/auth-client";
import useSWR from "swr";
import { cn } from "@/lib/utils";

// ─── Nav definitions per role ─────────────────────────────────────────────────
const customerNav = [
  { label: "Dashboard", href: "/customer/dashboard", icon: LayoutDashboard },
  { label: "My Bookings", href: "/customer/bookings", icon: CalendarCheck },
  { label: "My Reviews", href: "/customer/reviews", icon: Star },
  { label: "Payments", href: "/customer/payments", icon: CreditCard },
  { label: "Browse", href: "/browse", icon: Search },
];

const providerNav = [
  { label: "Dashboard", href: "/provider/dashboard", icon: LayoutDashboard },
  { label: "Bookings", href: "/provider/bookings", icon: Briefcase },
  { label: "Reviews", href: "/provider/reviews", icon: Star },
  { label: "Earnings", href: "/provider/earnings", icon: TrendingUp },
  { label: "My Profile", href: "/provider/profile", icon: Settings },
];

const adminNav = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { label: "Providers", href: "/admin/providers", icon: ShieldCheck },
  { label: "Categories", href: "/admin/categories", icon: Tag },
  { label: "Reviews", href: "/admin/reviews", icon: Star },
  { label: "Users", href: "/admin/users", icon: Users },
];

const roleLabels = {
  customer: "Customer",
  provider: "Professional",
  admin: "Admin",
};

export default function AppLayout() {
  const { user, role } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems =
    role === "admin"
      ? adminNav
      : role === "provider"
        ? providerNav
        : customerNav;

  // Lightweight polling for unread notifications
  const { data: notifData } = useSWR<{ unreadCount: number }>(
    "/notifications?unread=true",
    { refreshInterval: 8_000 },
  );
  const unreadCount = notifData?.unreadCount ?? 0;

  function initials(name: string) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0])
      .join("")
      .toUpperCase();
  }

  async function handleSignOut() {
    await signOut();
    navigate("/auth/login");
  }

  return (
    <SidebarProvider defaultOpen>
      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <Sidebar collapsible="icon">
        {/* Brand */}
        <SidebarHeader className="px-3 py-2.5">
          <Link
            to="/"
            className="flex items-center gap-1 text-xl font-bold tracking-tight group-data-[collapsible=icon]:justify-center"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            <span className="group-data-[collapsible=icon]:hidden">Nearly</span>
            <span className="text-primary text-2xl leading-none">.</span>
          </Link>
        </SidebarHeader>

        <SidebarSeparator />

        {/* Navigation */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-xs uppercase tracking-widest text-muted-foreground/60">
              {role ? roleLabels[role] : ""}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive =
                    location.pathname === item.href ||
                    (!(item as { exact?: boolean }).exact &&
                      item.href !== "/" &&
                      location.pathname.startsWith(item.href + "/"));
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        size="default"
                        tooltip={item.label}
                      >
                        <Link to={item.href} className="gap-3">
                          <item.icon
                            className={cn(
                              "size-4 shrink-0",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground",
                            )}
                          />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* User footer */}
        <SidebarFooter className="border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left text-sm hover:bg-sidebar-accent transition-colors">
                <Avatar className="size-7 shrink-0">
                  <AvatarImage src={user?.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {user?.name ? initials(user.name) : "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-col group-data-[collapsible=icon]:hidden">
                  <span className="truncate text-sm font-medium leading-tight">
                    {user?.name}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Signed in as {role}
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-destructive gap-2"
              >
                <LogOut className="size-3.5" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <SidebarInset>
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex h-12 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-sm">
          <SidebarTrigger className="text-muted-foreground" />
          <Separator orientation="vertical" className="h-4" />

          {/* Spacer */}
          <div className="flex-1" />

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Bell className="size-4" />
            {unreadCount > 0 && (
              <Badge
                className="absolute -top-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full p-0 text-[10px] leading-none"
                variant="default"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Badge>
            )}
          </Link>
        </header>

        {/* Page content */}
        <div className="flex flex-1 flex-col gap-6 p-6">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
