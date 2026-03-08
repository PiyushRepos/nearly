import useSWR from "swr";
import { useState } from "react";
import { Link } from "react-router";
import { BellOff, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { Notification } from "@/types";
import { api } from "@/lib/api";

interface NotifResponse {
  data: Notification[];
  unreadCount: number;
}

async function fetchNotifications(): Promise<NotifResponse> {
  const res = await api.get<NotifResponse>("/notifications");
  return res.data;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [markingAll, setMarkingAll] = useState(false);
  const { data, isLoading, mutate } = useSWR(
    "/notifications",
    fetchNotifications,
    { refreshInterval: 15_000 },
  );

  const notifications = data?.data ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const markOne = async (notif: Notification) => {
    if (notif.isRead) return;
    // Optimistic update
    mutate(
      (prev) =>
        prev
          ? {
              ...prev,
              unreadCount: Math.max(0, prev.unreadCount - 1),
              data: prev.data.map((n) =>
                n.id === notif.id ? { ...n, isRead: true } : n,
              ),
            }
          : prev,
      false,
    );
    await api.patch(`/notifications/${notif.id}/read`);
  };

  const markAll = async () => {
    setMarkingAll(true);
    try {
      await api.patch("/notifications/read-all");
      mutate();
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-semibold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            Notifications
          </h1>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 shrink-0"
            onClick={markAll}
            disabled={markingAll}
          >
            {markingAll ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
          <BellOff className="size-10 text-muted-foreground/30 mb-3" />
          <p
            className="text-base font-semibold text-foreground"
            style={{ fontFamily: "Fraunces, serif" }}
          >
            All quiet here
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            You have no notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {notifications.map((notif) => {
            const inner = (
              <div
                className={cn(
                  "flex items-start gap-3 rounded-xl px-4 py-3.5 transition-colors",
                  notif.isRead
                    ? "bg-card ring-1 ring-foreground/10"
                    : "bg-(--brand-orange)/5 ring-1 ring-(--brand-orange)/20",
                )}
              >
                {/* Unread dot */}
                <div className="mt-1.5 shrink-0">
                  <div
                    className={cn(
                      "size-2 rounded-full",
                      notif.isRead ? "bg-transparent" : "bg-brand-orange",
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm leading-snug",
                      notif.isRead
                        ? "font-normal text-foreground"
                        : "font-semibold text-foreground",
                    )}
                  >
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {notif.body}
                  </p>
                </div>

                <time className="text-[11px] text-muted-foreground shrink-0 mt-0.5">
                  {timeAgo(notif.createdAt)}
                </time>
              </div>
            );

            if (notif.link) {
              return (
                <Link
                  key={notif.id}
                  to={notif.link}
                  className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                  onClick={() => markOne(notif)}
                >
                  {inner}
                </Link>
              );
            }

            return (
              <button
                key={notif.id}
                className="block w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-xl"
                onClick={() => markOne(notif)}
              >
                {inner}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
