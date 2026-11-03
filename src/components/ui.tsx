import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-colors disabled:opacity-50 disabled:pointer-events-none cursor-pointer",
        size === "sm" && "h-9 px-4 text-sm",
        size === "md" && "h-11 px-6 text-sm",
        size === "lg" && "h-13 px-8 text-base py-3.5",
        variant === "primary" &&
          "bg-gradient-to-br from-[#bef264] to-[#84cc16] text-[#0a0f1e] hover:brightness-110",
        variant === "secondary" && "bg-zinc-900 text-white hover:bg-zinc-700",
        variant === "outline" &&
          "border border-zinc-700 text-zinc-100 hover:border-lime-400 hover:text-lime-300",
        variant === "ghost" && "text-zinc-300 hover:text-white hover:bg-white/5",
        variant === "danger" && "bg-red-500 text-white hover:bg-red-400",
        className,
      )}
      {...props}
    />
  );
}

export function Card({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-zinc-900/60 p-5",
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-white/10 bg-zinc-900 px-4 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-lime-400",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "mb-1.5 block text-xs font-semibold tracking-wider text-zinc-400 uppercase",
        className,
      )}
      {...props}
    />
  );
}

/** Centered loading animation for a page/content body while data is fetching. */
export function LoadingState({
  label = "Loading…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20 text-center",
        className,
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-lime-300" />
      <p className="text-sm text-zinc-400">{label}</p>
    </div>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  sub,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-bold tracking-[0.2em] text-lime-400 uppercase">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
        {title}
      </h2>
      {sub && <p className="mt-2 max-w-2xl text-sm text-zinc-400">{sub}</p>}
    </div>
  );
}
