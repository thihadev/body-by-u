"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, toList, unwrap } from "@/lib/api";
import { mockPrograms, mockTrainers } from "@/lib/mock-data";
import type {
  PaymentMethod,
  Program,
  ProgramDayDetail,
  Subscription,
  SubscriptionPlan,
  Trainer,
  Transaction,
  User,
  UserProgram,
} from "@/lib/types";
import { useAuthStore } from "@/stores/auth-store";
import { MEMBERSHIP_ENABLED } from "@/lib/config";

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback;
  }
}

// Hide premium programs whenever membership is temporarily closed.
const visiblePrograms = (list: Program[]): Program[] =>
  MEMBERSHIP_ENABLED
    ? list
    : list.filter((p) => p.access_type !== "premium");

// ---------- Programs ----------
export function usePrograms(params?: Record<string, string>) {
  return useQuery({
    queryKey: ["programs", params],
    queryFn: () =>
      safe(async () => {
        const { data } = await api.get("/programs", { params });
        const list = toList<Program>(data);
        const visible = visiblePrograms(list);
        return visible.length ? visible : visiblePrograms(mockPrograms);
      }, visiblePrograms(mockPrograms)),
  });
}

export function useProgram(slug: string, initialProgram?: Program) {
  return useQuery({
    queryKey: ["program", slug],
    initialData: initialProgram,
    queryFn: () =>
      safe(async () => {
        const { data } = await api.get(`/programs/${slug}`);
        return unwrap<Program>(data);
      }, mockPrograms.find((p) => p.slug === slug) ?? mockPrograms[0]),
    enabled: !!slug,
  });
}

// ---------- Trainers ----------
export function useTrainers() {
  return useQuery({
    queryKey: ["trainers"],
    queryFn: () =>
      safe(async () => {
        const { data } = await api.get("/trainers");
        const list = toList<Trainer>(data);
        return list.length ? list : mockTrainers;
      }, mockTrainers),
  });
}

export function useTrainer(slug: string) {
  return useQuery({
    queryKey: ["trainer", slug],
    queryFn: () =>
      safe(async () => {
        const { data } = await api.get(`/trainers/${slug}`);
        return unwrap<Trainer>(data);
      }, mockTrainers.find((t) => t.slug === slug) ?? mockTrainers[0]),
    enabled: !!slug,
  });
}

// ---------- Auth ----------
export function useLogin() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      const { data } = await api.post<{
        user: User;
        token: string;
      }>("/auth/login", payload);
      return data;
    },
    meta: { successMessage: "Welcome back!" },
    onSuccess: (data) => login(data.user, data.token),
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: async (payload: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
    }) => {
      const { data } = await api.post<{
        user: User;
        token: string;
      }>("/auth/register", payload);
      return data;
    },
    meta: { successMessage: "Your account has been created." },
    onSuccess: (data) => login(data.user, data.token),
  });
}

export function useUpdateProfile() {
  const setUser = useAuthStore((s) => s.setUser);
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await api.patch<{ user: User }>("/auth/user", payload);
      return data.user;
    },
    meta: { successMessage: "Profile updated successfully." },
    onSuccess: (user) => setUser(user),
  });
}

// ---------- My programs / transactions ----------
export function useMyPrograms() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["my-programs"],
    queryFn: async () => {
      const { data } = await api.get("/my/programs");
      // Backend returns a paginator of UserProgram (each with nested `program`)
      const list = toList<UserProgram>(data);
      // Tolerate APIs that return programs directly
      return list as UserProgram[];
    },
    enabled: !!token,
    retry: 1,
  });
}

export function useMyTransactions() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["my-transactions"],
    queryFn: async () => {
      const { data } = await api.get("/my/transactions");
      // Backend returns a paginator of Transaction (with nested `plan`)
      return toList<Transaction>(data);
    },
    enabled: !!token,
    retry: 1,
  });
}

