import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "مساعد مقالات أموالي",
    short_name: "أموالي",
    description:
      "مولد المقالات اللانهائي للخدمات الحكومية المصرية — ٨ مقالات جديدة كل يوم مع سجل يومي ومعالج مراجعات.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    dir: "rtl",
    lang: "ar",
    background_color: "#070d0a",
    theme_color: "#065f46",
    categories: ["productivity", "utilities", "news"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
