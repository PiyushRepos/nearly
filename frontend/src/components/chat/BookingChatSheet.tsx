import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { io, Socket } from "socket.io-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import type { Message, Booking } from "@/types";
import { useAuth } from "@/context/AuthContext";

const SOCKET_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3000";

let globalSocket: Socket | null = null;
function getSocket() {
  if (!globalSocket) {
    globalSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });
  }
  return globalSocket;
}

async function fetchMessages(url: string): Promise<Message[]> {
  const res = await api.get<{ data: Message[] }>(url);
  return res.data.data;
}

export function BookingChatSheet({ booking }: { booking: Booking }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messages, mutate } = useSWR(
    open ? `/messages/${booking.id}` : null,
    fetchMessages,
    { revalidateOnFocus: false },
  );

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Connect socket when opened
  useEffect(() => {
    if (!open) return;

    const socket = getSocket();
    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("joinBooking", booking.id);

    const onNewMessage = (msg: Message) => {
      mutate((prev) => {
        if (!prev) return [msg];
        if (prev.find((m) => m.id === msg.id)) return prev;

        // Replace optimistic temp message if it matches
        const tempIdx = prev.findIndex(
          (m) => String(m.id).startsWith("temp-") && m.content === msg.content,
        );
        if (tempIdx !== -1) {
          const next = [...prev];
          next[tempIdx] = msg;
          return next;
        }

        return [...prev, msg];
      }, false);
    };

    socket.on("newMessage", onNewMessage);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.emit("leaveBooking", booking.id);
    };
  }, [open, booking.id, mutate]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || sending) return;

    const text = content.trim();
    setContent("");

    // Optimistic update
    const tempId = `temp-${Date.now()}`;
    const tempMsg: Message = {
      id: tempId,
      bookingId: booking.id,
      senderId: user!.id,
      content: text,
      isRead: true,
      createdAt: new Date().toISOString(),
    };

    mutate((prev) => [...(prev ?? []), tempMsg], false);

    try {
      setSending(true);
      await api.post(`/messages/${booking.id}`, { content: text });
      // We don't need to manually re-fetch, the socket will broadcast it back.
      // Alternatively, the POST itself returns the true message, but socket is fine.
    } catch (err) {
      console.error(err);
      setContent(text); // restore
      // Rollback optimistic update on error
      mutate((prev) => prev?.filter((m) => m.id !== tempId), false);
    } finally {
      setSending(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MessageCircle className="size-4 text-brand-orange" />
          Chat
        </Button>
      </SheetTrigger>

      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full bg-card">
        <SheetHeader className="p-4 border-b shrink-0 flex flex-row items-center justify-between border-border bg-muted/20">
          <div>
            <SheetTitle
              className="text-lg flex items-center gap-2"
              style={{ fontFamily: "Fraunces, serif" }}
            >
              <MessageCircle className="size-5 text-brand-orange" />
              Messages
            </SheetTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Booking #{booking.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </SheetHeader>

        <div
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/10 flex flex-col"
          ref={scrollRef}
        >
          {!messages ? (
            <div className="flex-1 flex flex-col justify-end space-y-3 pb-2">
              <Skeleton className="h-10 w-2/3 self-start rounded-2xl rounded-bl-sm" />
              <Skeleton className="h-12 w-3/4 self-end rounded-2xl rounded-br-sm" />
              <Skeleton className="h-10 w-1/2 self-start rounded-2xl rounded-bl-sm" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3">
              <div className="size-16 rounded-full bg-brand-orange/10 flex items-center justify-center">
                <MessageCircle className="size-8 text-brand-orange/60" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  No messages yet
                </p>
                <p className="text-xs text-muted-foreground max-w-50 mt-1">
                  Start the conversation to discuss details about the service.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg, i) => {
              const isMe = msg.senderId === user?.id;
              const showTime =
                i === messages.length - 1 ||
                messages[i + 1].senderId !== msg.senderId ||
                format(new Date(msg.createdAt), "h:mm a") !==
                  format(new Date(messages[i + 1].createdAt), "h:mm a");

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col gap-1 w-full max-w-[85%]",
                    isMe && "self-end items-end",
                  )}
                >
                  <div
                    className={cn(
                      "px-4 py-2 text-sm shadow-sm",
                      isMe
                        ? "bg-brand-orange text-brand-cream rounded-2xl rounded-tr-sm"
                        : "bg-white border text-foreground rounded-2xl rounded-tl-sm",
                    )}
                  >
                    {msg.content}
                  </div>
                  {showTime && (
                    <span className="text-[10px] text-muted-foreground px-1">
                      {format(new Date(msg.createdAt), "h:mm a")}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="p-3 border-t border-border bg-card shrink-0">
          <form onSubmit={handleSend} className="flex items-center gap-2">
            <Input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 rounded-full h-10 px-4 bg-muted/50 focus-visible:ring-brand-orange"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!content.trim() || sending}
              className="rounded-full h-10 w-10 shrink-0 bg-brand-orange text-white hover:bg-(--brand-orange)/90"
            >
              {sending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4 ml-0.5" />
              )}
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
}
