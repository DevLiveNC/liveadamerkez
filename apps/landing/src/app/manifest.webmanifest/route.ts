import { site } from "@ada-merkez/copy";
import { APP_MANIFEST_SCOPE, APP_START_URL } from "../../lib/pwa";

export function GET() {
  return new Response(
    JSON.stringify({
      id: "/",
      name: site.name,
      short_name: site.name,
      description: site.description,
      start_url: APP_START_URL,
      scope: APP_MANIFEST_SCOPE,
      display: "standalone",
      orientation: "portrait-primary",
      background_color: "#F8F0E3",
      theme_color: "#0F2C44",
      lang: site.language,
      dir: "ltr",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        {
          src: "/icons/icon-maskable-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "maskable",
        },
        {
          src: "/icons/icon-maskable-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "maskable",
        },
      ],
    }),
    {
      headers: {
        "content-type": "application/manifest+json; charset=utf-8",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    },
  );
}
