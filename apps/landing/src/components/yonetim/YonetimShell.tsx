"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site, yonetimApp } from "@ada-merkez/copy";
import { DekorNavCorner } from "@ada-merkez/ui";
import type { AppSession } from "../../lib/app-auth";
import { Logo } from "../Logo";
import { CikisButton } from "../app/CikisButton";

const DESK_LINKS = [
  { href: "/app/yonetim", label: yonetimApp.navApprovals },
  { href: "/app/yonetim/kiracilar", label: yonetimApp.navTenants },
  { href: "/app/yonetim/kullanicilar", label: yonetimApp.navUsers },
  { href: "/app/yonetim/rezervasyonlar", label: yonetimApp.navBookings },
  { href: "/app/yonetim/icerik", label: yonetimApp.navContent },
  { href: "/app/yonetim/raporlar", label: yonetimApp.navReports },
  { href: "/app/yonetim/sistem-durumu", label: yonetimApp.navHealth },
  { href: "/app/yonetim/denetim", label: yonetimApp.navAudit },
] as const;

const MOBILE_LINKS = [
  { href: "/app/yonetim", label: yonetimApp.navApprovals },
  { href: "/app/yonetim/rezervasyonlar", label: yonetimApp.navBookings },
  { href: "/app/yonetim/sistem-durumu", label: yonetimApp.navHealth },
  { href: "/app/yonetim/raporlar", label: yonetimApp.navReports },
] as const;

function isOn(pathname: string, href: string) {
  if (href === "/app/yonetim") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function YonetimShell({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/app/yonetim";

  return (
    <div className="yonetim-app">
      <div className="yonetim-shell">
        <aside className="yonetim-side side-nav">
          <div className="brand">
            <Logo height={28} />
          </div>
          <p className="who">
            {yonetimApp.who}
            <br />
            {session.name || site.regionLine}
          </p>
          <p className="sec">Panel</p>
          {DESK_LINKS.map((link) => (
            <Link key={link.href} className={isOn(pathname, link.href) ? "on" : ""} href={link.href}>
              {link.label}
            </Link>
          ))}
          <div style={{ marginTop: 24 }}>
            <CikisButton />
          </div>
          <DekorNavCorner />
        </aside>
        <div className="yonetim-main">{children}</div>
        <nav className="yonetim-tabs" aria-label="Yönetim gezinme">
          {MOBILE_LINKS.map((link) => (
            <Link key={link.href} className={isOn(pathname, link.href) ? "on" : ""} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
