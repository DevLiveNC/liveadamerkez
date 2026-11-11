import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { site } from "@ada-merkez/copy";
import { Dekor } from "@ada-merkez/ui";
import { isAppPath } from "@ada-merkez/shared";
import { MarketingChrome } from "../components/MarketingChrome";
import { dekorForPath } from "../lib/dekor";
import { APP_MANIFEST_HREF, PWA_STANDALONE_REDIRECT_SCRIPT } from "../lib/pwa";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  applicationName: site.name,
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  manifest: APP_MANIFEST_HREF,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: site.locale,
    siteName: site.name,
    title: site.title,
    description: site.description,
  },
  twitter: {
    card: "summary",
    title: site.title,
    description: site.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0F2C44",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-ada-path") ?? "";
  const isApp = isAppPath(path);
  const dekor = dekorForPath(path);
  return (
    <html lang={site.language} data-theme="light" data-dekor={dekor}>
      <head>
        {isApp ? null : (
          <script dangerouslySetInnerHTML={{ __html: PWA_STANDALONE_REDIRECT_SCRIPT }} />
        )}
        <link rel="manifest" href={APP_MANIFEST_HREF} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={site.name} />
        <link rel="preload" href="/fonts/PlusJakartaSans-Bold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/PlusJakartaSans-SemiBold.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Inter-Regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preload" href="/fonts/Inter-Medium.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});`,
          }}
        />
      </head>
      <body className={isApp ? "am-app" : "landing"} data-dekor={dekor}>
        <MarketingChrome>{children}</MarketingChrome>
        {dekor === "landing" ? null : <Dekor scene={dekor} />}
      </body>
    </html>
  );
}
