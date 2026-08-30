import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SubroVerse",
    short_name: "SubroVerse",
    description: "A love letter that never learned to stop.",
    start_url: "/",
    display: "standalone",
    background_color: "#120e1f",
    theme_color: "#120e1f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
