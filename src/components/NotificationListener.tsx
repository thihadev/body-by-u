
"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";

export function NotificationListener() {
  const userId = useAuthStore((s) => s.user?.id);
  const token = useAuthStore((s) => s.token);
  const push = useNotificationStore((s) => s.push);
  const qc = useQueryClient();

  useEffect(() => {
    if (!userId || !token) return;

    const echo = getEcho(token);
    if (!echo) return;

    const channelName = `user.${userId}`;

    echo
      .private(channelName)
      .listen(".transaction.approved", (payload: {
        transaction_id: number;
        plan_name?: string;
        message?: string;
      }) => {
        const message =
          payload.message ??
          (payload.plan_name
            ? `Your ${payload.plan_name} subscription is now active. Time to train!`
            : "Your subscription is now active.");

        push({
          title: "Payment approved",
          body: message,
          href: "/dashboard?tab=payments",
        });

        toast.success("Payment approved", {
          description: message,
        });

        qc.invalidateQueries({ queryKey: ["my-transactions"] });
        qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
        qc.invalidateQueries({ queryKey: ["my-programs"] });
      });

    return () => {
      echo.leave(channelName);
    };
  }, [userId, token, push, qc]);

  return null;
}
