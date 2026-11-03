"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Card, Input, Label } from "@/components/ui";
import { useRegister } from "@/hooks/use-api";

export default function RegisterPage() {
  const router = useRouter();
  const register = useRegister();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register.mutateAsync(form);
      router.push("/dashboard");
    } catch {
      // surfaced via error state
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
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
            />
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
          {register.isError && (
            <p className="text-sm text-red-400">
              Registration failed. The email may already be taken.
            </p>
          )}
          <Button className="w-full" disabled={register.isPending}>
            {register.isPending ? "Creating account…" : "Create account"}
          </Button>
        </form>
      </Card>
      <p className="mt-4 text-center text-sm text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-lime-300">
          Log in
        </Link>
      </p>
    </div>
  );
}
