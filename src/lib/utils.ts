import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(
  amount: number | string | undefined | null,
  currency = "MMK",
): string {
  if (amount === undefined || amount === null || amount === "") return "--";
  const n = typeof amount === "string" ? parseFloat(amount) : amount;
  if (Number.isNaN(n)) return `${amount} ${currency}`;
  try {
    return new Intl.NumberFormat("en-US").format(n) + ` ${currency}`;
  } catch {
    return `${n} ${currency}`;
  }
}

/** Backend exposes `thumbnail`; mocks use `thumbnail_url`. */
export function thumbOf(item: {
  thumbnail?: string;
  thumbnail_url?: string;
}): string | undefined {
  return item.thumbnail ?? item.thumbnail_url;
}

/** Backend Program model column is `name`; API exposes `title`. */
export function titleOf(item: { title?: string; name?: string }): string {
  return item.title ?? item.name ?? "Untitled";
}

function youTubeId(input: string): string | null {
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?youtu\.be\/([\w-]{11})/,
    ) ??
    s.match(
      /^(?:https?:\/\/)?(?:www\.|m\.)?youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/,
    ) ??
    s.match(/[?&]v=([\w-]{11})/);
  return m ? m[1] : null;
}

/**
 * Resolve a playable URL from a playback response. Prefers the signed
 * `playback_url`; falls back to building a YouTube watch URL so demos
 * keep working even if the backend only stored a video ID/URL.
 */
export function resolvePlaybackUrl(item?: {
  playback_url?: string | null;
  provider?: string | null;
  provider_video_id?: string | null;
}): string | null {
  const signed = item?.playback_url?.trim();
  if (signed) return signed;
  const raw = item?.provider_video_id?.trim();
  if (!raw) return null;
  if (/^https?:\/\//.test(raw)) {
    const yt = youTubeId(raw);
    if (yt) return `https://www.youtube.com/watch?v=${yt}`;
    return raw;
  }
  if (item?.provider === "youtube") {
    const yt = youTubeId(raw);
    if (yt) return `https://www.youtube.com/watch?v=${yt}`;
  }
  return null;
}

export function formatDuration(totalSeconds?: number): string {
  if (!totalSeconds) return "--:--";
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
