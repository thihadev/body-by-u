"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  BellOff,
  CheckCheck,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";
import {
  useNotificationStore,
  useUnreadCount,
} from "@/stores/notification-store";
import { MEMBERSHIP_ENABLED } from "@/lib/config";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  ...(MEMBERSHIP_ENABLED
    ? [{ href: "/membership", label: "Membership" }]
    : []),
  { href: "/about", label: "About Us" },
];

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

export function MobileNav({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const hydrated = useHasHydrated();
  const [showNotifs, setShowNotifs] = useState(false);
  const unread = useUnreadCount();
  const { notifications, markRead, markAllRead } = useNotificationStore();

  if (!open) return null;

  return (
    <div className="border-t border-white/10 bg-zinc-950 px-4 pt-2 pb-6 md:hidden">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          onClick={onClose}
          className={cn(
            "block rounded-xl px-4 py-3 text-sm font-medium text-zinc-300 hover:bg-white/5",
            pathname === l.href && "bg-white/10 text-white",
          )}
        >
          {l.label}
        </Link>
      ))}
      <div className="mt-3 border-t border-white/10 pt-4">
        {!hydrated ? (
          <div className="h-10 animate-pulse rounded-full bg-white/10" />
        ) : user ? (
          <>
            <div className="flex items-center gap-3 px-2 pb-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-lime-400/20">
                <User className="h-4.5 w-4.5 text-lime-300" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {user.name}
                </p>
                <p className="truncate text-xs text-zinc-500">{user.email}</p>
              </div>
            </div>
            <Link
              href="/dashboard"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              <LayoutDashboard className="h-4 w-4 text-zinc-500" />
              Dashboard
            </Link>
            <Link
              href="/dashboard?tab=settings"
              onClick={onClose}
              className="flex items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              <User className="h-4 w-4 text-zinc-500" />
              Profile
            </Link>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-zinc-300 hover:bg-white/5"
            >
              <Bell className="h-4 w-4 text-zinc-500" />
              Notifications
              {unread > 0 && (
                <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-400 px-1.5 text-[10px] font-bold text-zinc-950">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </button>
            {showNotifs && (
              <div className="mt-1 mb-2 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-zinc-900/60">
                {notifications.length === 0 ? (
                  <p className="flex items-center justify-center gap-2 px-4 py-6 text-xs text-zinc-500">
                    <BellOff className="h-3.5 w-3.5" /> No notifications yet
                  </p>
                ) : (
                  <>
                    {notifications.slice(0, 10).map((n) => (
                      <button
                        key={n.id}
                        onClick={() => {
                          markRead(n.id);
                          onClose();
                          if (n.href) router.push(n.href);
                        }}
                        className={cn(
                          "block w-full cursor-pointer border-b border-white/5 px-3 py-2.5 text-left last:border-0 hover:bg-white/5",
                          !n.read && "bg-lime-400/[0.04]",
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {!n.read && (
                            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-lime-400" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p
                              className={cn(
                                "truncate text-xs",
                                n.read
                                  ? "font-medium text-zinc-300"
                                  : "font-bold text-white",
                              )}
                            >
                              {n.title}
                            </p>
                            {n.body && (
                              <p className="mt-0.5 line-clamp-2 text-[11px] text-zinc-400">
                                {n.body}
                              </p>
                            )}
                            <p className="mt-0.5 text-[10px] text-zinc-600">
                              {timeAgo(n.created_at)}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                    {unread > 0 && (
                      <button
                        onClick={markAllRead}
                        className="flex w-full cursor-pointer items-center justify-center gap-1.5 border-t border-white/10 py-2 text-[11px] font-semibold text-lime-300"
                      >
                        <CheckCheck className="h-3 w-3" /> Mark all read
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
            <button
              onClick={() => {
                logout();
                onClose();
                router.push("/");
              }}
              className="mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm text-zinc-300 hover:bg-red-500/10 hover:text-red-300"
            >
              <LogOut className="h-4 w-4 text-zinc-500" />
              Logout
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <Link
              href="/login"
              onClick={onClose}
              className="flex-1 rounded-full border border-white/10 px-4 py-2.5 text-center text-sm font-medium text-zinc-200"
            >
              Log in
            </Link>
            <Link
              href="/register"
              onClick={onClose}
              className="flex-1 rounded-full bg-lime-400 px-4 py-2.5 text-center text-sm font-bold text-zinc-950"
            >
              Join now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
