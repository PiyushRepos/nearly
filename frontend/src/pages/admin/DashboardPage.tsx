import useSWR from "swr";
import type { AdminStats } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, CalendarCheck, ShieldCheck, TrendingUp } from "lucide-react";

export default function AdminDashboardPage() {
  const { data, isLoading } = useSWR<{ data: AdminStats }>("/admin/stats");
  const stats = data?.data;

  const statCards = stats
    ? [
        {
          label: "Total bookings",
          value: stats.bookings.total,
          sub: `${stats.bookings.completed} completed`,
          icon: CalendarCheck,
          color: "text-primary",
        },
        {
          label: "Total users",
          value: stats.users.total,
          sub: `${stats.users.providers} providers · ${stats.users.customers} customers`,
          icon: Users,
          color: "text-secondary",
        },
        {
          label: "Pending approvals",
          value: stats.pendingProviderApprovals,
          sub: "Provider accounts awaiting review",
          icon: ShieldCheck,
          color: "text-amber-600",
        },
        {
          label: "Active bookings",
          value: stats.bookings.confirmed + stats.bookings.in_progress,
          sub: `${stats.bookings.requested} pending provider response`,
          icon: TrendingUp,
          color: "text-emerald-600",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Admin overview
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform-wide metrics and pending tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))
          : statCards.map((stat) => (
              <Card key={stat.label} className="overflow-hidden">
                <CardHeader className="pb-2 flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <stat.icon className={`size-4 ${stat.color}`} />
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-3xl font-bold tracking-tight">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>
    </div>
  );
}
