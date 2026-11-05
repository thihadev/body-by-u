import Link from "next/link";
import { CalendarCheck, Dumbbell, Gift, Users } from "lucide-react";
import { MEMBERSHIP_ENABLED } from "@/lib/config";
import { SectionTitle } from "@/components/ui";

export const metadata = {
  title: "Fitness Made for Myanmar",
  description:
    "Meet Body By U: a Myanmar fitness platform with trainer-designed programs, daily workouts and guidance you can follow at home or in the gym.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Fitness Made for Myanmar",
    description:
      "Meet Body By U: a Myanmar fitness platform with trainer-designed programs, daily workouts and guidance you can follow at home or in the gym.",
    url: "/about",
  },
  twitter: {
    card: "summary_large_image",
    title: "Fitness Made for Myanmar",
    description:
      "Meet Body By U: a Myanmar fitness platform with trainer-designed programs, daily workouts and guidance you can follow at home or in the gym.",
  },
};

const values = [
  {
    icon: Gift,
    title: "Free programs for everyone",
    text: "Guided workout programs you can start today",
  },
  {
    icon: Users,
    title: "Real trainers in every video",
    text: "Local coaches design each program and walk you through proper form.",
  },
  {
    icon: CalendarCheck,
    title: "Train anywhere",
    text: "Day-by-day plans that work in the gym or your living room.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-400">
        <Dumbbell className="h-7 w-7 text-black" />
      </span>
      <SectionTitle
        title="Fitness made for Myanmar."
        sub=""
      />
      <p className="mx-auto -mt-4 mb-10 max-w-xl text-sm text-zinc-400">
        We started this because good coaching shouldn&apos;t depend on where
        you live or what you can afford. Every program is designed by real
        trainers, broken into daily sessions, and built to be followed on your
        phone.
      </p>

      <div className="grid gap-5 text-left sm:grid-cols-3">
        {values.map((v) => (
          <div
            key={v.title}
            className="rounded-2xl border border-white/10 bg-white/[0.03] p-6"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-400/15">
              <v.icon className="h-4.5 w-4.5 text-brand-300" />
            </span>
            <p className="mt-3 font-bold text-white">{v.title}</p>
            <p className="mt-1.5 text-sm text-zinc-400">{v.text}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-col items-center gap-3">
        <Link
          href="/programs"
          className="inline-flex h-11 items-center justify-center rounded-full bg-brand-400 px-8 text-sm font-bold text-zinc-950 transition-colors hover:brightness-110"
        >
          Browse free programs
        </Link>
        {!MEMBERSHIP_ENABLED && (
          <p className="text-xs text-zinc-500">
            Membership is coming soon 🎉
          </p>
        )}
      </div>
    </div>
  );
}
