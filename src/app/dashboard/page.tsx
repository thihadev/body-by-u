"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { CalendarClock, Crown, Package, Play, Settings } from "lucide-react";
import { AccessBadge } from "@/components/AccessBadge";
import { Button, Card, Input, Label, LoadingState } from "@/components/ui";
import {
  useActiveSubscription,
  useMyPrograms,
  useMyTransactions,
  useUpdateProfile,
} from "@/hooks/use-api";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";
import { formatPrice, titleOf } from "@/lib/utils";
import { MEMBERSHIP_ENABLED } from "@/lib/config";

const tabs = [
  { value: "overview", label: "Overview", icon: Play },
  { value: "programs", label: "My Programs", icon: Play },
  { value: "payments", label: "Payments", icon: Package },
  { value: "settings", label: "Settings", icon: Settings },
] as const;

type TabValue = (typeof tabs)[number]["value"];

function isTabValue(v: string | null): v is TabValue {
  return tabs.some((t) => t.value === v);
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hydrated = useHasHydrated();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useUpdateProfile();
  const tabParam = searchParams.get("tab");
  // URL is the single source of truth for the active tab.
  const tab: TabValue = isTabValue(tabParam) ? tabParam : "overview";
  const myPrograms = useMyPrograms();
  const myTransactions = useMyTransactions();
  const { activeSubscription } = useActiveSubscription();
  const payments = myTransactions.data ?? [];

  const setTab = (value: TabValue) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "overview") params.delete("tab");
    else params.set("tab", value);
    const qs = params.toString();
    router.replace(qs ? `/dashboard?${qs}` : "/dashboard", { scroll: false });
  };

  useEffect(() => {
    // Only redirect after persist has rehydrated — otherwise a page refresh
    // (where user is briefly null) would kick a logged-in user to /login.
    if (hydrated && !user) router.replace("/login");
  }, [hydrated, user, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-sm text-zinc-500">Loading your dashboard…</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <p className="text-sm text-zinc-500">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
        Hey, {user.name}
      </h1>
      <p className="mt-1 text-sm text-zinc-400">{user.email}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium sm:px-4 ${
              tab === t.value
                ? "bg-lime-400 text-zinc-950"
                : "border border-white/10 text-zinc-400 hover:text-white"
            }`}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <Card>
            <p className="text-xs tracking-widest text-zinc-500 uppercase">
              Active programs
            </p>
            <p className="mt-1 text-3xl font-extrabold text-white">
              {myPrograms.data?.length ?? 0}
            </p>
          </Card>
          <Card className="border-amber-400/30 sm:col-span-2 md:col-span-1">
            <p className="flex items-center gap-1.5 text-xs tracking-widest text-amber-300 uppercase">
              <Crown className="h-3.5 w-3.5" /> Membership
            </p>
            {activeSubscription ? (
              <>
                <p className="mt-1 text-lg font-bold text-white">
                  {activeSubscription.plan?.name ?? "Premium plan"}
                </p>
                <p className="mt-1 text-sm text-zinc-400">
                  {activeSubscription.plan
                    ? `${formatPrice(
                        activeSubscription.plan.amount,
                        activeSubscription.plan.currency,
                      )} / ${activeSubscription.plan.interval}`
                    : ""}
                </p>
                {activeSubscription.ends_at && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-400">
                    <CalendarClock className="h-3.5 w-3.5 text-amber-300" />
                    Expires{" "}
                    {new Date(activeSubscription.ends_at).toLocaleDateString()}
                  </p>
                )}
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-lime-400/15 px-3 py-1 text-xs font-bold text-lime-300">
                  Active — renews after expiry
                </p>
              </>
            ) : MEMBERSHIP_ENABLED ? (
              <>
                <p className="mt-1 text-lg font-bold text-white">Free plan</p>
                <Link href="/membership">
                  <Button size="sm" className="mt-3">
                    Upgrade
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <p className="mt-1 text-lg font-bold text-white">Free plan</p>
                <p className="mt-2 text-xs text-zinc-500">
                  Membership is coming soon.
                </p>
              </>
            )}
          </Card>
        </div>
      )}

      {tab === "programs" && (
        <div className="mt-6 space-y-3">
          {myPrograms.isLoading && <LoadingState label="Loading your programs…" />}
          {myPrograms.isError && (
            <Card>
              <p className="text-sm text-red-400">
                Couldn&apos;t load your programs. Check your connection and try
                again.
              </p>
            </Card>
          )}
          {(myPrograms.data ?? []).map((up) => (
            <Card
              key={up.id}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <AccessBadge accessType={up.program.access_type} />
                  <span
                    className={`rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase ${
                      up.status === "active"
                        ? "bg-lime-400/15 text-lime-300"
                        : up.status === "completed"
                          ? "bg-sky-400/15 text-sky-300"
                          : "bg-white/10 text-zinc-400"
                    }`}
                  >
                    {up.status.replace("_", " ")}
                  </span>
                </div>
                <p className="mt-1 font-bold text-white">
                  {titleOf(up.program)}
                </p>
                {up.started_at && (
                  <p className="text-xs text-zinc-500">
                    Started {new Date(up.started_at).toLocaleDateString()}
                  </p>
                )}
              </div>
              {up.program.slug ? (
                <Link href={`/programs/${up.program.slug}`}>
                  <Button size="sm" variant="outline">
                    Continue
                  </Button>
                </Link>
              ) : null}
            </Card>
          ))}
          {myPrograms.isSuccess && (myPrograms.data ?? []).length === 0 && (
            <Card>
              <p className="text-sm text-zinc-400">
                No programs yet.{" "}
                <Link href="/programs" className="text-lime-300">
                  Browse programs →
                </Link>
              </p>
            </Card>
          )}
        </div>
      )}

      {tab === "payments" && (
        <div className="mt-6 space-y-3">
          {myTransactions.isLoading && <LoadingState label="Loading payments…" />}
          {myTransactions.isError && (
            <Card>
              <p className="text-sm text-red-400">
                Couldn&apos;t load your payments. Check your connection and try
                again.
              </p>
            </Card>
          )}
          {payments.map((tx) => (
            <Card
              key={tx.id}
              className="flex flex-wrap items-center justify-between gap-3"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-white">
                  {tx.plan?.name ?? `Payment #${tx.id}`}
                </p>
                <p className="text-xs text-zinc-500">
                  {formatPrice(tx.amount, tx.currency ?? "MMK")}
                  {tx.payment_method ? ` · ${tx.payment_method}` : ""} ·{" "}
                  {tx.created_at
                    ? new Date(tx.created_at).toLocaleDateString()
                    : ""}
                </p>
                {tx.admin_notes && (
                  <p className="mt-1 text-xs text-zinc-400">{tx.admin_notes}</p>
                )}
              </div>
              <span
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  tx.status === "approved"
                    ? "bg-lime-400/15 text-lime-300"
                    : tx.status === "rejected" || tx.status === "refunded"
                      ? "bg-red-500/15 text-red-300"
                      : "bg-amber-400/15 text-amber-300"
                }`}
              >
                {tx.status}
              </span>
            </Card>
          ))}
          {myTransactions.isSuccess && payments.length === 0 && (
            <Card>
              <p className="text-sm text-zinc-400">
                No payments yet.
                {MEMBERSHIP_ENABLED && (
                  <>
                    {" "}
                    <Link href="/membership" className="text-lime-300">
                      Choose a membership plan →
                    </Link>
                  </>
                )}
              </p>
            </Card>
          )}
        </div>
      )}

      {tab === "settings" && (
        <div className="mt-6 max-w-md space-y-4">
          <Card>
            <h2 className="font-bold text-white">Profile</h2>
            <form
              key={user.name}
              className="mt-4 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                void updateProfile.mutate({
                  name: String(fd.get("name") ?? "").trim(),
                });
              }}
            >
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  maxLength={255}
                  defaultValue={user.name}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user.email} disabled />
              </div>
              <Button size="sm" disabled={updateProfile.isPending}>
                {updateProfile.isPending ? "Saving…" : "Save changes"}
              </Button>
            </form>
          </Card>

        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-md px-4 py-16">
          <p className="text-sm text-zinc-500">Loading your dashboard…</p>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
