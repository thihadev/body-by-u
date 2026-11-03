"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteToken, getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging, getVapidKey } from "@/lib/firebase";
import { api } from "@/lib/api";
import { useAuthStore } from "@/stores/auth-store";

export interface PushMessage {
  title: string;
  body?: string;
  url?: string;
}

type PermissionState = "default" | "granted" | "denied" | "unsupported";

const STORAGE_KEY = "bbu_push_enabled";

async function registerPushServiceWorker(): Promise<ServiceWorkerRegistration> {
  if (!("serviceWorker" in navigator)) {
    throw new Error("Service workers are not supported in this browser.");
  }
  return navigator.serviceWorker.register("/firebase-messaging-sw.js");
}

export function usePushNotifications() {
  const token = useAuthStore((s) => s.token);
  const [permission, setPermission] = useState<PermissionState>(() => {
    if (typeof window === "undefined" || !("Notification" in window))
      return "unsupported";
    return Notification.permission as PermissionState;
  });
  const [enabled, setEnabled] = useState(() => {
    try {
      return (
        typeof window !== "undefined" &&
        localStorage.getItem(STORAGE_KEY) === "1"
      );
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastMessage, setLastMessage] = useState<PushMessage | null>(null);

  // Foreground messages (app open)
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    (async () => {
      if (!enabled) return;
      const messaging = await getFirebaseMessaging();
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        setLastMessage({
          title:
            payload.notification?.title ??
            (payload.data?.title as string) ??
            "Body By U",
          body:
            payload.notification?.body ?? (payload.data?.body as string) ?? "",
          url: (payload.data?.url as string) ?? "/dashboard",
        });
      });
    })();
    return () => unsubscribe?.();
  }, [enabled]);

  const enable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (!("Notification" in window)) {
        setPermission("unsupported");
        throw new Error("This browser doesn't support notifications.");
      }
      const result = await Notification.requestPermission();
      setPermission(result as PermissionState);
      if (result !== "granted") {
        throw new Error(
          result === "denied"
            ? "Notifications are blocked. Allow them in your browser settings."
            : "Permission was dismissed.",
        );
      }
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        throw new Error(
          "Push is not configured yet (missing Firebase env vars).",
        );
      }
      const registration = await registerPushServiceWorker();
      const fcmToken = await getToken(messaging, {
        vapidKey: getVapidKey(),
        serviceWorkerRegistration: registration,
      });
      if (!fcmToken) throw new Error("Could not get a push token.");

      // Persist token server-side for later campaigns (best-effort).
      if (token) {
        await api
          .post("/my/fcm-token", {
            token: fcmToken,
            device_name:
              typeof navigator !== "undefined" ? navigator.userAgent : "web",
            platform: "web",
          })
          .catch(() => {});
      }
      try {
        localStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setEnabled(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not enable notifications.",
      );
    } finally {
      setLoading(false);
    }
  }, [token]);

  const disable = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const messaging = await getFirebaseMessaging();
      if (messaging) {
        await deleteToken(messaging).catch(() => {});
        if (token) {
          await api.delete("/my/fcm-token").catch(() => {});
        }
      }
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        /* ignore */
      }
      setEnabled(false);
    } finally {
      setLoading(false);
    }
  }, [token]);

  return { permission, enabled, loading, error, lastMessage, enable, disable };
}
