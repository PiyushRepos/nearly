import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import useSWR from "swr";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodSafeResolver } from "@/lib/zod-resolver";
import { ArrowLeft, Star, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, getAvatarPlaceholder } from "@/lib/utils";
import { r, ROUTES } from "@/config/routes";
import type { Booking, SingleResponse } from "@/types";
import { api } from "@/lib/api";

const schema = z.object({
  rating: z.number().int().min(1, "Please select a rating").max(5),
  comment: z.string().max(1000).optional(),
});
type FormData = z.infer<typeof schema>;

const LABELS = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

async function fetchBooking(url: string): Promise<Booking> {
  const res = await api.get<SingleResponse<Booking>>(url);
  return res.data.data;
}

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            className="p-0.5 transition-transform hover:scale-110 focus-visible:outline-none"
            onMouseEnter={() => setHovered(n)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(n)}
          >
            <Star
              className={cn(
                "size-9 transition-colors",
                n <= active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-muted-foreground/30",
              )}
            />
          </button>
        ))}
      </div>
      {active > 0 && (
        <p className="text-sm font-medium text-amber-600">{LABELS[active]}</p>
      )}
    </div>
  );
}

export default function CustomerReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const { data: booking, isLoading } = useSWR(
    id ? `/customer/bookings/${id}` : null,
    fetchBooking,
  );

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodSafeResolver(schema),
    defaultValues: { rating: 0, comment: "" },
  });

  const onSubmit = async (data: FormData) => {
    await api.post("/reviews", { bookingId: id, ...data });
    setSubmitted(true);
    setTimeout(
      () => navigate(r(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: id! })),
      2000,
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-md mx-auto space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Booking not found
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.CUSTOMER_BOOKINGS}>Back to bookings</Link>
        </Button>
      </div>
    );
  }

  const providerInitials =
    booking.providerName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  if (submitted) {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Review submitted!
        </h2>
        <p className="text-sm text-muted-foreground text-center">
          Thank you for sharing your experience. Redirecting you back…
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-5">
      {/* Back */}
      <Link
        to={r(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: id! })}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to booking
      </Link>

      <div>
        <h1
          className="text-2xl font-semibold text-foreground"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Leave a Review
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Share your experience with the professional
        </p>
      </div>

      {/* Provider card */}
      {booking.providerName && (
        <Card className="py-0">
          <CardContent className="flex items-center gap-3 px-4 py-3">
            <Avatar className="size-11 shrink-0">
              <AvatarImage
                src={
                  booking.providerImage ??
                  getAvatarPlaceholder(booking.providerName ?? "")
                }
              />
              <AvatarFallback className="bg-(--brand-orange)/10 text-brand-orange font-semibold text-sm">
                {providerInitials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {booking.providerName}
              </p>
              <p className="text-xs text-muted-foreground">
                {booking.categoryName}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Your Rating
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Stars */}
            <div className="space-y-2">
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <StarPicker value={field.value} onChange={field.onChange} />
                )}
              />
              {errors.rating && (
                <p className="text-xs text-destructive">
                  {errors.rating.message}
                </p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <Label>
                Comment{" "}
                <span className="text-muted-foreground font-normal">
                  (optional)
                </span>
              </Label>
              <Textarea
                {...register("comment")}
                placeholder="Describe your experience — was the professional punctual, skilled, friendly?"
                className="min-h-28 resize-none"
              />
              {errors.comment && (
                <p className="text-xs text-destructive">
                  {errors.comment.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-2 font-semibold"
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Submit Review
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
