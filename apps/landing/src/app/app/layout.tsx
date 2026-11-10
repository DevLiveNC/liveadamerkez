import type { Metadata, Viewport } from "next";
import { app, site } from "@ada-merkez/copy";
import { AppChrome } from "../../components/app/AppChrome";
import { IosSplashLinks } from "../../components/app/IosSplashLinks";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: app.title,
  description: app.description,
  applicationName: site.name,
  manifest: "/app/manifest.json",
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/app/icons/favicon.svg", type: "image/svg+xml" },
      { url: "/app/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/app/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/app/icons/apple-touch-180.png", sizes: "180x180" }],
    shortcut: "/app/icons/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F2C44",
  width: "device-width",
  initialScale: 1,
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IosSplashLinks />
      <AppChrome>{children}</AppChrome>
    </>
  );
}
