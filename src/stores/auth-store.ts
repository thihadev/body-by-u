"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/types";

interface AuthState {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (user, token) => {
        if (typeof window !== "undefined")
          localStorage.setItem("bbu_token", token);
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== "undefined")
          localStorage.removeItem("bbu_token");
        set({ user: null, token: null });
      },
      setUser: (user) => set({ user }),
    }),
    { name: "bbu-auth" },
  ),
);

/**
 * Returns true once the persisted auth state has been rehydrated from
 * localStorage. Use this to avoid treating a fresh page load as logged-out:
 * on refresh the store starts as `user: null` until hydration completes.
 */
export function useHasHydrated() {
  return useSyncExternalStore(
    (onChange) => useAuthStore.persist.onFinishHydration(onChange),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );
}
