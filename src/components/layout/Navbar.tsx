"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Bell,
  ChevronDown,
  Dumbbell,
  LayoutDashboard,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";
import { MEMBERSHIP_ENABLED } from "@/lib/config";
import { MobileNav } from "./MobileNav";
import { NotificationsBell } from "@/components/NotificationsBell";

const links = [
  { href: "/", label: "Home" },
  { href: "/programs", label: "Programs" },
  ...(MEMBERSHIP_ENABLED
    ? [{ href: "/membership", label: "Membership" }]
    : []),
  { href: "/about", label: "About Us" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const hydrated = useHasHydrated();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard?tab=settings", label: "Profile", icon: User },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-zinc-950/90 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400">
            <Dumbbell className="h-5 w-5 text-zinc-950" />
          </span>
          <span className="text-lg font-extrabold tracking-tight text-white">
            Body<span className="text-brand-400">By</span>U
          </span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium text-zinc-400 transition-colors hover:bg-white/5 hover:text-white",
                pathname === l.href && "bg-white/10 text-white",
              )}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {!hydrated ? (
            <div className="h-9 w-32 animate-pulse rounded-full bg-white/10" />
          ) : user ? (
            <>
              <NotificationsBell
                open={notifOpen}
                onToggle={() => {
                  setNotifOpen(!notifOpen);
                  setMenuOpen(false);
                }}
              />
              <div ref={menuRef} className="relative">
                <button
                  onClick={() => {
                    setMenuOpen(!menuOpen);
                    setNotifOpen(false);
                  }}
                  className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 py-1.5 pr-3 pl-1.5 text-sm text-zinc-300 transition-colors hover:bg-white/5"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-400/20">
                    <User className="h-4 w-4 text-brand-300" />
                  </span>
                  <span className="max-w-24 truncate">{user.name}</span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-zinc-500 transition-transform",
                      menuOpen && "rotate-180",
                    )}
                  />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-zinc-900 shadow-2xl shadow-black/40">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {user.email}
                      </p>
                    </div>
                    <div className="py-1">
                      {menuItems.map((item) => (
                        <Link
                          key={item.label}
                          href={item.href}
                          onClick={() => setMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                        >
                          <item.icon className="h-4 w-4 text-zinc-500" />
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setNotifOpen(true);
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <Bell className="h-4 w-4 text-zinc-500" />
                        Notifications
                      </button>
                    </div>
                    <div className="border-t border-white/10 py-1">
                      <button
                        onClick={() => {
                          logout();
                          setMenuOpen(false);
                          router.push("/");
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 transition-colors hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="h-4 w-4 text-zinc-500" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-brand-400 px-5 py-2 text-sm font-bold text-zinc-950 transition-colors hover:brightness-110"
              >
                Join now
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-zinc-300 hover:bg-white/5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>
      <MobileNav open={open} onClose={() => setOpen(false)} />
    </header>
  );
}
