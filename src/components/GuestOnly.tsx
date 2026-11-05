"use client";

import type { ReactNode } from "react";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";

export function GuestOnly({ children }: { children: ReactNode }) {
  const user = useAuthStore((state) => state.user);
  const hydrated = useHasHydrated();

  if (!hydrated || user) return null;

  return children;
}
