import { useState } from "react";
import useSWR from "swr";
import {
  CheckCircle2,
  XCircle,
  MapPin,
  Star,
  Loader2,
  Search,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { r, ROUTES } from "@/config/routes";
import type { ProviderProfile, ListResponse } from "@/types";
import { api } from "@/lib/api";
import { getAvatarPlaceholder } from "@/lib/utils";

async function fetchAdminProviders(
  url: string,
): Promise<ListResponse<ProviderProfile>> {
  const res = await api.get<ListResponse<ProviderProfile>>(url);
  return res.data;
}

function ProviderRow({
  provider,
  onAction,
  loading,
}: {
  provider: ProviderProfile;
  onAction: (id: string, action: "approve" | "reject") => void;
  loading: string | null;
}) {
  const initials =
    provider.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 px-4 py-3.5">
        <Avatar className="size-11 shrink-0">
          <AvatarImage
            src={provider.image ?? getAvatarPlaceholder(provider.name ?? "")}
          />
          <AvatarFallback className="bg-(--brand-orange)/10 text-brand-orange font-semibold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p
              className="text-sm font-semibold text-foreground"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              {provider.name ?? "Unknown"}
            </p>
            {provider.isApproved ? (
              <Badge
                variant="outline"
                className="text-[10px] text-emerald-700 border-emerald-200 bg-emerald-50"
              >
                Approved
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-[10px] text-amber-700 border-amber-200 bg-amber-50"
              >
                Pending
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="size-3" />
              {provider.area}, {provider.city}
            </span>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="size-3" />
              {Number(provider.avgRating).toFixed(1)} ({provider.totalReviews}{" "}
              reviews)
            </span>
            {provider.services && provider.services.length > 0 && (
              <div className="flex gap-1">
                {provider.services.slice(0, 2).map((s) => (
                  <Badge
                    key={s.id}
                    variant="outline"
                    className="text-[10px] px-1.5"
                  >
                    {s.icon} {s.name}
                  </Badge>
                ))}
                {provider.services.length > 2 && (
                  <Badge variant="outline" className="text-[10px] px-1.5">
                    +{provider.services.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Button variant="ghost" size="icon-sm" asChild>
            <Link
              to={r(ROUTES.PROVIDER_PROFILE, { id: provider.id })}
              target="_blank"
            >
              <ExternalLink className="size-3.5" />
            </Link>
          </Button>
          {!provider.isApproved && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  className="h-7 text-xs px-2"
                >
                  <XCircle className="size-3.5" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reject provider?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This provider will not appear in search results.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onAction(provider.id, "reject")}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    Reject
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {!provider.isApproved && (
            <Button
              size="sm"
              className="h-7 text-xs px-2.5 bg-brand-orange hover:bg-(--brand-orange)/90 text-white gap-1"
              disabled={loading === provider.id}
              onClick={() => onAction(provider.id, "approve")}
            >
              {loading === provider.id ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="size-3.5" />
              )}
              Approve
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ProviderList({ tab, search }: { tab: string; search: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const query =
    tab === "pending" ? "/admin/providers?status=pending" : "/admin/providers";
  const { data, isLoading, mutate } = useSWR(query, fetchAdminProviders, {
    refreshInterval: 15_000,
  });

  const doAction = async (id: string, action: "approve" | "reject") => {
    setLoading(id);
    try {
      await api.patch(`/admin/providers/${id}/${action}`);
      mutate();
    } finally {
      setLoading(null);
    }
  };

  const providers = (data?.data ?? []).filter(
    (p) =>
      !search ||
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.city?.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );

  if (providers.length === 0)
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <RefreshCw className="size-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">
          No providers here
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {tab === "pending"
            ? "All caught up!"
            : "No providers registered yet."}
        </p>
      </div>
    );

  return (
    <div className="space-y-2.5">
      {providers.map((p) => (
        <ProviderRow
          key={p.id}
          provider={p}
          onAction={doAction}
          loading={loading}
        />
      ))}
    </div>
  );
}

export default function AdminProvidersPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Providers
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Review and approve service professionals
          </p>
        </div>
      </div>
      <div className="relative max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or city…"
          className="pl-9 h-9"
        />
      </div>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-5 gap-0.5 p-0 h-auto">
          <TabsTrigger
            value="all"
            className="rounded-full px-4 py-1.5 h-auto text-sm after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
          >
            All Providers
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className="rounded-full px-4 py-1.5 h-auto text-sm after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none data-active:bg-(--brand-orange)/10 data-active:text-brand-orange"
          >
            Pending Approval
          </TabsTrigger>
        </TabsList>
        <TabsContent value="pending">
          <ProviderList tab="pending" search={search} />
        </TabsContent>
        <TabsContent value="all">
          <ProviderList tab="all" search={search} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
