"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CalendarClock, Check, Crown, ShieldCheck, Upload } from "lucide-react";
import {
  Button,
  Card,
  Input,
  Label,
  LoadingState,
  SectionTitle,
} from "@/components/ui";
import {
  useActiveSubscription,
  useCreateTransaction,
  useMyTransactions,
  usePaymentMethods,
  useSubscriptionPlans,
  useUploadTransactionScreenshot,
} from "@/hooks/use-api";
import { useAuthStore, useHasHydrated } from "@/stores/auth-store";
import { useNotificationStore } from "@/stores/notification-store";
import { cn, formatPrice } from "@/lib/utils";
import { MEMBERSHIP_ENABLED } from "@/lib/config";
import type { SubscriptionPlan } from "@/lib/types";

function SummaryRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4">
      <span className="text-zinc-400">{label} :</span>
      <span className={cn("font-bold", accent ? "text-brand-300" : "text-white")}>
        {value}
      </span>
    </div>
  );
}

export default function MembershipPage() {
  if (!MEMBERSHIP_ENABLED) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <Crown className="mx-auto h-10 w-10 text-brand-300" />
        <h1 className="mt-4 text-3xl font-extrabold text-white">
          Premium coming soon
        </h1>
      </div>
    );
  }

  return <MembershipStorefront />;
}

