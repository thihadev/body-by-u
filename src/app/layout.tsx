import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: {
    default: "Body By U — Train Anywhere",
    template: "%s | Body By U",
  },
  description:
    "Myanmar's home-grown fitness platform. Guided programs and an exercise library with proper form.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://body-byu.com",
  ),
  applicationName: "Body By U",
  keywords: [
    "fitness Myanmar",
    "workout programs",
    "home workouts",
    "strength training",
    "exercise form guides",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Body By U",
    title: "Body By U — Train Anywhere",
    description:
      "Guided fitness programs and an exercise library with proper form, made for Myanmar.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Body By U — Train Anywhere",
    description:
      "Guided fitness programs and an exercise library with proper form, made for Myanmar.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body
        className="flex min-h-full flex-col bg-zinc-950 text-zinc-100"
        suppressHydrationWarning
      >
        <Providers>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
