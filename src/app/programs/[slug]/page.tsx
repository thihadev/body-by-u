import type { Metadata } from "next";
import { getPublishedProgram, siteUrl } from "@/lib/seo";
import ProgramDetailClient from "./ProgramDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const program = await getPublishedProgram(slug);
  const title = program?.title ?? slug.replaceAll("-", " ");
  const description =
    program?.description ??
    "Explore a guided workout program from Body By U, Myanmar's fitness platform.";
  const canonical = `/programs/${encodeURIComponent(slug)}`;
  const image = program?.thumbnail_url ?? program?.thumbnail;

  return {
    title,
    description,
    alternates: { canonical },
    robots: program ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description,
      url: new URL(canonical, siteUrl),
      images: image ? [image] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProgramDetailPage({ params }: Props) {
  const { slug } = await params;
  const program = await getPublishedProgram(slug);

  return <ProgramDetailClient slug={slug} initialProgram={program ?? undefined} />;
}
