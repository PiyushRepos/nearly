import { useState, useCallback } from "react";
import { useSearchParams, Link } from "react-router";
import useSWR from "swr";
import {
  Search,
  MapPin,
  Star,
  Clock,
  CheckCircle2,
  ArrowUpDown,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, getAvatarPlaceholder } from "@/lib/utils";
import { r, ROUTES } from "@/config/routes";
import type { ServiceCategory, ProviderProfile, ListResponse } from "@/types";
import { api } from "@/lib/api";

// ─── Fetchers ─────────────────────────────────────────────────────────────────

async function fetchCategories(): Promise<ServiceCategory[]> {
  const res = await api.get<ListResponse<ServiceCategory>>("/categories");
  return res.data.data;
}

async function fetchProviders(
  url: string,
): Promise<ListResponse<ProviderProfile>> {
  const res = await api.get<ListResponse<ProviderProfile>>(url);
  return res.data;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const AVAILABILITY_CONFIG = {
  available: {
    label: "Available",
    className: "text-emerald-600 bg-emerald-50 border-emerald-200",
  },
  busy: {
    label: "Busy",
    className: "text-amber-600 bg-amber-50 border-amber-200",
  },
  unavailable: {
    label: "Unavailable",
    className: "text-muted-foreground bg-muted border-border",
  },
} as const;

function StarRating({ rating, count }: { rating: number; count: number }) {
  const stars = Math.round(Number(rating));
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "size-3.5 shrink-0",
              i < stars
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40",
            )}
          />
        ))}
      </div>
      <span className="text-xs text-muted-foreground">
        {Number(rating).toFixed(1)}
        <span className="ml-1">({count})</span>
      </span>
    </div>
  );
}

