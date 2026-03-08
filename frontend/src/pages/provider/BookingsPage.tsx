import { useSearchParams, Link } from "react-router";
import useSWR from "swr";
import { CalendarDays, MapPin, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { r, ROUTES } from "@/config/routes";
import type { Booking, BookingStatus, ListResponse } from "@/types";
import { api } from "@/lib/api";
import { getAvatarPlaceholder } from "@/lib/utils";

const STATUS_CONFIG: Record<
  BookingStatus,
  { label: string; className: string }
> = {
  requested: {
    label: "Requested",
    className:
      "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  confirmed: {
    label: "Confirmed",
    className:
      "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  in_progress: {
    label: "In Progress",
    className:
      "bg-violet-500/10 text-violet-700 dark:text-violet-400 border-violet-500/20",
  },
  completed: {
    label: "Completed",
    className:
      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const TABS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Completed" },
] as const;

async function fetchBookings(url: string): Promise<ListResponse<Booking>> {
  const res = await api.get<ListResponse<Booking>>(url);
  return res.data;
}

function buildQuery(tab: string) {
  if (tab === "pending") return "/provider/bookings?status=requested";
  if (tab === "active")
    return "/provider/bookings?status=confirmed,in_progress";
  if (tab === "completed") return "/provider/bookings?status=completed";
  return "/provider/bookings";
}

function BookingCard({ booking }: { booking: Booking }) {
  const status = STATUS_CONFIG[booking.status];
  const initials =
    booking.customerName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <Link
      to={r(ROUTES.PROVIDER_BOOKING_DETAIL, { id: booking.id })}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <Card className="py-0 transition-shadow hover:shadow-md hover:ring-foreground/20">
        <CardContent className="flex items-center gap-3 px-4 py-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-(--brand-orange)/10 text-xl">
            {booking.categoryIcon ?? "🔧"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <p className="text-sm font-semibold text-foreground truncate">
                {booking.categoryName ?? "Service"}
              </p>
              <span
                className={`inline-flex h-5 items-center rounded-full border px-2 text-[10px] font-medium ${status.className}`}
              >
                {status.label}
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {booking.customerName && (
                <div className="flex items-center gap-1.5">
                  <Avatar className="size-4">
                    <AvatarImage
                      src={
                        booking.customerImage ??
                        getAvatarPlaceholder(booking.customerName ?? "")
                      }
                    />
                    <AvatarFallback className="text-[8px] bg-muted">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground truncate max-w-28">
                    {booking.customerName}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="size-3 shrink-0" />
                {new Date(booking.scheduledAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="size-3 shrink-0" />
                <span className="truncate max-w-32">
                  {booking.area}, {booking.city}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(booking.finalPrice ?? booking.quotedPrice) && (
              <p className="text-sm font-semibold text-foreground">
                ₹
                {Number(
                  booking.finalPrice ?? booking.quotedPrice,
                ).toLocaleString("en-IN")}
              </p>
            )}
            <ChevronRight className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function BookingList({ tab }: { tab: string }) {
  const { data, isLoading } = useSWR(buildQuery(tab), fetchBookings, {
    refreshInterval: tab === "active" || tab === "pending" ? 8_000 : 0,
  });
  const bookings = data?.data ?? [];

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-18 rounded-xl" />
        ))}
      </div>
    );

  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <span className="text-4xl mb-3">📋</span>
        <p
          className="text-sm font-semibold text-foreground"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          No bookings here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          New requests will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2.5">
      {bookings.map((b) => (
        <BookingCard key={b.id} booking={b} />
      ))}
    </div>
  );
}

export default function ProviderBookingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") ?? "pending";

  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Job Requests
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Manage your incoming and ongoing bookings
        </p>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setSearchParams({ tab: v })}
      >
        <TabsList variant="line" className="mb-5 gap-0.5 p-0 h-auto">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-full px-4 py-1.5 h-auto text-sm shrink-0 after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <BookingList tab={t.value} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