export interface CreateTransactionPayload {
  subscription_plan_id: number;
  payment_method: string;
  payment_reference?: string;
  payer_name?: string;
  payer_phone?: string;
  amount: number;
}

/** Step 1 of manual checkout: record the payment for the chosen plan. */
export function useCreateTransaction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateTransactionPayload) => {
      const { data } = await api.post<Transaction>("/transactions", payload);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-transactions"] }),
  });
}

/** Step 2 of manual checkout: attach the transfer screenshot. */
export function useUploadTransactionScreenshot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { transactionId: number; file: File }) => {
      const fd = new FormData();
      fd.append("screenshot", args.file);
      const { data } = await api.post<Transaction>(
        `/transactions/${args.transactionId}/screenshot`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return data;
    },
    meta: {
      successMessage: "Payment submitted successfully. We'll review it soon.",
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-transactions"] }),
  });
}

// ---------- Subscriptions / membership ----------
/** The user's single subscription (one-to-one), or null when never subscribed. */
export function useMySubscription() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["my-subscriptions"],
    queryFn: async () => {
      const { data } = await api.get("/my/subscriptions");
      return unwrap<Subscription | null>(data);
    },
    enabled: !!token,
    retry: 1,
  });
}

/** The user's currently active subscription, if any. */
export function useActiveSubscription() {
  const query = useMySubscription();
  const sub = query.data ?? null;
  const active =
    sub &&
    (sub.status === "active" || sub.status === "trialing") &&
    (!sub.ends_at || new Date(sub.ends_at) > new Date())
      ? sub
      : null;
  return { ...query, activeSubscription: active };
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data } = await api.get("/subscription-plans");
      return toList<SubscriptionPlan>(data);
    },
    retry: 1,
  });
}

/** Active, admin-managed payment methods (with QR images) for manual checkout. */
export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const { data } = await api.get("/payment-methods");
      return toList<PaymentMethod>(data);
    },
    retry: 1,
  });
}

/**
 * Day workout detail: ordered exercises with prescription + per-item locks.
 * Needs a logged-in viewer (server computes locks); disabled otherwise.
 */
export function useProgramDay(programId: number | null, dayId: string | null) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["program-day", programId, dayId],
    queryFn: async () => {
      const { data } = await api.get(`/programs/${programId}/days/${dayId}`);
      return unwrap<ProgramDayDetail>(data);
    },
    enabled: !!token && !!programId && !!dayId,
    retry: 1,
  });
}

export function useStartProgram() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (programId: number) => {
      const { data } = await api.post(`/my/programs/${programId}/start`);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-programs"] }),
  });
}

export interface RecordProgressPayload {
  program_day_id: number;
  program_day_exercise_id: number;
  duration_seconds?: number;
  notes?: string;
}

export function useRecordProgress() {
  return useMutation({
    mutationFn: async (args: {
      programId: number;
      payload: RecordProgressPayload;
    }) => {
      const { data } = await api.post(
        `/my/programs/${args.programId}/progress`,
        args.payload,
      );
      return data;
    },
    meta: { toastError: false },
  });
}

export function useCompleteDay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { programId: number; program_day_id: number }) => {
      const { data } = await api.post(
        `/my/programs/${args.programId}/complete-day`,
        { program_day_id: args.program_day_id },
      );
      return data;
    },
    meta: { successMessage: "Workout completed. Great work!" },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-programs"] }),
  });
}

export interface VideoPlayback {
  playback_url: string | null;
  has_access?: boolean;
  provider?: string | null;
  provider_video_id?: string | null;
}

export function useVideoPlayback(videoId: number | null) {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: ["video-playback", videoId],
    queryFn: async () => {
      const { data } = await api.get(`/videos/${videoId}/playback`);
      // Backend returns { data: { playback_url, has_access, provider, ... } }
      return unwrap<VideoPlayback>(data);
    },
    enabled: !!token && !!videoId,
    retry: false,
  });
}
