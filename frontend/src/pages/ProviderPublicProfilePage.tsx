import { useParams, Link, useNavigate } from "react-router";
import useSWR from "swr";
import {
  ArrowLeft,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  PhoneCall,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { cn, getAvatarPlaceholder } from "@/lib/utils";
import { r, ROUTES } from "@/config/routes";
import { useAuth } from "@/context/AuthContext";
import type {
  ProviderProfile,
  Review,
  ListResponse,
  SingleResponse,
} from "@/types";
import { api } from "@/lib/api";

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchProvider(url: string): Promise<ProviderProfile> {
  const res = await api.get<SingleResponse<ProviderProfile>>(url);
  return res.data.data;
}

async function fetchReviews(url: string): Promise<Review[]> {
  const res = await api.get<ListResponse<Review>>(url);
  return res.data.data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StarRow({
  rating,
  size = "md",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const filled = Math.round(rating);
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={cn(
            size === "sm" ? "size-3" : "size-4",
            i < filled
              ? "fill-amber-400 text-amber-400"
              : "fill-transparent text-muted-foreground/30",
          )}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: Review }) {
  const initials = review.customerName
    ? review.customerName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  return (
    <Card className="py-0">
      <CardContent className="flex gap-3 py-4">
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-foreground">
              {review.customerName ?? "Customer"}
            </p>
            <time className="text-xs text-muted-foreground shrink-0">
              {new Date(review.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </time>
          </div>
          <StarRow rating={review.rating} size="sm" />
          {review.comment && (
            <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
              {review.comment}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StatBadge({
  icon: Icon,
  label,
}: {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <Icon className="size-4 text-brand-orange shrink-0" />
      {label}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProviderPublicProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: provider, isLoading: provLoading } = useSWR(
    id ? `/providers/${id}` : null,
    fetchProvider,
  );

  const { data: reviews, isLoading: revLoading } = useSWR(
    provider ? `/reviews/provider/${provider.id}` : null,
    fetchReviews,
  );

  const handleBook = () => {
    const bookingPath = r(ROUTES.CUSTOMER_BOOK_SERVICE, { providerId: id! });
    if (!user) {
      navigate(ROUTES.LOGIN, {
        state: { from: { pathname: bookingPath } },
      });
      return;
    }
    if (user.role !== "customer") return;
    navigate(bookingPath);
  };

  const initials = provider?.name
    ? provider.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const canBook = !user || user.role === "customer";

  if (provLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-8 space-y-6">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-52 w-full rounded-2xl" />
        <div className="flex gap-4">
          <Skeleton className="size-20 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p
          className="text-lg font-semibold"
          style={{ fontFamily: "Fraunces, serif" }}
        >
          Provider not found
        </p>
        <Button variant="outline" asChild>
          <Link to={ROUTES.BROWSE}>Back to browse</Link>
        </Button>
      </div>
    );
  }

  const avgRating = Number(provider.avgRating);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 pt-24 pb-10">
        {/* Back */}
        <Link
          to={ROUTES.BROWSE}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
        >
          <ArrowLeft className="size-3.5" />
          Back to browse
        </Link>

        {/* ── Hero cover + overlapping avatar ──────────────────────────────── */}
        <div className="relative">
          {/* Cover */}
          <div className="h-52 w-full overflow-hidden rounded-2xl bg-linear-to-br from-brand-cream via-brand-green-light to-(--brand-green)/30 sm:h-64">
            {provider.coverPhotoUrl && (
              <img
                src={provider.coverPhotoUrl}
                alt=""
                className="h-full w-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent rounded-2xl" />
          </div>

          {/* Avatar — positioned to overflow cover bottom */}
          <div className="absolute -bottom-10 left-5 sm:left-6">
            <Avatar className="size-20 ring-4 ring-background shadow-md sm:size-24">
              <AvatarImage
                src={
                  provider.image ?? getAvatarPlaceholder(provider.name ?? "")
                }
                alt={provider.name}
              />
              <AvatarFallback className="text-2xl font-bold bg-(--brand-orange)/10 text-brand-orange">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* ── Identity + CTA row ───────────────────────────────────────────── */}
        <div className="mt-14 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:mt-12">
          <div className="pl-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-2xl font-semibold text-foreground"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {provider.name ?? "Service Professional"}
              </h1>
              {provider.isApproved && (
                <CheckCircle2 className="size-5 text-emerald-500 shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <StarRow rating={avgRating} />
              <span className="text-sm text-muted-foreground">
                {avgRating.toFixed(1)} ({provider.totalReviews} reviews)
              </span>
            </div>
          </div>

          {/* Book CTA — only for customers / guests */}
          {canBook && (
            <div className="flex items-center gap-3 shrink-0">
              {provider.hourlyRate && (
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-orange">
                    ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">per hour</p>
                </div>
              )}
              <Button
                onClick={handleBook}
                className="bg-brand-orange hover:bg-(--brand-orange)/90 text-white px-6"
                disabled={provider.availabilityStatus === "unavailable"}
              >
                {provider.availabilityStatus === "unavailable"
                  ? "Unavailable"
                  : "Book Now"}
              </Button>
            </div>
          )}
        </div>

        {/* ── Quick stats bar ──────────────────────────────────────────────── */}
        <Card className="mt-5 py-0">
          <CardContent className="flex flex-wrap gap-5 px-5 py-3.5">
            <StatBadge
              icon={MapPin}
              label={`${provider.area}, ${provider.city}`}
            />
            <StatBadge
              icon={Briefcase}
              label={`${provider.totalBookings} jobs completed`}
            />
            <StatBadge
              icon={Clock}
              label={
                provider.availabilityStatus === "available"
                  ? "Available now"
                  : provider.availabilityStatus === "busy"
                    ? "Currently busy"
                    : "Unavailable"
              }
            />
            {provider.services && provider.services.length > 0 && (
              <StatBadge
                icon={CheckCircle2}
                label={`${provider.services.length} service${provider.services.length !== 1 ? "s" : ""} offered`}
              />
            )}
          </CardContent>
        </Card>

        {/* ── Content tabs ─────────────────────────────────────────────────── */}
        <div className="mt-6">
          <Tabs defaultValue="about">
            <TabsList variant="line" className="mb-5 gap-0.5 p-0 h-auto">
              {["about", "services", "reviews"].map((tab) => (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-full px-4 py-1.5 h-auto text-sm capitalize after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
                >
                  {tab}
                  {tab === "reviews" && (
                    <span className="ml-1 text-[10px] bg-(--brand-orange)/10 text-brand-orange rounded-full px-1.5 py-0.5 font-medium">
                      {provider.totalReviews}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* About tab */}
            <TabsContent value="about">
              <div className="max-w-2xl space-y-4">
                {provider.bio ? (
                  <div>
                    <h2 className="text-base font-semibold text-foreground mb-2">
                      About
                    </h2>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                      {provider.bio}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    This professional hasn't added a bio yet.
                  </p>
                )}
                <Separator />
                <div>
                  <h2 className="text-base font-semibold text-foreground mb-3">
                    Service area
                  </h2>
                  <div className="flex items-center gap-2">
                    <MapPin className="size-4 text-brand-orange" />
                    <span className="text-sm text-foreground">
                      {provider.area}, {provider.city}
                    </span>
                  </div>
                </div>
                {provider.hourlyRate && (
                  <>
                    <Separator />
                    <div>
                      <h2 className="text-base font-semibold text-foreground mb-2">
                        Pricing
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Starting from{" "}
                        <span className="font-semibold text-foreground">
                          ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
                          /hour
                        </span>
                        . Final pricing may vary based on job complexity and
                        materials.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Services tab */}
            <TabsContent value="services">
              {provider.services && provider.services.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {provider.services.map((svc) => (
                    <Card key={svc.id} className="py-0">
                      <CardContent className="flex items-start gap-3 py-3">
                        <span className="text-2xl leading-none mt-0.5">
                          {svc.icon}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-foreground">
                            {svc.name}
                          </p>
                          {svc.description && (
                            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                              {svc.description}
                            </p>
                          )}
                          {svc.basePrice && (
                            <Badge
                              variant="outline"
                              className="mt-1.5 text-[10px]"
                            >
                              From ₹
                              {Number(svc.basePrice).toLocaleString("en-IN")}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No services listed yet.
                </p>
              )}
            </TabsContent>

            {/* Reviews tab */}
            <TabsContent value="reviews">
              {revLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <PhoneCall className="size-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-foreground">
                    No reviews yet
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Be the first to book and leave a review!
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ── Mobile sticky Book bar ──────────────────────────────────────────── */}
      {canBook && (
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur px-4 py-3 sm:hidden">
          <div className="flex items-center justify-between gap-3">
            {provider.hourlyRate && (
              <div>
                <p className="text-lg font-bold text-brand-orange">
                  ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
                  <span className="text-xs font-normal text-muted-foreground">
                    /hr
                  </span>
                </p>
              </div>
            )}
            <Button
              onClick={handleBook}
              className="flex-1 bg-brand-orange hover:bg-brand-orange/90 text-white"
              disabled={provider.availabilityStatus === "unavailable"}
            >
              Book Now
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
