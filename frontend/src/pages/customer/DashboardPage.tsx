import { CalendarCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { useAuth } from "@/context/AuthContext";
import useSWR from "swr";
import type { ListResponse, Booking } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomerDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR<ListResponse<Booking>>(
    "/customer/bookings?limit=3",
  );

  const bookings = data?.data ?? [];

  return (
    <div className="space-y-8">
      {/* Greeting */}
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Good day, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening with your bookings.
        </p>
      </div>

      {/* CTA */}
      <div className="flex flex-wrap gap-3">
        <Button asChild className="gap-2">
          <Link to="/browse">Find a professional</Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link to="/customer/bookings">View all bookings</Link>
        </Button>
      </div>

      {/* Recent bookings */}
      <section>
        <h2 className="mb-4 text-base font-medium">Recent bookings</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <CalendarCheck className="size-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium">No bookings yet</p>
                <p className="text-sm text-muted-foreground">
                  Book your first service and it will appear here.
                </p>
              </div>
              <Button asChild size="sm">
                <Link to="/browse">Browse services</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col space-y-2.5">
            {bookings.map((b) => (
              <Link key={b.id} to={`/customer/bookings/${b.id}`}>
                <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-sm">
                        {b.categoryName ?? "Service"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.address} ·{" "}
                        {new Date(b.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${b.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : b.status === "cancelled"
                            ? "bg-red-100 text-red-600"
                            : b.status === "in_progress"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-amber-100 text-amber-700"
                        }`}
                    >
                      {b.status.replace("_", " ")}
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
