"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronRight, Lock, Play } from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { Button, Card } from "@/components/ui";
import { Cover } from "@/components/cards";
import { useProgram, useStartProgram, useActiveSubscription } from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { thumbOf, titleOf } from "@/lib/utils";
import { MEMBERSHIP_ENABLED } from "@/lib/config";

export default function ProgramDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { data: program, isLoading } = useProgram(slug);
  const { user } = useAuthStore();
  const { activeSubscription } = useActiveSubscription();
  const start = useStartProgram();

  if (isLoading || !program) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-sm text-zinc-500">Loading program…</p>
      </div>
    );
  }

  const title = titleOf(program);
  const unlocked = program.access_type === "free" || !!activeSubscription;

  const handleStart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (!unlocked) {
      router.push("/membership");
      return;
    }
    try {
      await start.mutateAsync(program.id);
      router.push(`/programs/${program.slug}/days/${program.days?.[0]?.id ?? ""}`);
    } catch {
      router.push(`/programs/${program.slug}/days/${program.days?.[0]?.id ?? ""}`);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/programs" className="text-sm text-zinc-500 hover:text-lime-300">
        ← All programs
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <Cover
          id={program.id}
          image={thumbOf(program)}
          title={title}
          badge={<AccessBadge accessType={program.access_type} locked={!unlocked} />}
          foot={
            program.duration_weeks ? (
              <span className="rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-zinc-200 backdrop-blur">
                {program.duration_weeks}-week plan
              </span>
            ) : undefined
          }
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {program.trainer && (
          <span className="text-sm text-zinc-400">
            by {program.trainer.name}
          </span>
        )}
      </div>
      <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-zinc-400">{program.description}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {unlocked ? (
          <Button onClick={handleStart} disabled={start.isPending}>
            <Play className="h-4 w-4" /> Start program
          </Button>
        ) : MEMBERSHIP_ENABLED ? (
          <Button onClick={handleStart} disabled={start.isPending}>
            <Lock className="h-4 w-4" /> Unlock with membership
          </Button>
        ) : null}
        {unlocked
          ? null
          : MEMBERSHIP_ENABLED && (
              <span className="text-xs text-zinc-500">
                Included with a premium membership — KB Pay / Wave Pay,
                screenshot upload.
              </span>
            )}
        {!unlocked && !MEMBERSHIP_ENABLED && (
          <span className="rounded-full bg-lime-400/10 px-4 py-1.5 text-xs font-semibold text-lime-300">
            Premium program — membership coming soon
          </span>
        )}
      </div>

      <h2 className="mt-10 mb-4 text-xl font-bold text-white">Training days</h2>
      <div className="space-y-3">
        {(program.days ?? []).map((d, i) => {
          const dayNo = d.day_number ?? i + 1;
          const count = d.exercises_count ?? d.exercises?.length ?? 0;
          return (
            <Card key={d.id} className="flex items-center gap-4">
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                  d.is_rest_day
                    ? "bg-sky-400/15 text-sky-300"
                    : "bg-lime-400/15 text-lime-300"
                }`}
              >
                {String(dayNo).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold text-white">
                  {d.title || `Day ${dayNo}`}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {d.is_rest_day
                    ? "Recovery day"
                    : count > 0
                      ? `${count} exercise${count === 1 ? "" : "s"}`
                      : (d.description ?? "Workout day")}
                </p>
              </div>
            {unlocked ? (
              <Link href={`/programs/${program.slug}/days/${d.id}`}>
                <Button size="sm" variant="outline">
                  {d.is_rest_day ? "View" : "Start"} <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <Lock className="h-5 w-5 shrink-0 text-zinc-600" />
            )}
          </Card>
          );
        })}
        {(!program.days || program.days.length === 0) && (
          <p className="text-sm text-zinc-500">
            Day breakdown will appear here once published.
          </p>
        )}
      </div>
    </div>
  );
}
