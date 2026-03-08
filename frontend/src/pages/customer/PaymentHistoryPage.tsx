import useSWR from "swr";
import { CreditCard, Receipt } from "lucide-react";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { r, ROUTES } from "@/config/routes";
import type { PaymentRecord, ListResponse } from "@/types";

function formatCurrency(value: string | null): string {
  if (!value) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(parseFloat(value));
}

export default function CustomerPaymentHistoryPage() {
  const { data, isLoading } =
    useSWR<ListResponse<PaymentRecord>>("/payments/history");
  const payments = data?.data ?? [];

  const total = payments.reduce((sum, p) => {
    const amt = parseFloat(p.finalPrice ?? p.quotedPrice ?? "0");
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Payment History
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          All services you have paid for.
        </p>
      </div>

      {!isLoading && payments.length > 0 && (
        <Card className="bg-brand-orange/5 border-brand-orange/20">
          <CardContent className="py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total spent</p>
              <p
                className="text-2xl font-semibold text-brand-orange mt-0.5"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {formatCurrency(total.toFixed(2))}
              </p>
            </div>
            <CreditCard className="size-8 text-brand-orange/40" />
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      ) : payments.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
            <Receipt className="size-10 text-muted-foreground/40" />
            <div>
              <p className="font-medium">No payments yet</p>
              <p className="text-sm text-muted-foreground">
                Your payment history will appear here after you pay for a
                completed booking.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {payments.map((p) => {
            const initials =
              p.providerName
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2) ?? "?";

            return (
              <Link
                key={p.id}
                to={r(ROUTES.CUSTOMER_BOOKING_DETAIL, { id: p.id })}
              >
                <Card className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="py-4 flex gap-4 items-center">
                    <Avatar className="size-10 shrink-0">
                      <AvatarImage src={p.providerImage ?? undefined} />
                      <AvatarFallback className="text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <p className="font-medium text-sm truncate">
                          {p.categoryIcon} {p.categoryName ?? "Service"}
                        </p>
                        <span className="font-semibold text-sm text-emerald-600 shrink-0">
                          {formatCurrency(p.finalPrice ?? p.quotedPrice)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {p.providerName ?? "Unknown Provider"}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <time className="text-xs text-muted-foreground">
                          {new Date(p.updatedAt).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </time>
                        {p.razorpayPaymentId && (
                          <span className="text-xs text-muted-foreground font-mono">
                            {p.razorpayPaymentId.slice(0, 16)}…
                          </span>
                        )}
                      </div>
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
