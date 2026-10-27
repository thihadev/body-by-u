import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Body By U — Train Anywhere",
    short_name: "Body By U",
    description:
      "Guided fitness programs and an exercise library with proper form.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1e",
    theme_color: "#0a0f1e",
    icons: [
      { src: "/favicon.ico", sizes: "any", type: "image/x-icon" },
    ],
  };
}
