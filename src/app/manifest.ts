import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Momentree",
    short_name: "Momentree",
    description: "웨딩 청첩장 플랫폼",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#faf6f1",
    theme_color: "#5c4035",
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
