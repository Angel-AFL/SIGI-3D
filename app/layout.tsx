import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { RegisterServiceWorker } from "@/components/pwa/register-sw";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  applicationName: "SIGI 3D",
  title: {
    default: "SIGI 3D — Sistema Inteligente para la Gestión de Impresoras 3D",
    template: "%s | SIGI 3D",
  },
  description:
    "Sistema Inteligente para la Gestión de Impresoras 3D: inventario de filamentos, pedidos, visor de modelos STL y producción en serie.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SIGI 3D",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#083858",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OfflineBanner />
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
