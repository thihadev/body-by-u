"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  BedDouble,
  CheckCircle2,
  ChevronRight,
  Clock,
  Dumbbell,
  Flag,
  ListOrdered,
  Lock,
  Play,
  Timer,
} from "lucide-react";
import { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import {
  useCompleteDay,
  useMyPrograms,
  useProgram,
  useProgramDay,
  useRecordProgress,
  useStartProgram,
  useVideoPlayback,
} from "@/hooks/use-api";
import { useAuthStore } from "@/stores/auth-store";
import { formatDuration, resolvePlaybackUrl, titleOf } from "@/lib/utils";
import type { DayExerciseItem } from "@/lib/types";

function prescription(item: DayExerciseItem): string {
  const parts: string[] = [];
  if (item.sets && item.reps) parts.push(`${item.sets} × ${item.reps}`);
  else if (item.sets) parts.push(`${item.sets} sets`);
  else if (item.reps) parts.push(`× ${item.reps}`);
  if (item.duration_seconds) parts.push(formatDuration(item.duration_seconds));
  return parts.join(" · ") || "Follow coach guidance";
}

function estimateMinutes(items: DayExerciseItem[]): number {
  const secs = items.reduce(
    (sum, it) =>
      sum + (it.duration_seconds ?? 150) + (it.rest_seconds ?? 60),
    0,
  );
  return Math.max(1, Math.round(secs / 60));
}

function RestTimer({
  seconds,
  nextName,
  onSkip,
  onDone,
}: {
  seconds: number;
  nextName?: string;
  onSkip: () => void;
  onDone: () => void;
}) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) {
          clearInterval(t);
          onDone();
          return 0;
        }
        return v - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const m = Math.floor(left / 60);
  const s = left % 60;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-brand-400/30 bg-[#0a0f1e]/95 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-400/15">
          <Timer className="h-5 w-5 text-brand-300" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-lg leading-none font-extrabold text-white tabular-nums">
            {m}:{String(s).padStart(2, "0")}
          </p>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            Rest{nextName ? ` · next: ${nextName}` : ""}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={onSkip}>
          Skip rest
        </Button>
      </div>
    </div>
  );
}

