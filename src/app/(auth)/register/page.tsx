"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Card, Input, Label, LoadingState } from "@/components/ui";
import { useRegister } from "@/hooks/use-api";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const user = useAuthStore((state) => state.user);
  const hydrated = useHasHydrated();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [emailError, setEmailError] = useState("");

  useEffect(() => {
    if (hydrated && user) router.replace("/dashboard");
  }, [hydrated, user, router]);

  if (!hydrated || user) {
    return <LoadingState label="Checking your account…" />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync(form);
      router.push("/dashboard");
    } catch {
      // Mutation errors are reported by the global toast handler.
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Start training free</h1>
      <p className="mt-1 text-sm text-zinc-400">
        One account for programs, videos and progress.
      </p>
      <Card className="mt-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Your name"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              autoComplete="email"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "email-error" : undefined}
              value={form.email}
              onChange={(e) => {
                setForm({ ...form, email: e.target.value });
                setEmailError(
                  e.currentTarget.validity.typeMismatch
                    ? "Enter a valid email address."
                    : "",
                );
              }}
              onBlur={(e) =>
                setEmailError(
                  e.currentTarget.validity.typeMismatch
                    ? "Enter a valid email address."
                    : "",
                )
              }
              placeholder="you@example.com"
            />
            {emailError && (
              <p id="email-error" className="mt-1.5 text-xs text-red-400">
                {emailError}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Min. 8 chars"
              />
            </div>
            <div>
              <Label htmlFor="password_confirmation">Confirm</Label>
              <Input
                id="password_confirmation"
                type="password"
                required
                value={form.password_confirmation}
                onChange={(e) =>
                  setForm({ ...form, password_confirmation: e.target.value })
                }
                placeholder="Repeat"
              />
            </div>
          </div>
          <Button className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
