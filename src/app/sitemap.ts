import type { MetadataRoute } from "next";
import { getPublishedPrograms, siteUrl } from "@/lib/seo";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["/", "/about", "/programs", "/membership"];
  const programs = await getPublishedPrograms();
  const paths = [
    ...staticPaths,
    ...programs.map((program) => `/programs/${encodeURIComponent(program.slug)}`),
  ];

  return paths.map((path) => ({
    url: new URL(path, siteUrl).toString(),
  }));
}
