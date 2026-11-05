import { Crown, Lock, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccessType } from "@/lib/types";

export function AccessBadge({
  accessType,
  locked = false,
  className,
}: {
  accessType: AccessType;
  locked?: boolean;
  className?: string;
}) {
  if (locked) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2.5 py-1 text-[11px] font-bold tracking-wide text-zinc-300",
          className,
        )}
      >
        <Lock className="h-3 w-3" /> LOCKED
      </span>
    );
  }
  if (accessType === "free") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-full bg-brand-400/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-brand-300",
          className,
        )}
      >
        <Sparkles className="h-3 w-3" /> FREE
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold tracking-wide text-amber-300",
        className,
      )}
    >
      <Crown className="h-3 w-3" /> PREMIUM
    </span>
  );
}
