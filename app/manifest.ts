import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SIGI 3D — Sistema Inteligente para la Gestión de Impresoras 3D",
    short_name: "SIGI 3D",
    description:
      "Sistema Inteligente para la Gestión de Impresoras 3D: inventario de filamentos, pedidos, visor de modelos STL y producción en serie.",
    lang: "es",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#083858",
    categories: ["productivity", "utilities"],
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
