"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SectionTitle } from "@/components/ui";
import { ProgramCard } from "@/components/cards";
import { usePrograms } from "@/hooks/use-api";
import { thumbOf, titleOf } from "@/lib/utils";

function MoreLink({ href, children }: { href: string; children: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-lime-300 hover:text-lime-200"
    >
      {children} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function FeaturedPrograms() {
  const { data, isLoading } = usePrograms();
  const featured = (data ?? []).slice(0, 3);

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <SectionTitle eyebrow="Programs" title="Start with a proven plan" />
        <span className="hidden shrink-0 pb-1 sm:block">
          <MoreLink href="/programs">View all programs</MoreLink>
        </span>
      </div>
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-2xl bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => {
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
                    ? `${p.duration_weeks}-week plan`
                    : undefined
                }
                priceLabel={p.access_type === "free" ? "Free" : "Premium"}
              />
            );
          })}
          {featured.length === 0 && (
            <p className="text-sm text-zinc-500 sm:col-span-2 lg:col-span-3">
              No programs yet — check back soon.
            </p>
          )}
        </div>
      )}
      <div className="mt-5 sm:hidden">
        <MoreLink href="/programs">View all programs</MoreLink>
      </div>
    </section>
  );
}
