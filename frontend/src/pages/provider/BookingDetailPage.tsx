import { useParams, Link } from "react-router";
import { useState, useRef } from "react";
import useSWR from "swr";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  FileText,
  ImageIcon,
  X,
  CheckCircle2,
  XCircle,
  Play,
  FlagTriangleRight,
  Loader2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { ROUTES } from "@/config/routes";
import type { Booking, BookingStatus, SingleResponse } from "@/types";
import { api } from "@/lib/api";

async function fetchBooking(url: string): Promise<Booking> {
  const res = await api.get<SingleResponse<Booking>>(url);
  return res.data.data;
}

const STATUS_LABELS: Record<BookingStatus, string> = {
  requested: "Requested",
  confirmed: "Confirmed",
  in_progress: "In Progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

const STATUS_COLORS: Record<BookingStatus, string> = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-blue-50 text-blue-700 border-blue-200",
  in_progress: "bg-indigo-50 text-indigo-700 border-indigo-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function ActionBtn({
  label,
  icon: Icon,
  onClick,
  loading,
  variant = "default",
  disabled,
}: {
  label: string;
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  onClick: () => void;
  loading?: boolean;
  variant?: "default" | "destructive" | "outline";
  disabled?: boolean;
}) {
  return (
    <Button
      onClick={onClick}
      disabled={loading || disabled}
      variant={variant}
      className={cn(
        "flex-1 gap-2 h-10",
        variant === "default" &&
          "bg-brand-orange hover:bg-(--brand-orange)/90 text-white",
      )}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Icon className="size-4" />
      )}
      {label}
    </Button>
  );
}