function ProviderCard({ provider }: { provider: ProviderProfile }) {
  const avail = AVAILABILITY_CONFIG[provider.availabilityStatus];
  const initials = provider.name
    ? provider.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <Link
      to={r(ROUTES.PROVIDER_PROFILE, { id: provider.id })}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
    >
      <div className="flex flex-col overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10 transition-shadow duration-200 hover:shadow-md hover:ring-foreground/20 h-full">
        {/* Cover */}
        <div className="relative h-28 overflow-hidden bg-linear-to-br from-brand-cream to-brand-green-light">
          {provider.coverPhotoUrl && (
            <img
              src={provider.coverPhotoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
          {/* Availability chip */}
          <span
            className={cn(
              "absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium",
              avail.className,
            )}
          >
            <span className="size-1.5 rounded-full bg-current" />
            {avail.label}
          </span>
        </div>

        {/* Avatar bridge */}
        <div className="-mt-7 px-4">
          <Avatar className="size-14 ring-2 ring-card shadow-sm">
            <AvatarImage
              src={provider.image ?? getAvatarPlaceholder(provider.name ?? "")}
              alt={provider.name}
            />
            <AvatarFallback className="bg-(--brand-orange)/10 text-brand-orange font-semibold text-sm">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 px-4 pt-2 pb-4 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className="font-semibold text-foreground leading-snug"
                style={{ fontFamily: "Fraunces, serif" }}
              >
                {provider.name ?? "Service Professional"}
              </p>
              {provider.isApproved && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                  <CheckCircle2 className="size-3" />
                  Verified
                </span>
              )}
            </div>
            {provider.hourlyRate && (
              <div className="text-right shrink-0">
                <p className="text-base font-bold text-brand-orange">
                  ₹{Number(provider.hourlyRate).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-muted-foreground">/hour</p>
              </div>
            )}
          </div>

          {/* Rating */}
          <StarRating
            rating={Number(provider.avgRating)}
            count={provider.totalReviews}
          />

          {/* Location */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="truncate">
              {provider.area}, {provider.city}
            </span>
          </div>

          {/* Services */}
          {provider.services && provider.services.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {provider.services.slice(0, 3).map((s) => (
                <Badge
                  key={s.id}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0"
                >
                  {s.icon} {s.name}
                </Badge>
              ))}
              {provider.services.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{provider.services.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="mt-auto pt-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" />
                {provider.totalBookings} jobs
              </span>
              <Button
                size="sm"
                className="ml-auto h-7 text-xs px-3 bg-brand-orange hover:bg-(--brand-orange)/90 text-white"
                asChild
              >
                <span>View Profile</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProviderCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-foreground/10 bg-card">
      <Skeleton className="h-28 w-full rounded-none" />
      <div className="px-4 pt-2 pb-4 space-y-3">
        <Skeleton className="h-10 w-10 rounded-full -mt-5" />
        <Skeleton className="h-4 w-3/5" />
        <Skeleton className="h-3 w-2/5" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-7 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchParams.get("q") ?? "");

  const categoryId = searchParams.get("categoryId") ?? "";
  const sortBy = searchParams.get("sort") ?? "rating";

  // Update a single param without losing others
  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) next.set(key, value);
        else next.delete(key);
        // Reset to page 1 on filter change
        next.delete("page");
        return next;
      });
    },
    [setSearchParams],
  );

  // Build provider query string from current URL params
  const providerQuery = (() => {
    const params = new URLSearchParams();
    const q = searchParams.get("q");
    if (q) params.set("area", q);
    if (categoryId) params.set("categoryId", categoryId);
    if (sortBy && sortBy !== "rating") params.set("sort", sortBy);
    params.set("limit", "18");
    return `/providers?${params.toString()}`;
  })();

  const { data: categories, isLoading: catLoading } = useSWR(
    "/categories",
    fetchCategories,
    { revalidateOnFocus: false },
  );

  const { data: providersResult, isLoading: proLoading } = useSWR(
    providerQuery,
    fetchProviders,
    { revalidateOnFocus: false },
  );

  const providers = providersResult?.data ?? [];
  const totalProviders = providersResult?.total ?? 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", localSearch.trim());
  };

  const clearFilters = () => {
    setSearchParams({});
    setLocalSearch("");
  };

  const hasActiveFilters =
    categoryId || searchParams.get("q") || (sortBy && sortBy !== "rating");

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* ── Search header ─────────────────────────────────────────────────── */}
      <div className="border-b border-border bg-card px-4 py-6">
        <div className="mx-auto max-w-6xl space-y-4">
          <div>
            <h1
              className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              Find a professional near you
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {totalProviders > 0
                ? `${totalProviders} verified professionals in your area`
                : "Browse verified service professionals"}
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="City, area or locality…"
                className="pl-9 h-9"
              />
              {localSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setLocalSearch("");
                    setParam("q", "");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              className="h-9 bg-brand-orange hover:bg-(--brand-orange)/90 text-white"
            >
              Search
            </Button>
          </form>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* ── Category pills ──────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setParam("categoryId", "")}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
              !categoryId
                ? "border-brand-orange bg-brand-orange text-white"
                : "border-border bg-card text-foreground hover:border-(--brand-orange)/50 hover:bg-(--brand-orange)/5",
            )}
          >
            All services
          </button>
          {catLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-24 rounded-full" />
              ))
            : categories?.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setParam("categoryId", cat.id)}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors",
                    categoryId === cat.id
                      ? "border-brand-orange bg-brand-orange text-white"
                      : "border-border bg-card text-foreground hover:border-(--brand-orange)/50 hover:bg-(--brand-orange)/5",
                  )}
                >
                  {cat.icon && <span>{cat.icon}</span>}
                  {cat.name}
                </button>
              ))}
        </div>

        {/* ── Toolbar: count + sort + clear ───────────────────────────────── */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {proLoading ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <>
                {providers.length} result{providers.length !== 1 ? "s" : ""}
              </>
            )}
          </p>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
                Clear filters
              </Button>
            )}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-muted-foreground" />
              <Select
                value={sortBy}
                onValueChange={(v) => setParam("sort", v === "rating" ? "" : v)}
              >
                <SelectTrigger size="sm" className="h-8 w-auto gap-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Top rated</SelectItem>
                  <SelectItem value="price_asc">Price: Low to high</SelectItem>
                  <SelectItem value="price_desc">Price: High to low</SelectItem>
                  <SelectItem value="bookings">Most booked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* ── Provider grid ───────────────────────────────────────────────── */}
        {proLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <ProviderCardSkeleton key={i} />
            ))}
          </div>
        ) : providers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-20 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <p
              className="text-xl font-semibold text-foreground"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              No professionals found
            </p>
            <p className="mt-2 text-sm text-muted-foreground max-w-xs">
              Try broadening your search — remove filters or search for a
              different area.
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear all filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {providers.map((provider) => (
              <ProviderCard key={provider.id} provider={provider} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
