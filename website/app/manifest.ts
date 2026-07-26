import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Uniplexa — LL97 Penalty Calculator",
    short_name: "Uniplexa LL97",
    description:
      "Free Local Law 97 (LL97) penalty calculator for NYC buildings.",
    start_url: "/",
    display: "browser",
    background_color: "#F2F1EA",
    theme_color: "#17181C",
    icons: [
      {
        src: "/favicon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