function MembershipStorefront() {
  const router = useRouter();
  const hydrated = useHasHydrated();
  const user = useAuthStore((s) => s.user);
  const pushNotification = useNotificationStore((s) => s.push);

  const plansQuery = useSubscriptionPlans();
  const plans = plansQuery.data ?? [];
  const { activeSubscription, isLoading: subscriptionLoading } =
    useActiveSubscription();
  const myTransactions = useMyTransactions();
  const payments = myTransactions.data ?? [];

  const methodsQuery = usePaymentMethods();
  const paymentMethods = methodsQuery.data ?? [];

  const createTransaction = useCreateTransaction();
  const uploadScreenshot = useUploadTransactionScreenshot();

  const [step, setStep] = useState<"select" | "confirm">("select");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [method, setMethod] = useState<string | null>(null);
  const [payerName, setPayerName] = useState("");
  const [payerPhone, setPayerPhone] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "done">("idle");

  const selectedPlan: SubscriptionPlan | null =
    plans.find((p) => p.id === selectedId) ?? plans[0] ?? null;
  const selectedMethod =
    paymentMethods.find((m) => m.slug === method) ?? paymentMethods[0] ?? null;
  const amount = selectedPlan ? Number(selectedPlan.amount) : 0;

  const pendingForPlan = selectedPlan
    ? payments.find(
        (tx) =>
          tx.subscription_plan_id === selectedPlan.id &&
          (tx.status === "pending" || tx.status === "reviewing"),
      )
    : undefined;

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-md px-4">
        <LoadingState label="Loading membership…" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Crown className="mx-auto h-8 w-8 text-amber-300" />
        <h1 className="mt-4 text-2xl font-extrabold text-white">
          Log in to subscribe
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          A membership unlocks every premium program on Body By U.
        </p>
        <Button className="mt-6" onClick={() => router.push("/login")}>
          Go to login
        </Button>
      </div>
    );
  }

  // While the storefront data is still being fetched, show a loading animation.
  if (plansQuery.isLoading || methodsQuery.isLoading || subscriptionLoading) {
    return <LoadingState label="Loading membership…" />;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedMethod || !file) return;
    setStatus("submitting");
    try {
      // 1. Record the payment (pending).
      const transaction = await createTransaction.mutateAsync({
        subscription_plan_id: selectedPlan.id,
        payment_method: selectedMethod.slug,
        payer_name: payerName.trim() || undefined,
        payer_phone: payerPhone.trim() || undefined,
        amount,
      });
      // 2. Attach the payslip (moves it to review).
      await uploadScreenshot.mutateAsync({
        transactionId: transaction.id,
        file,
      });
      pushNotification({
        title: "Payment submitted",
        body: `Your ${selectedPlan.name} payment is under review. We'll notify you once it's approved.`,
        href: "/dashboard?tab=payments",
      });
      setStatus("done");
    } catch {
      setStatus("idle");
    }
  };

  if (status === "done" && selectedPlan) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-400/15">
          <Check className="h-6 w-6 text-brand-300" />
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-white">
          Payment submitted
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Our team will review your payslip and activate your {selectedPlan.name}{" "}
          membership — usually within a few hours.
        </p>
        <Button
          className="mt-6"
          onClick={() => router.push("/dashboard?tab=payments")}
        >
          Go to dashboard
        </Button>
      </div>
    );
  }

  // Active membership: show only the active plan, no checkout.
  if (activeSubscription) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <SectionTitle
          eyebrow="Membership"
          title="Your membership"
          sub="You have an active membership — every premium program is unlocked."
        />
        <Card className="flex flex-wrap items-center justify-between gap-4 border-brand-400/30">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-400/15">
              <Crown className="h-6 w-6 text-brand-300" />
            </span>
            <div>
              <p className="font-bold text-white">
                {activeSubscription.plan?.name ?? "Premium plan"}
              </p>
              <span className="mt-1 inline-block rounded-full bg-brand-400/15 px-2.5 py-1 text-[11px] font-bold text-brand-300 uppercase">
                {activeSubscription.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            {activeSubscription.plan && (
              <p className="text-lg font-extrabold text-brand-300">
                {formatPrice(
                  activeSubscription.plan.amount,
                  activeSubscription.plan.currency,
                )}
              </p>
            )}
            {activeSubscription.ends_at && (
              <p className="flex items-center justify-end gap-1.5 text-xs text-zinc-400">
                <CalendarClock className="h-3.5 w-3.5 text-brand-300" />
                Expires{" "}
                {new Date(activeSubscription.ends_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </Card>
        <Button
          className="mt-6"
          variant="outline"
          onClick={() => router.push("/dashboard?tab=payments")}
        >
          View payment history
        </Button>
      </div>
    );
  }

  // Step 2: Order confirmation + payslip upload.
  if (step === "confirm" && selectedPlan && selectedMethod) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <h1 className="text-center text-2xl font-extrabold text-white">
          Order Summary
        </h1>
        <Card className="mt-6">
          <div className="space-y-3">
            <SummaryRow label="Package" value={selectedPlan.name} accent />
            <SummaryRow
              label="Amount"
              value={formatPrice(amount, selectedPlan.currency)}
            />
            <SummaryRow label="Payment" value={selectedMethod.name} accent />
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="payer-name">Payer Name</Label>
              <Input
                id="payer-name"
                value={payerName}
                onChange={(e) => setPayerName(e.target.value)}
                placeholder="Enter the name used for payment"
                required
              />
            </div>
            <div>
              <Label htmlFor="payer-phone">Phone Number</Label>
              <Input
                id="payer-phone"
                inputMode="tel"
                value={payerPhone}
                onChange={(e) => setPayerPhone(e.target.value)}
                placeholder="Enter phone number used for payment"
                required
              />
            </div>

            <div>
              <Label>Upload Your Payslip</Label>
              <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.02] p-8 text-center hover:border-brand-400/60">
                <Upload className="h-6 w-6 text-brand-300" />
                <span className="mt-2 text-sm text-zinc-300">
                  {file ? file.name : "Click to select payslip image"}
                </span>
                <span className="text-xs text-zinc-500">
                  PNG / JPG, max 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                className="flex-1"
                disabled={
                  !file ||
                  !payerName.trim() ||
                  !payerPhone.trim() ||
                  status === "submitting"
                }
              >
                {status === "submitting" ? "Placing order…" : "Place Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("select");
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      </div>
    );
  }

  // Step 1: choose plan + payment method, scan to pay.
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-center text-2xl font-extrabold text-white sm:text-3xl">
        Order Summary
      </h1>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Left: plan + payment method */}
        <div className="space-y-6">
          <Card>
            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Choose a Plan
            </p>
            <div className="mt-4 space-y-3">
              {plansQuery.isLoading && (
                <p className="text-sm text-zinc-500">Loading plans…</p>
              )}
              {plansQuery.isError && (
                <p className="text-sm text-red-400">
                  Couldn&apos;t load membership plans. Try again shortly.
                </p>
              )}
              {plans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                const pending = payments.find(
                  (tx) =>
                    tx.subscription_plan_id === plan.id &&
                    (tx.status === "pending" || tx.status === "reviewing"),
                );
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => {
                      setSelectedId(plan.id);
                    }}
                    className={cn(
                      "flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border px-5 py-4 text-left transition-colors",
                      isSelected
                        ? "border-brand-400/60 bg-brand-400/[0.06]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20",
                    )}
                  >
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">{plan.name}</span>
                      {pending && (
                        <span className="rounded-full bg-amber-400/15 px-2.5 py-1 text-[11px] font-bold text-amber-300 uppercase">
                          Under review
                        </span>
                      )}
                    </span>
                    <span className="shrink-0 font-extrabold text-brand-300">
                      {formatPrice(plan.amount, plan.currency)}
                    </span>
                  </button>
                );
              })}
              {plansQuery.isSuccess && plans.length === 0 && (
                <p className="text-sm text-zinc-400">
                  No membership plans are available right now.
                </p>
              )}
            </div>
          </Card>

          <Card>
            <p className="text-xs font-bold tracking-widest text-zinc-400 uppercase">
              Select a Payment Method
            </p>
            <div className="mt-4 space-y-3">
              {paymentMethods.length === 0 ? (
                <p className="text-sm text-zinc-500">
                  No payment methods are available right now. Please try again
                  shortly.
                </p>
              ) : (
                paymentMethods.map((m) => {
                  const isSelected = selectedMethod?.slug === m.slug;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.slug)}
                      className={cn(
                        "flex w-full cursor-pointer items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-colors",
                        isSelected
                          ? "border-brand-400/60 bg-brand-400/[0.06]"
                          : "border-white/10 bg-white/[0.02] hover:border-white/20",
                      )}
                    >
                      {m.logo_url ? (
                        <img
                          src={m.logo_url}
                          alt=""
                          className="h-9 w-9 shrink-0 rounded-lg object-contain"
                        />
                      ) : (
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-xs font-bold text-zinc-400">
                          {m.name.slice(0, 1)}
                        </span>
                      )}
                      <span className="flex-1 font-semibold text-white">
                        {m.name}
                      </span>
                      {(m.account_number || m.account_name) && (
                        <span className="shrink-0 text-right">
                          {m.account_number && (
                            <span className="block font-bold text-brand-300">
                              {m.account_number}
                            </span>
                          )}
                          {m.account_name && (
                            <span className="block text-xs text-zinc-400">
                              ({m.account_name})
                            </span>
                          )}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Right: scan to pay */}
        <Card className="flex flex-col items-center justify-center text-center">
          <p className="text-sm text-zinc-400">Scan to Pay</p>
          {selectedMethod?.qr_url ? (
            <img
              src={selectedMethod.qr_url}
              alt={`${selectedMethod.name} QR code`}
              className="mt-5 h-64 w-64 rounded-2xl bg-white object-contain p-3"
            />
          ) : (
            <p className="flex h-64 items-center text-sm text-zinc-500">
              QR code coming soon.
            </p>
          )}
          {selectedPlan && (
            <div className="mt-5">
              <p className="font-bold text-white">{selectedPlan.name}</p>
              <p className="mt-1 text-2xl font-extrabold text-brand-300">
                {formatPrice(amount, selectedPlan.currency)}
              </p>
            </div>
          )}
        </Card>
      </div>

      {pendingForPlan && (
        <p className="mx-auto mt-6 flex max-w-xl items-center justify-center gap-2 rounded-2xl border border-amber-400/20 bg-amber-400/5 px-4 py-3 text-center text-sm text-amber-300">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          Your {pendingForPlan.plan?.name ?? selectedPlan?.name} payment is under
          review. Approval usually takes a few hours.
        </p>
      )}

      <div className="mx-auto mt-8 flex max-w-xl gap-3">
        <Button
          className="flex-1"
          disabled={!selectedPlan || !selectedMethod}
          onClick={() => {
            setStep("confirm");
          }}
        >
          Checkout
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push("/dashboard")}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}
