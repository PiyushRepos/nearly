import { useParams, Link, useSearchParams } from "react-router";
import useSWR from "swr";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  Clock,
  FileText,
  ImageIcon,
  X,
  Star,
  CreditCard,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn, getAvatarPlaceholder } from "@/lib/utils";
import { r, ROUTES } from "@/config/routes";
import type { Booking, BookingStatus, SingleResponse } from "@/types";
import { api } from "@/lib/api";

// ─── Status config ────────────────────────────────────────────────────────────

const ALL_STATUSES: BookingStatus[] = [
  "requested",
  "confirmed",
  "in_progress",
  "completed",
];

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_DESCRIPTIONS: Record<BookingStatus, string> = {
  requested: "Waiting for the professional to confirm your booking.",
  confirmed: "The professional has confirmed and will arrive as scheduled.",
  in_progress: "Service is currently underway.",
  completed: "Service completed successfully.",
  cancelled: "This booking was cancelled.",
};

// ─── Fetcher ──────────────────────────────────────────────────────────────────

async function fetchBooking(url: string): Promise<Booking> {
  const res = await api.get<SingleResponse<Booking>>(url);
  return res.data.data;
}

// ─── Timeline ─────────────────────────────────────────────────────────────────

function BookingTimeline({ booking }: { booking: Booking }) {
  const cancelled = booking.status === "cancelled";
  const currentIdx = cancelled ? -1 : ALL_STATUSES.indexOf(booking.status);

  return (
    <div className="space-y-0">
      {cancelled ? (
        <div className="flex items-center gap-3 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3.5">
          <div className="flex size-8 items-center justify-center rounded-full bg-destructive/10 shrink-0">
            <X className="size-4 text-destructive" />
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              Booking Cancelled
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              This booking was cancelled.
            </p>
          </div>
        </div>
      ) : (
        ALL_STATUSES.map((status, idx) => {
          const done = idx <= currentIdx;
          const active = idx === currentIdx;
          const updates =
            booking.updates?.filter((u) => u.status === status) ?? [];

          return (
            <div key={status} className="flex gap-3">
              {/* Line + dot */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                    done
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-border bg-card text-muted-foreground",
                  )}
                >
                  {done ? "✓" : idx + 1}
                </div>
                {idx < ALL_STATUSES.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 my-1 min-h-8 rounded",
                      idx < currentIdx ? "bg-brand-orange" : "bg-border",
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div
                className={cn(
                  "flex-1 pb-4",
                  idx === ALL_STATUSES.length - 1 && "pb-0",
                )}
              >
                <div className="flex items-baseline gap-2">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      active
                        ? "text-brand-orange"
                        : done
                          ? "text-foreground"
                          : "text-muted-foreground",
                    )}
                  >
                    {STATUS_LABELS[status]}
                  </p>
                  {active && (
                    <span className="text-[10px] font-medium bg-(--brand-orange)/10 text-brand-orange rounded-full px-1.5 py-0.5">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {STATUS_DESCRIPTIONS[status]}
                </p>

                {/* Work updates for this status */}
                {updates.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {updates.map((upd) => (
                      <div
                        key={upd.id}
                        className="rounded-lg bg-muted/40 border border-border px-3 py-2"
                      >
                        {upd.message && (
                          <p className="text-xs text-foreground">
                            {upd.message}
                          </p>
                        )}
                        {upd.images?.length > 0 && (
                          <div className="flex gap-1.5 mt-1.5 flex-wrap">
                            {upd.images.map((img, i) => (
                              <a
                                key={i}
                                href={img}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <img
                                  src={img}
                                  alt="Update"
                                  className="size-14 rounded-md object-cover hover:opacity-80 transition-opacity"
                                />
                              </a>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {new Date(upd.createdAt).toLocaleString("en-IN")}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ─── Cancel dialog ────────────────────────────────────────────────────────────

function CancelDialog({
  bookingId,
  onCancelled,
}: {
  bookingId: string;
  onCancelled: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    try {
      setLoading(true);
      await api.patch(`/customer/bookings/${bookingId}/cancel`);
      onCancelled();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="gap-1.5">
          <X className="size-3.5" />
          Cancel Booking
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-destructive" />
            Cancel this booking?
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will notify the professional and cancel your booking. You can
            re-book anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep booking</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading && <Loader2 className="size-3.5 animate-spin mr-1" />}
            Yes, cancel
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CustomerBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isActive = (status: BookingStatus) =>
    ["requested", "confirmed", "in_progress"].includes(status);

  const {
    data: booking,
    isLoading,
    mutate,
  } = useSWR(id ? `/customer/bookings/${id}` : null, fetchBooking, {
    refreshInterval: (data) => (data && isActive(data.status) ? 8_000 : 0),
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
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

  const canCancel = ["requested", "confirmed"].includes(booking.status);
  const canPay =
    booking.status === "completed" && booking.paymentStatus === "unpaid";
  const canReview = booking.status === "completed" && !booking.hasReview;
  const justPaid = searchParams.get("paid") === "1";
  const justBooked = searchParams.get("booked") === "1";

  const providerInitials =
    booking.providerName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="max-w-2xl space-y-5">
      {/* Back */}
      <Link
        to={ROUTES.CUSTOMER_BOOKINGS}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Back to bookings
      </Link>

      {/* Success banners */}
      {justPaid && (
        <div className="flex items-center gap-2.5 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="font-medium">Payment successful!</span> Your payment
          has been received.
        </div>
      )}
      {justBooked && (
        <div className="flex items-center gap-2.5 rounded-xl bg-(--brand-orange)/10 border border-(--brand-orange)/20 px-4 py-3 text-sm text-brand-orange">
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="font-medium">Booking placed!</span> Waiting for the
          professional to confirm.
        </div>
      )}

      {/* Title + id */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            {booking.categoryName ?? "Service Booking"}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 font-mono">
            #{booking.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        {canCancel && (
          <CancelDialog bookingId={booking.id} onCancelled={() => mutate()} />
        )}
      </div>

      {/* ── Provider card ──────────────────────────────────────────────── */}
      {booking.providerName && (
        <div className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-foreground/10 px-4 py-3">
          <Avatar className="size-11 shrink-0">
            <AvatarImage
              src={
                booking.providerImage ??
                getAvatarPlaceholder(booking.providerName ?? "")
              }
            />
            <AvatarFallback className="text-xs bg-(--brand-orange)/10 text-brand-orange font-semibold">
              {providerInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {booking.providerName}
            </p>
            <p className="text-xs text-muted-foreground">
              Service Professional
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link to={r(ROUTES.PROVIDER_PROFILE, { id: booking.providerId! })}>
              View Profile
            </Link>
          </Button>
        </div>
      )}

      {/* ── Booking details ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Booking Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <DetailRow icon={CalendarDays} label="Scheduled">
            {new Date(booking.scheduledAt).toLocaleDateString("en-IN", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" at "}
            {new Date(booking.scheduledAt).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </DetailRow>
          <Separator />
          <DetailRow icon={MapPin} label="Address">
            {booking.address}, {booking.area}, {booking.city}
          </DetailRow>
          {booking.notes && (
            <>
              <Separator />
              <DetailRow icon={FileText} label="Notes">
                {booking.notes}
              </DetailRow>
            </>
          )}
          {booking.attachmentUrl && (
            <>
              <Separator />
              <DetailRow icon={ImageIcon} label="Attachment">
                <a
                  href={booking.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block"
                >
                  <img
                    src={booking.attachmentUrl}
                    alt="Attachment"
                    className="mt-1.5 h-24 rounded-lg object-cover hover:opacity-80 transition-opacity"
                  />
                </a>
              </DetailRow>
            </>
          )}
          <Separator />
          <DetailRow icon={Clock} label="Booked on">
            {new Date(booking.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </DetailRow>
          {(booking.finalPrice ?? booking.quotedPrice) && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {booking.finalPrice ? "Final price" : "Estimated price"}
                </span>
                <span className="font-bold text-base text-foreground">
                  ₹
                  {Number(
                    booking.finalPrice ?? booking.quotedPrice,
                  ).toLocaleString("en-IN")}
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Timeline ──────────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Booking Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BookingTimeline booking={booking} />
        </CardContent>
      </Card>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      {(canPay || canReview) && (
        <div className="flex flex-col gap-2 sm:flex-row">
          {canPay && (
            <Button
              asChild
              className="flex-1 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-2"
            >
              <Link to={r(ROUTES.CUSTOMER_PAY, { id: booking.id })}>
                <CreditCard className="size-4" />
                Pay ₹
                {Number(
                  booking.finalPrice ?? booking.quotedPrice,
                ).toLocaleString("en-IN")}
              </Link>
            </Button>
          )}
          {canReview && (
            <Button asChild variant="outline" className="flex-1 gap-2">
              <Link to={r(ROUTES.CUSTOMER_REVIEW, { id: booking.id })}>
                <Star className="size-4" />
                Leave a Review
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="size-4 text-brand-orange shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground font-medium mb-0.5">
          {label}
        </p>
        <div className="text-sm text-foreground">{children}</div>
      </div>
    </div>
  );
}
