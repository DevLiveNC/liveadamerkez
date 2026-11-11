"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { isletmeApp, site } from "@ada-merkez/copy";
import { DekorNavCorner } from "@ada-merkez/ui";
import { Logo } from "../Logo";
import { fetchMe, type BusinessMe } from "../../lib/isletme-api";

const DESK_LINKS = [
  { href: "/app/isletme", label: isletmeApp.navToday },
  { href: "/app/isletme/gelen", label: isletmeApp.navInbox },
  { href: "/app/isletme/bos-saatler", label: isletmeApp.navHours },
  { href: "/app/isletme/profil", label: isletmeApp.navServices },
  { href: "/app/isletme/istatistik", label: isletmeApp.navStats },
] as const;

const MOBILE_LINKS = [
  { href: "/app/isletme", label: isletmeApp.navToday, icon: "cal" },
  { href: "/app/isletme/gelen", label: isletmeApp.navInbox, icon: "in" },
  { href: "/app/isletme/bos-saatler", label: isletmeApp.navSlots, icon: "slot" },
  { href: "/app/isletme/profil", label: isletmeApp.navBusiness, icon: "biz" },
] as const;

function isOn(pathname: string, href: string) {
  if (href === "/app/isletme") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function IsletmeShell({
  session,
  children,
}: {
  session: { name: string | null };
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [me, setMe] = useState<BusinessMe | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await fetchMe();
      setMe(data.me);
    } catch {
      setMe(null);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh, pathname]);

  async function logout() {
    await fetch("/app/api/oturum", { method: "DELETE", credentials: "same-origin" });
    router.replace("/app/giris?rol=isletme");
    router.refresh();
  }

  const pending = me?.business?.status === "pending";
  const who = me?.business
    ? `${me.business.name} · ${me.business.cityName ?? ""}`
    : session.name || isletmeApp.registerTitle;

  return (
    <div className="isletme-app">
      <div className="isletme-shell">
        <aside className="isletme-side side-nav">
          <div className="brand">
            <Logo height={28} />
          </div>
          <p className="who">
            {who}
            <br />
            {site.regionLine}
          </p>
          <p className="sec">Panel</p>
          {DESK_LINKS.map((link) => (
            <Link key={link.href} className={isOn(pathname, link.href) ? "on" : ""} href={link.href}>
              {link.label}
            </Link>
          ))}
          <button className="btn btn-ghost btn-sm" type="button" style={{ marginTop: 24 }} onClick={() => void logout()}>
            {isletmeApp.logout}
          </button>
          <DekorNavCorner />
        </aside>
        <div className="isletme-main">
          {pending ? (
            <div className="isletme-banner" role="status">
              <span className="isletme-badge badge-wait">{isletmeApp.pendingBadge}</span>
              <p className="t-sm" style={{ marginTop: 8 }}>
                {isletmeApp.pendingBody}
              </p>
            </div>
          ) : null}
          {me?.business?.status === "rejected" ? (
            <div className="isletme-banner" role="status">
              <span className="isletme-badge badge-wait">{isletmeApp.rejectedBadge}</span>
              <p className="t-sm" style={{ marginTop: 8 }}>
                {isletmeApp.rejectedBody}
              </p>
            </div>
          ) : null}
          {children}
        </div>
        <nav className="isletme-tabs" aria-label="İşletme gezinme">
          {MOBILE_LINKS.map((link) => (
            <Link key={link.href} className={isOn(pathname, link.href) ? "on" : ""} href={link.href}>
              <TabIcon name={link.icon} />
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}

function TabIcon({ name }: { name: string }) {
  if (name === "cal") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3.5v3M16 3.5v3M4 10h16" />
      </svg>
    );
  }
  if (name === "in") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <path d="M5 18 4 21l3.2-1.2A9 9 0 1 0 5 18z" />
      </svg>
    );
  }
  if (name === "slot") {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </svg>
    );
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
    </svg>
  );
}
