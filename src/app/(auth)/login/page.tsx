"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { useLogin } from "@/hooks/use-api";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const [form, setForm] = useState({ email: "", password: "" });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login.mutateAsync(form);
      router.push("/dashboard");
    } catch {
      // Mutation errors are reported by the global toast handler.
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-3xl font-extrabold text-white">Welcome back</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Log in to continue your training.
      </p>
      <Card className="mt-6">
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
            />
          </div>
          <Button className="w-full" disabled={login.isPending}>
            {login.isPending ? "Logging in…" : "Log in"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-zinc-400">
        No account?{" "}
        <Link href="/register" className="font-semibold text-lime-300">
          Join now
        </Link>
      </p>
    </div>
  );
}
