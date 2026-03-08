import useSWR from "swr";
import { Star, MessageSquare } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { r, ROUTES } from "@/config/routes";
import type { Review, ListResponse } from "@/types";

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${i <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  );
}

export default function ProviderReceivedReviewsPage() {
  const { data, isLoading } = useSWR<ListResponse<Review>>("/reviews/received");
  const reviews = data?.data ?? [];

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          My Reviews
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reviews left by your customers.
        </p>
      </div>

      {!isLoading && reviews.length > 0 && (
        <Card className="border-amber-200/60 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-900/30">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Average rating</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="text-2xl font-semibold"
                  style={{ fontFamily: "Fraunces, serif" }}
                >
                  {avgRating.toFixed(1)}
                </span>
                <StarRating value={Math.round(avgRating)} />
                <span className="text-sm text-muted-foreground">
                  ({reviews.length} review{reviews.length !== 1 ? "s" : ""})
                </span>
              </div>
            </div>
            <Star className="size-8 text-amber-400/60" />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <MessageSquare className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No reviews yet</p>
              <p className="text-sm text-muted-foreground">
                Customer reviews will appear here once they complete and review
                their bookings.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const initials =
              review.customerName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ?? "?";

            return (
              <Link
                key={review.id}
                to={r(ROUTES.PROVIDER_BOOKING_DETAIL, { id: review.bookingId })}
              >
                <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="py-4 flex gap-4 items-start">
                    <Avatar className="size-10 shrink-0 mt-0.5">
                      <AvatarImage src={review.customerImage ?? undefined} />
                      <AvatarFallback className="text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">
                          {review.customerName ?? "Anonymous"}
                        </p>
                        <time className="text-xs text-muted-foreground shrink-0">
                          {new Date(review.createdAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </time>
                      </div>

                      {review.categoryName && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {review.categoryIcon} {review.categoryName}
                        </p>
                      )}

                      <div className="mt-2">
                        <StarRating value={review.rating} />
                      </div>

                      {review.comment && (
                        <p className="mt-2 text-sm text-foreground/80 leading-relaxed">
                          "{review.comment}"
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
