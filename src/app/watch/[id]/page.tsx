"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import ReactPlayer from "react-player";
import { Lock } from "lucide-react";
import { api } from "@/lib/api";
import { resolvePlaybackUrl } from "@/lib/utils";
import { MEMBERSHIP_ENABLED } from "@/lib/config";
import { Button, Card } from "@/components/ui";
import { useVideoPlayback } from "@/hooks/use-api";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";

export default function WatchPage() {
  const { id } = useParams<{ id: string }>();
  const videoId = Number(id);
  const user = useAuthStore((s) => s.user);
  const hydrated = useHasHydrated();
  const playback = useVideoPlayback(Number.isNaN(videoId) ? null : videoId);
  const playerUrl = resolvePlaybackUrl(playback.data ?? undefined);

  // Record a view once playback loads
  useEffect(() => {
    if (playback.data && videoId) {
      api.post(`/videos/${videoId}/view`).catch(() => {});
    }
  }, [playback.data, videoId]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <p className="text-sm text-zinc-500">Loading video…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <Lock className="mx-auto h-8 w-8 text-zinc-600" />
        <h1 className="mt-3 text-2xl font-bold text-white">Log in to watch</h1>
        <p className="mt-2 text-sm text-zinc-400">
          {MEMBERSHIP_ENABLED
            ? "Video playback requires an account with an active membership."
            : "Video playback requires an account. Premium membership is coming soon."}
        </p>
        <Link href="/login">
          <Button className="mt-6">Log in</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/dashboard" className="text-sm text-zinc-500 hover:text-brand-300">
        ← Dashboard
      </Link>
      <h1 className="mt-2 text-2xl font-extrabold text-white">
        Video #{id}
      </h1>

      <Card className="mt-4 overflow-hidden p-0">
        {playback.isLoading ? (
          <div className="flex aspect-video items-center justify-center bg-black text-sm text-zinc-500">
            Loading secure playback…
          </div>
        ) : playerUrl ? (
          <div className="aspect-video bg-black">
            <ReactPlayer
              key={playerUrl}
              src={playerUrl}
              controls
              width="100%"
              height="100%"
            />
          </div>
        ) : (
          <div className="px-6 py-14 text-center">
            <Lock className="mx-auto h-8 w-8 text-zinc-600" />
            <p className="mt-3 font-bold text-white">No access yet</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-zinc-400">
              {playback.isError
                ? MEMBERSHIP_ENABLED
                  ? "This video needs an active membership (or the signed URL expired). Subscribe to unlock premium programs."
                  : "This video is part of our premium content — membership is coming soon."
                : "Playback URL unavailable."}
            </p>
            <Link href="/programs">
              <Button className="mt-5" variant="outline">
                Browse programs
              </Button>
            </Link>
          </div>
        )}
      </Card>
      <p className="mt-3 text-xs text-zinc-600">
        Views are recorded for analytics. Signed URLs expire quickly and must
        not be shared.
      </p>
    </div>
  );
}
