import type { Metadata, Viewport } from "next";
import { site } from "@ada-merkez/copy";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { InstallHint } from "../components/InstallHint";
import { ServiceWorkerRegister } from "../components/ServiceWorkerRegister";
import { Analytics } from "../components/Analytics";
import { AttributionCapture } from "../components/AttributionCapture";
import { ConsentBanner } from "../components/ConsentBanner";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");

export const metadata: Metadata = {
  title: site.title,
  description: site.description,
  applicationName: site.name,
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  manifest: "/manifest.webmanifest",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.language} data-theme="light">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('consent','default',{ad_storage:'denied',analytics_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});`,
          }}
        />
      </head>
      <body className="landing">
        <a className="skip" href="#icerik">
          İçeriğe geç
        </a>
        <AttributionCapture />
        <Analytics />
        <ConsentBanner />
        <Header />
        {children}
        <InstallHint />
        <Footer />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
