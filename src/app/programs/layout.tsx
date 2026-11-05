import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Programs",
  description:
    "Explore trainer-designed fitness programs with structured, day-by-day workouts for strength, conditioning and training at home in Myanmar.",
  alternates: { canonical: "/programs" },
  openGraph: {
    title: "Workout Programs",
    description:
      "Explore trainer-designed fitness programs with structured, day-by-day workouts for strength, conditioning and training at home in Myanmar.",
    url: "/programs",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workout Programs",
    description:
      "Explore trainer-designed fitness programs with structured, day-by-day workouts for strength, conditioning and training at home in Myanmar.",
  },
};

export default function ProgramsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
