"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { app, nav } from "@ada-merkez/copy";
import { Logo } from "../Logo";
import { AppSwRegister } from "./AppSwRegister";
import { AppInstallSheet } from "./AppInstallSheet";

const TABS = [
  { href: "/app", label: app.discover, match: (p: string) => p === "/app" || p.startsWith("/app/isletmeler") },
  { href: "/app/randevular", label: app.bookings, match: (p: string) => p.startsWith("/app/randevular") },
  { href: "/app/favoriler", label: app.favorites, match: (p: string) => p.startsWith("/app/favoriler") },
  { href: "/app/hesap", label: app.account, match: (p: string) => p.startsWith("/app/hesap") },
] as const;

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/app";
  const hideTabs =
    pathname.startsWith("/app/giris") ||
    pathname === "/app/isletme" ||
    pathname.startsWith("/app/isletme/") ||
    pathname === "/app/yonetim" ||
    pathname.startsWith("/app/yonetim/") ||
    pathname.startsWith("/app/yonetici");

  return (
    <div className="am-shell">
      <header className="am-top">
        <Link href="/app" aria-label={app.title}>
          <Logo height={28} />
        </Link>
        <div className="seg lang am-lang" role="group" aria-label={nav.lang}>
          <button type="button" aria-pressed="true">
            TR
          </button>
          <button type="button" disabled aria-disabled="true" aria-label={nav.enLabel} title={nav.enSoon}>
            EN
            <span className="lang-soon">{nav.enSoon}</span>
          </button>
        </div>
      </header>
      <main className="am-main">{children}</main>
      {hideTabs ? null : (
        <nav className="am-tabs" aria-label={app.title}>
          {TABS.map((tab) => (
            <Link key={tab.href} href={tab.href} className={tab.match(pathname) ? "on" : undefined}>
              {tab.label}
            </Link>
          ))}
        </nav>
      )}
      <AppSwRegister />
      <AppInstallSheet />
    </div>
  );
}
