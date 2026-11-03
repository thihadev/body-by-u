import axios from "axios";

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  withCredentials: false,
});

// Attach Sanctum bearer token from localStorage (client-side only)
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("bbu_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("bbu_token");
    }
    return Promise.reject(err);
  },
);

export async function fetcher<T>(url: string): Promise<T> {
  const { data } = await api.get<T>(url);
  return data;
}

/**
 * Unwrap a Laravel JsonResource response.
 * Single resources arrive as `{ data: {...} }`; plain models arrive raw.
 */
export function unwrap<T>(payload: T | { data: T }): T {
  if (
    payload !== null &&
    typeof payload === "object" &&
    !Array.isArray(payload) &&
    "data" in payload
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

/**
 * Normalize a list response to an array.
 * Accepts a raw array, a paginator/collection `{ data: [...] }`,
 * or anything else (returns []).
 */
export function toList<T>(payload: unknown): T[] {
  const unwrapped = unwrap<T[] | unknown>(payload as T[] | { data: T[] });
  return Array.isArray(unwrapped) ? (unwrapped as T[]) : [];
}
