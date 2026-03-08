import { useState } from "react";
import useSWR from "swr";
import { Search, Users, ShieldCheck, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getAvatarPlaceholder } from "@/lib/utils";
import type { User, ListResponse } from "@/types";
import { api } from "@/lib/api";

async function fetchUsers(url: string): Promise<ListResponse<User>> {
  const res = await api.get<ListResponse<User>>(url);
  return res.data;
}

const TABS = [
  { value: "all", label: "All", icon: Users },
  { value: "customer", label: "Customers", icon: Users },
  { value: "provider", label: "Providers", icon: Wrench },
  { value: "admin", label: "Admins", icon: ShieldCheck },
] as const;

const ROLE_BADGE: Record<string, string> = {
  customer: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  provider: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  admin: "bg-(--brand-orange)/10 text-brand-orange",
};

function UserRow({ user }: { user: User }) {
  const initials =
    user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?";

  return (
    <Card className="py-0">
      <CardContent className="flex items-center gap-3 px-4 py-3.5">
        <Avatar className="size-10 shrink-0">
          <AvatarImage src={user.image ?? getAvatarPlaceholder(user.name)} />
          <AvatarFallback className="text-xs bg-(--brand-orange)/10 text-brand-orange font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-foreground truncate">
              {user.name}
            </p>
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${ROLE_BADGE[user.role] ?? ""}`}
            >
              {user.role}
            </span>
            {user.emailVerified && (
              <ShieldCheck className="size-3.5 text-emerald-500 shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>

        <div className="shrink-0 text-right hidden sm:block">
          <p className="text-xs text-muted-foreground">
            {new Date(user.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          {user.phone && (
            <p className="text-xs text-muted-foreground mt-0.5">{user.phone}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UserList({ tab, search }: { tab: string; search: string }) {
  const url = tab === "all" ? "/admin/users" : `/admin/users?role=${tab}`;
  const { data, isLoading } = useSWR(url, fetchUsers, {
    refreshInterval: 30_000,
  });

  const users = (data?.data ?? []).filter(
    (u) =>
      !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="space-y-2.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 rounded-xl" />
        ))}
      </div>
    );

  if (users.length === 0)
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <Users className="size-8 text-muted-foreground/40 mb-3" />
        <p className="text-sm font-semibold text-foreground">No users found</p>
        <p className="text-xs text-muted-foreground mt-1">
          {search
            ? "Try a different search."
            : "No users in this category yet."}
        </p>
      </div>
    );

  return (
    <div className="space-y-2.5">
      {users.map((u) => (
        <UserRow key={u.id} user={u} />
      ))}
    </div>
  );
}

export default function AdminUsersPage() {
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
            Users
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            All registered users across every role
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="pl-9 h-9"
        />
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList variant="line" className="mb-5 gap-0.5 p-0 h-auto">
          {TABS.map((t) => (
            <TabsTrigger
              key={t.value}
              value={t.value}
              className="rounded-full px-4 py-1.5 h-auto text-sm after:hidden data-[state=active]:bg-(--brand-orange)/10 data-[state=active]:text-brand-orange data-[state=active]:shadow-none"
            >
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((t) => (
          <TabsContent key={t.value} value={t.value}>
            <UserList tab={t.value} search={search} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
