"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useNotificationStore, useUnreadCount } from "@/stores/notification-store";

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function NotificationsBell({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const router = useRouter();
  const unread = useUnreadCount();
  const { notifications, markRead, markAllRead, clear } = useNotificationStore();
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current &&
        !panelRef.current.contains(target) &&
        bellRef.current &&
        !bellRef.current.contains(target)
      ) {
        onToggle();
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open, onToggle]);

  const handleItemClick = (id: string, href?: string) => {
    markRead(id);
    onToggle();
    if (href) router.push(href);
  };

  return (
    <div className="relative">
      <button
        ref={bellRef}
        onClick={onToggle}
        aria-label="Notifications"
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-zinc-300 transition-colors hover:bg-white/5"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-400 px-1 text-[10px] font-bold text-zinc-950">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-bold text-white">Notifications</p>
            {notifications.length > 0 && (
              <div className="flex gap-2">
                <button
                  onClick={markAllRead}
                  className="cursor-pointer text-xs text-zinc-400 hover:text-brand-300"
                  title="Mark all read"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={clear}
                  className="cursor-pointer text-xs text-zinc-400 hover:text-red-300"
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">
                No notifications yet
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleItemClick(n.id, n.href)}
                  className={cn(
                    "block w-full cursor-pointer border-b border-white/5 px-4 py-3 text-left transition-colors last:border-0 hover:bg-white/5",
                    !n.read && "bg-brand-400/[0.04]",
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.read && (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-400" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          "truncate text-sm",
                          n.read
                            ? "font-medium text-zinc-300"
                            : "font-bold text-white",
                        )}
                      >
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-zinc-400">
                          {n.body}
                        </p>
                      )}
                      <p className="mt-1 text-[11px] text-zinc-600">
                        {timeAgo(n.created_at)}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
          {notifications.length > 0 && (
            <Link
              href="/dashboard?tab=payments"
              onClick={onToggle}
              className="block border-t border-white/10 px-4 py-2.5 text-center text-xs font-semibold text-brand-300 hover:text-brand-200"
            >
              View all in dashboard
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
