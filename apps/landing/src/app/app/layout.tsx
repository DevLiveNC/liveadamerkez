import type { Metadata, Viewport } from "next";
import { app, site } from "@ada-merkez/copy";
import { AppChrome } from "../../components/app/AppChrome";
import { IosSplashLinks } from "../../components/app/IosSplashLinks";
import { APP_MANIFEST_HREF } from "../../lib/pwa";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: app.title,
  description: app.description,
  applicationName: site.name,
  manifest: APP_MANIFEST_HREF,
  appleWebApp: {
    capable: true,
    title: site.name,
    /* Açık tema: koyu ikonlu durum çubuğu. `black-translucent` beyaz
       ikon isterdi; fildişi zeminde okunmazdı. */
    statusBarStyle: "default",
  },
  /* Metin içindeki telefon/adres otomatik bağlantıya dönüşmesin: native his. */
  formatDetection: { telephone: false, date: false, address: false, email: false },
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
  /* Durum çubuğu / adres çubuğu uygulamanın fildişi zeminiyle aynı renkte:
     standalone açılışta "site" hissi değil "uygulama" hissi. */
  themeColor: "#F8F0E3",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  /* Çentik / Dynamic Island alanı kabuğa bırakılır; env(safe-area-*) çalışır. */
  viewportFit: "cover",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IosSplashLinks />
      <AppChrome>{children}</AppChrome>
    </>
  );
}
