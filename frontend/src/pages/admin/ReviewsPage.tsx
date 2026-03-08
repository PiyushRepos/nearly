import { useState } from "react";
import useSWR from "swr";
import { CheckCircle2, Flag, Star, Loader2, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn, getAvatarPlaceholder } from "@/lib/utils";
import type { Review, ListResponse } from "@/types";
import { api } from "@/lib/api";

async function fetchReviews(url: string): Promise<ListResponse<Review>> {
  const res = await api.get<ListResponse<Review>>(url);
  return res.data;
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            "size-3.5 shrink-0",
            i < Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onAction,
  loading,
}: {
  review: Review;
  onAction: (id: string, action: "approve" | "flag") => void;
  loading: string | null;
}) {
  const initials =
    review.customerName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div
      className={cn(
        "rounded-xl bg-card ring-1 px-4 py-4 space-y-3",
        review.isFlagged
          ? "ring-destructive/30 bg-destructive/5"
          : "ring-foreground/10",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Avatar className="size-9 shrink-0">
            <AvatarImage
              src={
                review.customerImage ??
                getAvatarPlaceholder(review.customerName ?? "Customer")
              }
            />
            <AvatarFallback className="text-xs bg-(--brand-orange)/10 text-brand-orange">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {review.customerName ?? "Customer"}
            </p>
            <StarRow rating={review.rating} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {review.isFlagged && (
            <span className="text-[11px] font-medium text-destructive bg-destructive/10 border border-destructive/20 rounded-full px-2 py-0.5">
              Flagged
            </span>
          )}
          {review.isApproved && (
            <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
              Approved
            </span>
          )}
          <time className="text-xs text-muted-foreground">
            {new Date(review.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
            })}
          </time>
        </div>
      </div>

      {review.comment && (
        <p className="text-sm text-muted-foreground leading-relaxed">
          {review.comment}
        </p>
      )}

      <div className="flex gap-2">
        {!review.isApproved && (
          <Button
            size="sm"
            className="h-7 gap-1.5 text-xs bg-brand-orange hover:bg-(--brand-orange)/90 text-white"
            disabled={loading === review.id}
            onClick={() => onAction(review.id, "approve")}
          >
            {loading === review.id ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <CheckCircle2 className="size-3" />
            )}
            Approve
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-7 gap-1.5 text-xs",
            review.isFlagged && "text-muted-foreground",
          )}
          disabled={loading === review.id}
          onClick={() =>
            onAction(review.id, review.isFlagged ? "approve" : "flag")
          }
        >
          {review.isFlagged ? (
            <EyeOff className="size-3" />
          ) : (
            <Flag className="size-3" />
          )}
          {review.isFlagged ? "Unflag" : "Flag"}
        </Button>
      </div>
    </div>
  );
}

function ReviewList({ url }: { url: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const { data, isLoading, mutate } = useSWR(url, fetchReviews, {
    refreshInterval: 20_000,
  });

  const doAction = async (id: string, action: "approve" | "flag") => {
    setLoading(id);
    try {
      await api.patch(`/admin/reviews/${id}/${action}`);
      mutate();
    } finally {
      setLoading(null);
    }
  };

  const reviews = data?.data ?? [];

  if (isLoading)
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
    );

  if (reviews.length === 0)
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <Star className="size-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">No reviews here</p>
      </div>
    );

  return (
    <div className="space-y-3">
      {reviews.map((r) => (
        <ReviewCard
          key={r.id}
          review={r}
          onAction={doAction}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [tab, setTab] = useState("all");

  return (
    <div className="space-y-5">
      <div>
        <h1
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Reviews
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Moderate customer reviews before they appear publicly
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-5 gap-0.5 p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-full px-4 py-1.5 h-auto text-sm after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
          >
            All Reviews
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-full px-4 py-1.5 h-auto text-sm after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
          >
            Pending Approval
          </TabsTrigger>
          <TabsTrigger
            value="flagged"
            className="rounded-full px-4 py-1.5 h-auto text-sm after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
          >
            Flagged
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <ReviewList url="/admin/reviews?approved=false" />
        </TabsContent>
        <TabsContent value="flagged">
          <ReviewList url="/admin/reviews?flagged=true" />
        </TabsContent>
        <TabsContent value="all">
          <ReviewList url="/admin/reviews" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