export default function ProgramDayPage() {
  const { slug, dayId } = useParams<{ slug: string; dayId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: program } = useProgram(slug);
  const myPrograms = useMyPrograms();
  // Server-computed workout: ordered exercises + per-item locks.
  const dayQuery = useProgramDay(program?.id ?? null, dayId);
  const record = useRecordProgress();
  const completeDay = useCompleteDay();
  const startProgram = useStartProgram();

  const [done, setDone] = useState<number[]>([]);
  const [dayDone, setDayDone] = useState(false);
  const [finishingWorkout, setFinishingWorkout] = useState(false);
  const [confirmStartOpen, setConfirmStartOpen] = useState(false);
  const [rest, setRest] = useState<{ seconds: number; next?: string } | null>(
    null,
  );
  const [restKey, setRestKey] = useState(0);
  // Inline demo player: selecting an exercise swaps the video in place,
  // no page navigation.
  const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);

  const detail = dayQuery.data;
  const meta = program?.days?.find((d) => String(d.id) === dayId);
  const dayNumber =
    detail?.day_number ?? meta?.day_number ?? meta?.sort_order ?? 1;
  const dayTitle = detail?.title || meta?.title || `Day ${dayNumber}`;
  const exercises = detail?.exercises ?? [];
  const isRestDay = detail?.is_rest_day ?? meta?.is_rest_day ?? false;
  const isEnrolled =
    !!program &&
    (myPrograms.data ?? []).some(
      (userProgram) => userProgram.program?.id === program.id,
    );

  const playable = exercises.filter((it) => !it.is_locked && it.video_id);
  // Default to the first playable demo until the user picks another.
  const activeVideoId =
    (selectedVideoId &&
      playable.some((it) => it.video_id === selectedVideoId) &&
      selectedVideoId) ||
    playable[0]?.video_id ||
    null;
  const activeItem = playable.find((it) => it.video_id === activeVideoId);
  const playback = useVideoPlayback(activeVideoId);
  const playerUrl = resolvePlaybackUrl(playback.data ?? undefined);

  const playDemo = (videoId: number) => {
    setSelectedVideoId(videoId);
    requestAnimationFrame(() => {
      document
        .getElementById("day-player")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  };

  const toggle = async (item: DayExerciseItem, nextItem?: DayExerciseItem) => {
    const next = done.includes(item.id)
      ? done.filter((id) => id !== item.id)
      : [...done, item.id];
    setDone(next);
    if (!next.includes(item.id) || !isEnrolled) return;
    try {
      await record.mutateAsync({
        programId: program?.id ?? 0,
        payload: {
          program_day_id: Number(dayId),
          program_day_exercise_id: item.id,
        },
      });
    } catch {
      // offline-friendly: local state still updates
    }
    // Roll into rest, then cue the next movement.
    // restKey remounts the timer so each set starts fresh.
    setRestKey((k) => k + 1);
    setRest({
      seconds: item.rest_seconds ?? 60,
      next: nextItem?.exercise?.name ?? nextItem?.variant?.name,
    });
  };

  const markDayComplete = async () => {
    if (!program || finishingWorkout) return;

    setFinishingWorkout(true);
    try {
      const enrollmentQuery = await myPrograms.refetch();
      if (enrollmentQuery.isError) {
        toast.error("Couldn’t check your program enrollment. Please try again.");
        return;
      }

      const hasEnrollment = (enrollmentQuery.data ?? []).some(
        (userProgram) => userProgram.program?.id === program.id,
      );

      if (!hasEnrollment) {
        setConfirmStartOpen(true);
        return;
      }

      await completeDay.mutateAsync({
        programId: program?.id ?? 0,
        program_day_id: Number(dayId),
      });
      setDayDone(true);
    } catch {
      // Mutation errors are reported by the global toast handler.
    } finally {
      setFinishingWorkout(false);
    }
  };

  const confirmStartAndFinish = async () => {
    if (!program) return;

    setFinishingWorkout(true);
    try {
      await startProgram.mutateAsync(program.id);
      await completeDay.mutateAsync({
        programId: program.id,
        program_day_id: Number(dayId),
      });
      setConfirmStartOpen(false);
      setDayDone(true);
    } catch {
      // Mutation errors are reported by the global toast handler.
    } finally {
      setFinishingWorkout(false);
    }
  };

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Lock className="mx-auto h-8 w-8 text-zinc-600" />
        <h1 className="mt-3 text-2xl font-bold text-white">
          Log in to start this workout
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Day-by-day workouts need an account so we can track your progress.
        </p>
        <Button className="mt-6" onClick={() => router.push("/login")}>
          Log in
        </Button>
      </div>
    );
  }

  if (!program && !detail) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-sm text-zinc-500">Loading workout…</p>
      </div>
    );
  }

  if (dayQuery.isError || (!dayQuery.isLoading && !detail && !meta)) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <Link href={`/programs/${slug}`} className="text-sm text-brand-300">
          ← Back to program
        </Link>
        <p className="mt-4 text-zinc-400">
          Couldn&apos;t load this day. It may be locked or unpublished.
        </p>
      </div>
    );
  }

  const progress =
    exercises.length === 0
      ? 0
      : Math.round((done.length / exercises.length) * 100);
  const finished = progress === 100 || dayDone;

  return (
    <>
      <ConfirmDialog
        open={confirmStartOpen}
        pending={finishingWorkout || startProgram.isPending}
        title={`Start ${program ? titleOf(program) : "this program"}?`}
        description="Starting this program will save your progress. Finish this workout now?"
        confirmLabel="Start & finish workout"
        onOpenChange={setConfirmStartOpen}
        onConfirm={confirmStartAndFinish}
      />
      <div className="mx-auto max-w-4xl px-4 py-12 pb-28">
      <Link
        href={`/programs/${slug}`}
        className="text-sm text-zinc-500 hover:text-brand-300"
      >
        ← {program ? titleOf(program) : "Program"}
      </Link>

      {/* Workout header */}
      <p className="mt-4 text-xs font-bold tracking-[0.2em] text-brand-400 uppercase">
        Day {dayNumber}
      </p>
      <h1 className="mt-1 text-3xl font-extrabold text-white">{dayTitle}</h1>
      {(detail?.description || meta?.description) && (
        <p className="mt-2 max-w-2xl text-zinc-400">
          {detail?.description ?? meta?.description}
        </p>
      )}
      {!isRestDay && exercises.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-zinc-300">
            <ListOrdered className="h-3.5 w-3.5" /> {exercises.length} exercises
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 px-3 py-1.5 text-zinc-300">
            <Clock className="h-3.5 w-3.5" /> ~{estimateMinutes(exercises)} min
          </span>
        </div>
      )}

      {/* Inline demo player — stays on this page */}
      {!isRestDay && (
        <div id="day-player" className="mt-6 scroll-mt-20">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
            {playback.isLoading ? (
              <div className="flex aspect-video items-center justify-center text-sm text-zinc-500">
                Loading demo…
              </div>
            ) : playerUrl ? (
              <div className="aspect-video">
                <ReactPlayer
                  key={playerUrl}
                  src={playerUrl}
                  controls
                  width="100%"
                  height="100%"
                  onStart={() => {
                    if (activeVideoId) {
                      api.post(`/videos/${activeVideoId}/view`).catch(() => {});
                    }
                  }}
                />
              </div>
            ) : (
              <div className="flex aspect-video flex-col items-center justify-center gap-2 px-6 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
                  <Play className="h-5 w-5 text-zinc-500" />
                </span>
                <p className="text-sm font-semibold text-zinc-300">
                  {playable.length === 0
                    ? "No video demos for this day yet"
                    : "Pick an exercise below to preview its demo"}
                </p>
                <p className="text-xs text-zinc-600">
                  Tap the play button on any unlocked exercise.
                </p>
              </div>
            )}
          </div>
          {activeItem && (
            <p className="mt-2 text-sm text-zinc-400">
              Now showing ·{" "}
              <span className="font-semibold text-white">
                {activeItem.exercise?.name ?? activeItem.variant?.name}
              </span>
            </p>
          )}
        </div>
      )}

      {/* Progress */}
      {!isRestDay && exercises.length > 0 && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between text-xs text-zinc-500">
            <span>
              {done.length} of {exercises.length} done
            </span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <div
              className="h-full rounded-full bg-brand-300 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Rest day */}
      {isRestDay && (
        <Card className="mt-6 flex items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-400/15">
            <BedDouble className="h-6 w-6 text-sky-300" />
          </span>
          <div>
            <p className="font-bold text-white">Recovery day</p>
            <p className="text-sm text-zinc-400">
              Light walk, stretch or full rest — come back stronger tomorrow.
            </p>
          </div>
        </Card>
      )}

      {/* Workout list */}
      {!isRestDay && (
        <ol className="mt-6 space-y-3">
          {exercises.map((item, i) => {
            const checked = done.includes(item.id);
            const ex = item.exercise;
            const isPlaying =
              !!item.video_id && activeVideoId === item.video_id;
            return (
              <li key={item.id}>
                <Card
                  className={`flex items-center gap-3 sm:gap-4 ${checked ? "border-brand-400/50" : ""} ${isPlaying ? "border-brand-400/70 shadow-[0_0_30px_-10px_rgba(110,178,204,0.4)]" : ""} ${item.is_locked ? "opacity-90" : ""}`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold ${
                      checked
                        ? "bg-brand-400 text-zinc-950"
                        : "bg-white/5 text-zinc-300"
                    }`}
                  >
                    {checked ? <CheckCircle2 className="h-5 w-5" /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-white">
                        {ex?.name ?? item.variant?.name ?? `Exercise ${i + 1}`}
                      </p>
                      {item.is_free_preview && (
                        <span className="rounded-full bg-brand-400/15 px-2 py-0.5 text-[10px] font-bold tracking-wide text-brand-300 uppercase">
                          Preview
                        </span>
                      )}
                      {item.is_locked && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[10px] font-bold tracking-wide text-zinc-400 uppercase">
                          <Lock className="h-3 w-3" /> Locked
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm font-semibold text-brand-300">
                      {prescription(item)}
                      {item.rest_seconds ? (
                        <span className="font-normal text-zinc-500">
                          {" "}
                          · {item.rest_seconds}s rest
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-zinc-500">
                      {ex?.primary_muscle_group
                        ? `${ex.primary_muscle_group.name}`
                        : ""}
                      {item.notes ? ` · ${item.notes}` : ""}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-3">
                      {!item.is_locked && item.video_id && (
                        <button
                          onClick={() => playDemo(item.video_id as number)}
                          className="inline-flex cursor-pointer items-center gap-1 text-xs font-semibold text-brand-300 hover:text-brand-200"
                        >
                          <Play className="h-4 w-4" />
                          {isPlaying ? "Playing" : "Watch"}
                        </button>
                      )}
                    </div>
                  </div>
                  {!item.is_locked ? (
                    <button
                      onClick={() =>
                        toggle(item, exercises[i + 1] ?? undefined)
                      }
                      className="shrink-0 cursor-pointer rounded-full p-1"
                      aria-label={checked ? "Mark not done" : "Mark done"}
                    >
                      <CheckCircle2
                        className={
                          checked
                            ? "h-7 w-7 text-brand-400"
                            : "h-7 w-7 text-zinc-600 hover:text-zinc-400"
                        }
                      />
                    </button>
                  ) : (
                    <Lock className="h-5 w-5 shrink-0 text-zinc-600" />
                  )}
                </Card>
              </li>
            );
          })}
        </ol>
      )}

      {dayQuery.isLoading && (
        <p className="mt-6 text-sm text-zinc-500">Loading exercises…</p>
      )}

      {!isRestDay && exercises.length === 0 && !dayQuery.isLoading && (
        <Card className="mt-6">
          <p className="flex items-center gap-2 text-sm text-zinc-400">
            <Dumbbell className="h-4 w-4 text-brand-400" />
            Exercises for this day are being added. Check back soon.
          </p>
        </Card>
      )}

      {/* Finish */}
      {!isRestDay && exercises.length > 0 && !finished && (
        <div className="mt-6">
          <Button
            variant="outline"
            onClick={markDayComplete}
            disabled={
              finishingWorkout ||
              completeDay.isPending ||
              startProgram.isPending
            }
          >
            <Flag className="h-4 w-4" />
            {finishingWorkout ||
            completeDay.isPending ||
            startProgram.isPending
              ? "Saving…"
              : "Finish workout"}
          </Button>
        </div>
      )}

      {(finished || isRestDay) && (
        <div className="mt-6 rounded-2xl border border-brand-400/40 bg-brand-400/10 p-5 text-center">
          <p className="font-bold text-brand-300">
            {isRestDay ? "Enjoy your recovery." : "Workout complete. Nice work!"}
          </p>
          <Link
            href={`/programs/${slug}`}
            className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-white hover:text-brand-300"
          >
            Back to program <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {rest && !finished && (
        <RestTimer
          key={restKey}
          seconds={rest.seconds}
          nextName={rest.next}
          onSkip={() => setRest(null)}
          onDone={() => setRest(null)}
        />
      )}
      </div>
    </>
  );
}
