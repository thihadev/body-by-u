"use client";

import { Bell, BellOff, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button, Card } from "@/components/ui";
import { isFirebaseConfigured } from "@/lib/firebase";
import { usePushNotifications } from "@/hooks/use-push";

export function PushSettingsCard() {
  const { permission, enabled, loading, error, lastMessage, enable, disable } =
    usePushNotifications();

  return (
    <Card>
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/15">
          <Bell className="h-5 w-5 text-lime-300" />
        </span>
        <div>
          <h2 className="font-bold text-white">Push notifications</h2>
          <p className="text-xs text-zinc-500">
            Get notified when your payment is approved.
          </p>
        </div>
      </div>

      {lastMessage && (
        <Link
          href={lastMessage.url ?? "/dashboard"}
          className="mt-3 block rounded-xl border border-lime-400/30 bg-lime-400/10 p-3"
        >
          <p className="text-sm font-bold text-white">{lastMessage.title}</p>
          {lastMessage.body && (
            <p className="text-xs text-zinc-400">{lastMessage.body}</p>
          )}
        </Link>
      )}

      {!isFirebaseConfigured() ? (
        <p className="mt-3 rounded-xl bg-white/5 p-3 text-xs text-zinc-500">
          Push is not configured on this build (missing Firebase keys). Ask the
          admin to set <code>NEXT_PUBLIC_FIREBASE_*</code> and{" "}
          <code>NEXT_PUBLIC_FCM_VAPID_KEY</code>.
        </p>
      ) : permission === "denied" ? (
        <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-xs text-red-300">
          Notifications are blocked in your browser. Allow them in site settings
          to receive approval alerts.
        </p>
      ) : (
        <div className="mt-3 flex items-center gap-2">
          {enabled ? (
            <Button
              size="sm"
              variant="outline"
              onClick={disable}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Turn off
            </Button>
          ) : (
            <Button size="sm" onClick={enable} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              Turn on notifications
            </Button>
          )}
          {enabled && (
            <span className="text-xs font-semibold text-lime-300">
              Enabled on this device
            </span>
          )}
        </div>
      )}

      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </Card>
  );
}