function WorkUpdateForm({
  bookingId,
  onDone,
}: {
  bookingId: string;
  onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async () => {
    const fd = new FormData();
    fd.append("message", message);
    photos.forEach((f) => fd.append("images", f));
    try {
      setLoading(true);
      await api.post(`/provider/bookings/${bookingId}/updates`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("");
      setPhotos([]);
      setOpen(false);
      onDone();
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <Button
        variant="outline"
        className="gap-2 h-9"
        onClick={() => setOpen(true)}
      >
        <PlusCircle className="size-4" />
        Add work update
      </Button>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3">
      <p className="text-sm font-semibold text-foreground">Add a work update</p>
      <div className="space-y-1.5">
        <Label className="text-xs">Message</Label>
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Describe what was done or any progress…"
          className="min-h-20 resize-none text-sm"
        />
      </div>
      <div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => setPhotos(Array.from(e.target.files ?? []))}
        />
        {photos.length > 0 ? (
          <div className="flex gap-2 flex-wrap">
            {photos.map((f, i) => (
              <div key={i} className="relative size-16">
                <img
                  src={URL.createObjectURL(f)}
                  className="size-full rounded-lg object-cover"
                  alt=""
                />
                <button
                  type="button"
                  onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
                  className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-destructive text-white"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="size-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-(--brand-orange)/50 hover:text-brand-orange transition-colors"
            >
              <PlusCircle className="size-5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-2 text-xs text-muted-foreground hover:border-(--brand-orange)/50 hover:text-foreground transition-colors"
          >
            <ImageIcon className="size-4" /> Attach photos (optional)
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => setOpen(false)}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          disabled={!message.trim() || loading}
          className="flex-1 bg-brand-orange hover:bg-(--brand-orange)/90 text-white"
          onClick={handleSubmit}
        >
          {loading && <Loader2 className="size-3.5 animate-spin mr-1" />}
          Post update
        </Button>
      </div>
    </div>
  );
}

export default function ProviderBookingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isActive = (s: BookingStatus) =>
    ["requested", "confirmed", "in_progress"].includes(s);

  const {
    data: booking,
    isLoading,
    mutate,
  } = useSWR(id ? `/provider/bookings/${id}` : null, fetchBooking, {
    refreshInterval: (d) => (d && isActive(d.status) ? 8_000 : 0),
  });

  const doAction = async (
    type: "accept" | "reject" | "in_progress" | "completed",
  ) => {
    if (!id) return;
    setActionLoading(type);
    try {
      if (type === "accept") await api.patch(`/provider/bookings/${id}/accept`);
      if (type === "reject") await api.patch(`/provider/bookings/${id}/reject`);
      if (type === "in_progress" || type === "completed")
        await api.patch(`/provider/bookings/${id}/status`, { status: type });
      mutate();
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading)
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );

  if (!booking)
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Booking not found
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.PROVIDER_BOOKINGS}>Back to bookings</Link>
        </Button>
      </div>
    );

  const customerInitials =
    booking.customerName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <div className="max-w-2xl space-y-5">
      <Link
        to={ROUTES.PROVIDER_BOOKINGS}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="size-3.5" /> Back to bookings
      </Link>

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
        <span
          className={`inline-flex h-6 items-center rounded-full border px-2.5 text-xs font-medium ${STATUS_COLORS[booking.status]}`}
        >
          {STATUS_LABELS[booking.status]}
        </span>
      </div>

      {/* Customer */}
      {booking.customerName && (
        <div className="flex items-center gap-3 rounded-xl bg-card ring-1 ring-foreground/10 px-4 py-3">
          <Avatar className="size-11 shrink-0">
            <AvatarImage
              src={
                booking.customerImage ??
                getAvatarPlaceholder(booking.customerName ?? "")
              }
            />
            <AvatarFallback className="text-xs bg-(--brand-orange)/10 text-brand-orange font-semibold">
              {customerInitials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {booking.customerName}
            </p>
            <p className="text-xs text-muted-foreground">Customer</p>
          </div>
        </div>
      )}

      {/* Details */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row icon={CalendarDays}>
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
          </Row>
          <Separator />
          <Row icon={MapPin}>
            {booking.address}, {booking.area}, {booking.city}
          </Row>
          {booking.notes && (
            <>
              <Separator />
              <Row icon={FileText}>{booking.notes}</Row>
            </>
          )}
          {booking.attachmentUrl && (
            <>
              <Separator />
              <Row icon={ImageIcon}>
                <a
                  href={booking.attachmentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={booking.attachmentUrl}
                    className="mt-1.5 h-24 rounded-lg object-cover hover:opacity-80 transition-opacity"
                    alt=""
                  />
                </a>
              </Row>
            </>
          )}
          {(booking.finalPrice ?? booking.quotedPrice) && (
            <>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">
                  {booking.finalPrice ? "Final price" : "Quoted price"}
                </span>
                <span className="font-bold text-base">
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

      {/* Work updates */}
      {booking.updates && booking.updates.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Work Updates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {booking.updates.map((upd) => (
              <div
                key={upd.id}
                className="rounded-xl bg-muted/30 border border-border px-3 py-2.5"
              >
                {upd.message && (
                  <p className="text-sm text-foreground">{upd.message}</p>
                )}
                {upd.images?.length > 0 && (
                  <div className="flex gap-1.5 mt-2 flex-wrap">
                    {upd.images.map((img, i) => (
                      <a
                        key={i}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <img
                          src={img}
                          className="size-14 rounded-md object-cover hover:opacity-80"
                          alt=""
                        />
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-muted-foreground mt-1.5">
                  {new Date(upd.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {booking.status === "requested" && (
        <div className="flex gap-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="flex-1 gap-2 h-10">
                <XCircle className="size-4" /> Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject this booking?</AlertDialogTitle>
                <AlertDialogDescription>
                  The customer will be notified. You can't undo this.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Back</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => doAction("reject")}
                  className="bg-destructive text-white hover:bg-destructive/90"
                >
                  Yes, reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <ActionBtn
            label="Accept Booking"
            icon={CheckCircle2}
            onClick={() => doAction("accept")}
            loading={actionLoading === "accept"}
          />
        </div>
      )}

      {booking.status === "confirmed" && (
        <div className="space-y-3">
          <WorkUpdateForm bookingId={booking.id} onDone={() => mutate()} />
          <ActionBtn
            label="Start Work"
            icon={Play}
            onClick={() => doAction("in_progress")}
            loading={actionLoading === "in_progress"}
          />
        </div>
      )}

      {booking.status === "in_progress" && (
        <div className="space-y-3">
          <WorkUpdateForm bookingId={booking.id} onDone={() => mutate()} />
          <ActionBtn
            label="Mark as Completed"
            icon={FlagTriangleRight}
            onClick={() => doAction("completed")}
            loading={actionLoading === "completed"}
          />
        </div>
      )}
    </div>
  );
}

function Row({
  icon: Icon,
  children,
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <Icon className="size-4 text-[var(--brand-orange)] shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 text-sm text-foreground">{children}</div>
    </div>
  );
}
