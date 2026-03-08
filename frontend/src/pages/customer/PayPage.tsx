import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import useSWR from "swr";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { r, ROUTES } from "@/config/routes";
import type { Booking, SingleResponse } from "@/types";
import { api } from "@/lib/api";

async function fetchBooking(url: string): Promise<Booking> {
  const res = await api.get<SingleResponse<Booking>>(url);
  return res.data.data;
}

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as { Razorpay?: unknown }).Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load payment gateway"));
    document.body.appendChild(script);
  });
}

export default function PayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: booking, isLoading } = useSWR(
    id ? `/bookings/${id}` : null,
    fetchBooking,
  );

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

  if (booking.paymentStatus === "paid") {
    return (
      <div className="max-w-md mx-auto flex flex-col items-center justify-center gap-4 py-20">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-8 text-emerald-600" />
        </div>
        <h2
          className="text-xl font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Already paid
        </h2>
        <p className="text-sm text-muted-foreground">
          This booking has already been paid for.
        </p>
        <Button variant="outline" asChild>
          <Link to={r(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: booking.id })}>
            View booking
          </Link>
        </Button>
      </div>
    );
  }

  const amount = Number(booking.finalPrice ?? booking.quotedPrice ?? 0);

  const handlePay = async () => {
    if (!id) return;
    setError(null);
    setPaying(true);

    try {
      await loadRazorpayScript();

      const { data: order } = await api.post<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>("/payments/create-order", { bookingId: id });

      await new Promise<void>((resolve, reject) => {
        const rz = new (
          window as unknown as {
            Razorpay: new (opts: object) => { open: () => void };
          }
        ).Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: order.amount,
          currency: order.currency,
          name: "Nearly",
          description: `${booking.categoryName ?? "Service"} booking`,
          prefill: {},
          theme: { color: "#C8622A" },
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await api.post("/payments/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: id,
              });
              resolve();
            } catch {
              reject(
                new Error("Payment verification failed. Contact support."),
              );
            }
          },
          modal: {
            ondismiss: () => reject(new Error("DISMISSED")),
          },
        });
        rz.open();
      });

      navigate(r(ROUTES.CUSTOMER_BOOKING_DETAIL, { id }) + "?paid=1");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Payment failed";
      if (msg !== "DISMISSED") setError(msg);
    } finally {
      setPaying(false);
    }
  };

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
          Complete Payment
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Secure payment powered by Razorpay
        </p>
      </div>

      {/* Summary card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Service</span>
            <span className="font-medium">
              {booking.categoryName ?? "Service"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Professional</span>
            <span className="font-medium">{booking.providerName ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Booking ID</span>
            <span className="font-mono text-xs">
              {booking.id.slice(0, 8).toUpperCase()}
            </span>
          </div>
          <Separator />
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">Total</span>
            <span className="text-xl font-bold text-foreground">
              ₹{amount.toLocaleString("en-IN")}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Trust indicators */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground rounded-xl bg-muted/50 px-4 py-3 border border-border">
        <ShieldCheck className="size-4 shrink-0 text-emerald-600" />
        <span>
          256-bit SSL encrypted. Your payment info is never stored on our
          servers.
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pay button */}
      <Button
        className="w-full h-11 gap-2 bg-brand-orange hover:bg-(--brand-orange)/90 text-white text-base font-semibold"
        disabled={paying}
        onClick={handlePay}
      >
        {paying ? (
          <Loader2 className="size-5 animate-spin" />
        ) : (
          <CreditCard className="size-5" />
        )}
        {paying
          ? "Opening payment gateway…"
          : `Pay ₹${amount.toLocaleString("en-IN")}`}
      </Button>
    </div>
  );
}
