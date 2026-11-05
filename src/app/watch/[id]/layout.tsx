import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workout Video",
  robots: { index: false, follow: false },
};

export default function WatchLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
