import { apiBaseURL } from "@/lib/api";
import { MEMBERSHIP_ENABLED } from "@/lib/config";
import type { Program } from "@/lib/types";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://body-byu.com",
);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function unwrapData(value: unknown): unknown {
  return isRecord(value) && "data" in value ? value.data : value;
}

function isPublishedProgram(value: unknown): value is Program {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    typeof value.title === "string" &&
    typeof value.slug === "string" &&
    value.status === "published" &&
    (value.access_type === "free" || value.access_type === "premium") &&
    (MEMBERSHIP_ENABLED || value.access_type === "free")
  );
}

async function fetchProgramsEndpoint(path: string): Promise<unknown | null> {
  let response: Response;
  try {
    response = await fetch(`${apiBaseURL}${path}`, {
      next: { revalidate: 3600 },
    });
  } catch (error) {
    console.error(`Unable to load SEO data from ${path}.`, error);
    return null;
  }

  if (!response.ok) {
    if (response.status !== 404) {
      console.error(
        `Unable to load SEO data from ${path}: API returned ${response.status}.`,
      );
    }
    return null;
  }

  const payload: unknown = await response.json();
  return payload;
}

export async function getPublishedProgram(
  slug: string,
): Promise<Program | null> {
  const payload = await fetchProgramsEndpoint(
    `/programs/${encodeURIComponent(slug)}`,
  );
  const program = unwrapData(payload);
  return isPublishedProgram(program) ? program : null;
}

export async function getPublishedPrograms(): Promise<Program[]> {
  const payload = await fetchProgramsEndpoint("/programs");
  if (payload === null) return [];

  const programs = unwrapData(payload);
  if (!Array.isArray(programs)) {
    console.error("Unable to build the program sitemap: API response was not a list.");
    return [];
  }

  return programs.filter(isPublishedProgram);
}
