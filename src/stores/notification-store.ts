"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppNotification } from "@/lib/types";

const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  notifications: AppNotification[];
  push: (n: Omit<AppNotification, "id" | "read" | "created_at">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      push: (n) =>
        set((state) => {
          // Dedupe rapid repeats of the same title+body within a minute.
          const now = Date.now();
          const recentDuplicate = state.notifications.some(
            (existing) =>
              existing.title === n.title &&
              existing.body === n.body &&
              now - new Date(existing.created_at).getTime() < 60_000,
          );
          if (recentDuplicate) return state;
          const entry: AppNotification = {
            ...n,
            id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
            read: false,
            created_at: new Date().toISOString(),
          };
          return {
            notifications: [entry, ...state.notifications].slice(
              0,
              MAX_NOTIFICATIONS,
            ),
          };
        }),
      markRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n,
          ),
        })),
      markAllRead: () =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.read ? n : { ...n, read: true },
          ),
        })),
      clear: () => set({ notifications: [] }),
    }),
    { name: "bbu-notifications" },
  ),
);

export function useUnreadCount() {
  return useNotificationStore(
    (s) => s.notifications.filter((n) => !n.read).length,
  );
}
