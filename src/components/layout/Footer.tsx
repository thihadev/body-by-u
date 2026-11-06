import Link from "next/link";
import { Dumbbell } from "lucide-react";
import { GuestOnly } from "@/components/GuestOnly";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-zinc-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400">
              <Dumbbell className="h-5 w-5 text-zinc-950" />
            </span>
            <span className="text-lg font-extrabold text-white">
              Body<span className="text-brand-400">By</span>U
            </span>
          </div>
          <p className="mt-3 max-w-sm text-sm text-zinc-400">
            Myanmar&apos;s home-grown fitness platform. Follow guided programs,
            learn proper form, and train anywhere — gym or home.
          </p>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Explore
          </p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link href="/programs" className="hover:text-brand-300">Programs</Link></li>
            <li><Link href="/about" className="hover:text-brand-300">About Us</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-3 text-xs font-bold tracking-widest text-zinc-500 uppercase">
            Account
          </p>
          <ul className="space-y-2 text-sm text-zinc-400">
            <GuestOnly>
            <li><Link href="/login" className="hover:text-brand-300">Log in</Link></li>
              <li><Link href="/register" className="hover:text-brand-300">Join now</Link></li>
            </GuestOnly>
            <li><Link href="/dashboard" className="hover:text-brand-300">My dashboard</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-zinc-600">
        © 2026 Body By U. All rights reserved.
      </div>
    </footer>
  );
}
