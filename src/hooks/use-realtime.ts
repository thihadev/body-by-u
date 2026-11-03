"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getEcho } from "@/lib/echo";
import { useAuthStore } from "@/stores/auth-store";

export interface TransactionApprovedEvent {
  transaction_id: number;
  plan_name?: string;
  status?: string;
  message?: string;
}

/**
 * Subscribes to the private `user.{id}` channel for `transaction.approved`
 * broadcasts. On approval it refreshes the subscription + payments so premium
 * access unlocks instantly without a page reload.
 */
export function useTransactionApprovedRealtime() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const qc = useQueryClient();
  const [event, setEvent] = useState<TransactionApprovedEvent | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    const echo = getEcho(token);
    if (!echo) return; // Reverb not configured — silent no-op.

    const channel = echo.private(`user.${user.id}`);
    channel.listen(
      ".transaction.approved",
      (payload: TransactionApprovedEvent) => {
        setEvent(payload);
        // Refresh the subscription + payment history; program locks derive
        // from the active subscription.
        qc.invalidateQueries({ queryKey: ["my-transactions"] });
        qc.invalidateQueries({ queryKey: ["my-subscriptions"] });
        qc.invalidateQueries({ queryKey: ["my-programs"] });
      },
    );

    return () => {
      echo.leave(`user.${user.id}`);
    };
  }, [user, token, qc]);

  return event;
}
