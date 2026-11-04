import Link from "next/link";
import { ArrowRight, BadgeCheck, Crown, Sparkles } from "lucide-react";
import { Button } from "@/components/ui";
import { FeaturedPrograms } from "@/components/FeaturedPrograms";

export const metadata = {
  title: "Body By U — Train Anywhere",
};

export default function Home() {
  return (
    <div>
      {/* Hero — single message, single action row */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(640px 320px at 50% 0%, rgba(163,230,53,0.12), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-10 text-center sm:px-6 sm:pt-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/25 bg-lime-400/10 px-4 py-1.5 text-xs font-semibold text-lime-300">
            <Sparkles className="h-3.5 w-3.5" /> Myanmar&apos;s fitness platform
          </p>
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            Train anywhere. <span className="text-lime-400">Get stronger</span>{" "}
            every week.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] text-zinc-400">
            Structured programs, correct form guides and coaching videos — gym
            or home.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/programs">
              <Button>
                Browse programs <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        
        </div>
      </section>

      {/* Featured programs — loaded from API */}
      <FeaturedPrograms />

      {/* Free forever — premium band shown only when membership is enabled */}
      <section className="border-y border-white/5">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-12 sm:px-6">
            <div className="rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-bold text-white">Free </h3>
              <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                {[
                  "Beginner foundation programs",
                  "Exercise library with form guides",
                  "Progress tracking dashboard",
                ].map((t) => (
                  <li key={t} className="flex gap-2">
                    <BadgeCheck className="h-4 w-4 shrink-0 text-lime-400" /> {t}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="mt-5 inline-block">
                <Button variant="outline" size="sm">
                  Create free account
                </Button>
              </Link>
            </div>
            <div className="rounded-2xl border border-lime-400/25 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-white">
                  <Crown className="h-5 w-5 text-amber-300" /> Premium
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-zinc-400">
                  {[
                    "Full video breakdowns",
                    "Advanced 6–8 week programs",
                    "KB Pay / Wave Pay checkout",
                  ].map((t) => (
                    <li key={t} className="flex gap-2">
                      <BadgeCheck className="h-4 w-4 shrink-0 text-amber-300" /> {t}
                    </li>
                  ))}
                </ul>
                
                <Button size="sm" disabled className="mt-5">
                  Coming soon
                </Button>
            </div>
        </div>
      </section>
    </div>
  );
}
