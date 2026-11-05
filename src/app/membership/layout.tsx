import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Membership",
  description:
    "See Body By U membership options for premium workout programs and coaching videos, with local payment options in Myanmar.",
  alternates: { canonical: "/membership" },
  openGraph: {
    title: "Membership",
    description:
      "See Body By U membership options for premium workout programs and coaching videos, with local payment options in Myanmar.",
    url: "/membership",
  },
  twitter: {
    card: "summary_large_image",
    title: "Membership",
    description:
      "See Body By U membership options for premium workout programs and coaching videos, with local payment options in Myanmar.",
  },
};

export default function MembershipLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}
