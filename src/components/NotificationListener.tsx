"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

/**
 * App-wide listener for realtime transaction-approved events. Lives in
 * Providers so notifications arrive no matter which page is open. Also
 * refreshes the subscription + payments on approval.
 */
export function NotificationListener() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const push = useNotificationStore((s) => s.push);
  const qc = useQueryClient();

  useEffect(() => {
    if (!user || !token) return;
    const echo = getEcho(token);
    if (!echo) return; // Reverb not configured — silent no-op.

    const channel = echo.private(`user.${user.id}`);
    channel.listen(
      ".transaction.approved",
      (payload: {
        transaction_id: number;
        plan_name?: string;
        message?: string;
      }) => {
        push({
          title: "Payment approved",
          body:
            payload.message ??
            (payload.plan_name
              ? `Your ${payload.plan_name} subscription is now active. Time to train!`
              : "Your subscription is now active."),
          href: "/dashboard?tab=payments",
        });
        qc.invalidateQueries({ queryKey: ["my-transactions"] });
        qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
        qc.invalidateQueries({ queryKey: ["my-programs"] });
      },
    );

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user, token, push, qc]);

  return null;
}
