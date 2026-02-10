import type { Metadata, Viewport } from "next";

import "./globals.css";
import Header from "./Header";

export const metadata: Metadata = {
  title: "아맞다밥!",
  description: "유월아 밥먹자~",
  applicationName: "아맞다밥!",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "아맞다밥!",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#22C55E",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
