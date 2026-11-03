"use client";

import Link from "next/link";
import { Dumbbell, Users, type LucideIcon } from "lucide-react";
import { useState, type ReactNode } from "react";
import { AccessBadge } from "@/components/AccessBadge";
import { cn } from "@/lib/utils";
import type { AccessType } from "@/lib/types";

/* Deterministic cover art — calm dark gradients with a soft color glow.
 * Keeps the UI lively even when the backend has no thumbnail uploaded yet. */
const GLOWS = [
  "rgba(163,230,53,0.28)", // lime
  "rgba(52,211,153,0.26)", // emerald
  "rgba(34,211,238,0.24)", // cyan
  "rgba(251,191,36,0.24)", // amber
  "rgba(167,139,250,0.24)", // violet
  "rgba(251,113,133,0.22)", // rose
];

function glowFor(id: number): string {
  return GLOWS[Math.abs(id) % GLOWS.length];
}

export function Cover({
  id,
  image,
  title,
  icon: Icon = Dumbbell,
  badge,
  foot,
  className,
}: {
  id: number;
  image?: string;
  title: string;
  icon?: LucideIcon;
  badge?: ReactNode;
  foot?: ReactNode;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const glow = glowFor(id);

  return (
    <div
      className={cn("relative aspect-[16/9] overflow-hidden", className)}
      style={{
        background: `radial-gradient(120% 120% at 80% 10%, ${glow}, transparent 60%), linear-gradient(135deg, #16213a 0%, #0a0f1e 70%)`,
      }}
    >
      {/* subtle dot texture */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.14) 1px, transparent 1px)",
          backgroundSize: "18px 18px",
        }}
      />
      {image && !failed && (
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={() => setFailed(true)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {/* watermark icon */}
      <Icon
        className="absolute -right-4 -bottom-6 h-32 w-32 text-white/[0.07]"
        strokeWidth={1.2}
      />
      {badge && <div className="absolute top-3 left-3">{badge}</div>}
      {foot && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          {foot}
        </div>
      )}
    </div>
  );
}

function CardShell({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 transition-all hover:-translate-y-0.5 hover:border-lime-400/40 hover:shadow-[0_12px_40px_-12px_rgba(163,230,53,0.25)]",
        className,
      )}
    >
      {children}
    </Link>
  );
}

export function ProgramCard({
  id,
  href,
  title,
  description,
  image,
  accessType,
  locked,
  trainerName,
  meta,
  priceLabel,
}: {
  id: number;
  href: string;
  title: string;
  description?: string;
  image?: string;
  accessType: AccessType;
  locked?: boolean;
  trainerName?: string;
  meta?: string;
  priceLabel?: string;
}) {
  return (
    <CardShell href={href}>
      <Cover
        id={id}
        image={image}
        title={title}
        badge={<AccessBadge accessType={accessType} locked={locked} />}
        foot={
          meta ? (
            <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur">
              {meta}
            </span>
          ) : undefined
        }
      />
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-bold text-white group-hover:text-lime-300">
          {title}
        </h3>
        {description && (
          <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-zinc-400">
            {description}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-3 text-[13px]">
          <span className="truncate text-zinc-500">{trainerName ?? ""}</span>
          {priceLabel && (
            <span className="shrink-0 font-bold text-lime-300">{priceLabel}</span>
          )}
        </div>
      </div>
    </CardShell>
  );
}

export function TrainerCard({
  id,
  href,
  name,
  bio,
  image,
  tags,
}: {
  id: number;
  href: string;
  name: string;
  bio?: string;
  image?: string;
  tags?: string;
}) {
  return (
    <CardShell href={href}>
      <div className="flex items-center gap-4 p-4">
        <span className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl">
          <span
            className="absolute inset-0"
            style={{
              background: `radial-gradient(120% 120% at 70% 20%, ${glowFor(id + 7)}, transparent 65%), linear-gradient(135deg, #1c2942 0%, #0a0f1e 75%)`,
            }}
          />
          {image ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <Users className="relative h-7 w-7 text-lime-300" />
          )}
        </span>
        <span className="min-w-0">
          <span className="block truncate font-bold text-white group-hover:text-lime-300">
            {name}
          </span>
          {bio && (
            <span className="mt-0.5 line-clamp-2 block text-[13px] text-zinc-400">
              {bio}
            </span>
          )}
          {tags && (
            <span className="mt-1 block truncate text-xs text-zinc-500">
              {tags}
            </span>
          )}
        </span>
      </div>
    </CardShell>
  );
}
