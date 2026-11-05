"use client";

import { useState } from "react";
import { SectionTitle } from "@/components/ui";
import { ProgramCard } from "@/components/cards";
import { usePrograms } from "@/hooks/use-api";
import { thumbOf, titleOf } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { MEMBERSHIP_ENABLED } from "@/lib/config";

const filters = [
  { value: "all", label: "All" },
  { value: "free", label: "Free" },
  ...(MEMBERSHIP_ENABLED
    ? [{ value: "premium" as const, label: "Premium" }]
    : []),
] as const;

export default function ProgramsPage() {
  const [tab, setTab] = useState<(typeof filters)[number]["value"]>("all");
  const { data, isLoading } = usePrograms(
    tab === "all" ? undefined : { access_type: tab },
  );
  const programs = (data ?? []).filter((p) =>
    tab === "all" ? true : p.access_type === tab,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <SectionTitle
        eyebrow="Programs"
        title="Training programs"
        sub={
          MEMBERSHIP_ENABLED
            ? "Structured multi-week plans with day-by-day workouts."
            : "Free structured multi-week plans with day-by-day workouts — premium membership opening soon."
        }
      />
      {MEMBERSHIP_ENABLED && (
        <div className="mb-6 flex gap-2">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setTab(f.value)}
              className={cn(
                "cursor-pointer rounded-full px-4 py-2 text-sm font-medium",
                tab === f.value
                  ? "bg-brand-400 text-zinc-950"
                  : "border border-white/10 text-zinc-400 hover:text-white",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      {isLoading ? (
        <p className="text-sm text-zinc-500">Loading programs…</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((p) => {
            return (
              <ProgramCard
                key={p.id}
                id={p.id}
                href={`/programs/${p.slug}`}
                title={titleOf(p)}
                description={p.description}
                image={thumbOf(p)}
                accessType={p.access_type}
                trainerName={p.trainer ? `by ${p.trainer.name}` : undefined}
                meta={
                  p.duration_weeks
                    ? `${p.duration_weeks} weeks${p.days_count ? ` · ${p.days_count} days` : ""}`
                    : undefined
                }
                priceLabel={p.access_type === "free" ? "Free" : "Premium"}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
