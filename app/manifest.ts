import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "아맞다밥!",
    short_name: "아맞다밥!",
    description: "유월아 밥먹자~",
    start_url: "/",
    display: "standalone",
    background_color: "#fafafa",
    theme_color: "#00c950",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
