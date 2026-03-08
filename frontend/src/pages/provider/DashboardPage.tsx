import { useAuth } from "@/context/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router";
import { Briefcase } from "lucide-react";
import useSWR from "swr";
import type { ListResponse, Booking } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useSWR<ListResponse<Booking>>(
    "/provider/bookings?status=requested&limit=5",
  );

  const requests = data?.data ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Hey, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New booking requests and your active jobs are below.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="gap-2">
          <Link to="/provider/bookings">All bookings</Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/provider/profile">Edit profile</Link>
        </Button>
      </div>

      <section>
        <h2 className="mb-4 text-base font-medium">Pending requests</h2>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
              <Briefcase className="size-10 text-muted-foreground/40" />
              <div>
                <p className="font-medium">No pending requests</p>
                <p className="text-sm text-muted-foreground">
                  New booking requests will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {requests.map((b) => (
              <Link key={b.id} to={`/provider/bookings/${b.id}`}>
                <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div>
                      <p className="font-medium text-sm">{b.categoryName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {b.city}, {b.area} ·{" "}
                        {new Date(b.scheduledAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                      New request
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
