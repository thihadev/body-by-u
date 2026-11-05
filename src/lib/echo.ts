"use client";

import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { apiBaseURL } from "@/lib/api";

// Reverb speaks the Pusher protocol over websockets.
if (typeof window !== "undefined") {
  (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
}

let echo: Echo<"reverb"> | null = null;
let echoToken: string | null = null;

export function getEcho(authToken: string | null): Echo<"reverb"> | null {
  if (typeof window === "undefined") return null;
  if (!authToken) return null;

  const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY;
  if (!key) {
    console.error(
      "Realtime notifications are disabled. Configure NEXT_PUBLIC_REVERB_APP_KEY and the matching NEXT_PUBLIC_REVERB_HOST, PORT, and SCHEME.",
    );
    return null;
  }

  if (echo && echoToken === authToken) return echo;
  if (echo) {
    echo.disconnect();
    echo = null;
  }

  echoToken = authToken;
  echo = new Echo({
    broadcaster: "reverb",
    key,
    wsHost: process.env.NEXT_PUBLIC_REVERB_HOST ?? "localhost",
    wsPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    wssPort: Number(process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080),
    forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? "http") === "https",
    enabledTransports: ["ws", "wss"],
    authEndpoint: `${apiBaseURL}/broadcasting/auth`,
    auth: { headers: { Authorization: `Bearer ${authToken}` } },
  });

  return echo;
}

export function disconnectEcho() {
  echo?.disconnect();
  echo = null;
}
