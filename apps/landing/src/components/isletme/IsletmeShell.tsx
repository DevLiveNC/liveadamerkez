"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { app as appCopy, isletmeApp, site } from "@ada-merkez/copy";
import { DekorNavCorner } from "@ada-merkez/ui";
import { BackButton } from "../app/BackButton";
import { parentOf, setNavDirection } from "../../lib/app-nav";
import { ICON_SRC } from "../Logo";
import { clearAppCaches } from "../../lib/clear-app-caches";
import { fetchMe, type BusinessMe } from "../../lib/isletme-api";
import { LocalClock } from "../panel/LocalClock";
import {
  IconCalendar,
  IconInbox,
  IconOverview,
  IconServices,
  IconSettings,
} from "../panel/icons";

const LINKS = [
  { href: "/app/isletme", label: isletmeApp.navOverview, short: isletmeApp.navOverviewShort, icon: "overview" },
  { href: "/app/isletme/takvim", label: isletmeApp.navCalendar, short: isletmeApp.navCalendar, icon: "cal" },
  { href: "/app/isletme/talepler", label: isletmeApp.navInboxLong, short: isletmeApp.navInbox, icon: "in" },
  { href: "/app/isletme/hizmetler", label: isletmeApp.navServices, short: isletmeApp.navServices, icon: "svc" },
  { href: "/app/isletme/profil", label: isletmeApp.navSettings, short: isletmeApp.navSettings, icon: "set" },
] as const;

function isOn(pathname: string, href: string) {
  if (href === "/app/isletme") return pathname === href;
  if (href === "/app/isletme/profil") {
    return pathname === href || pathname.startsWith("/app/isletme/profil/");
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name, large }: { name: string; large?: boolean }) {
  const cls = large ? "am-icon am-icon-lg" : "am-icon";
  if (name === "overview") return <IconOverview className={cls} />;
  if (name === "cal") return <IconCalendar className={cls} />;
  if (name === "in") return <IconInbox className={cls} />;
  if (name === "svc") return <IconServices className={cls} />;
  return <IconSettings className={cls} />;
}

function initial(name: string | null | undefined) {
  const ch = name?.trim()?.[0];
  return ch ? ch.toLocaleUpperCase("tr-TR") : "İ";
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
    await clearAppCaches();
    router.replace("/app/giris?rol=isletme");
    router.refresh();
  }

  const pending = me?.business?.status === "pending";
  const who = me?.business?.name || session.name || isletmeApp.registerTitle;
  const active = LINKS.find((link) => isOn(pathname ?? "", link.href));
  /* Sekmelerin dışındaki panel ekranları (ör. boş saatler) geri düğmesi alır. */
  const nested = !active;

  return (
    <div className="isletme-app am-dash">
      <aside className="am-side side-nav">
        <div className="am-side-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON_SRC} width={64} height={64} alt="" />
          <div>
            <strong>{who}</strong>
            <span>{isletmeApp.loginTitle}</span>
          </div>
        </div>
        <nav className="am-side-nav" aria-label={isletmeApp.loginTitle}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              className={`am-side-link${isOn(pathname ?? "", link.href) ? " is-on" : ""}`}
              href={link.href}
            >
              <NavIcon name={link.icon} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="am-side-foot">
          <div className="am-avatar" aria-hidden="true">
            {initial(who)}
          </div>
          <button type="button" onClick={() => void logout()}>
            <strong style={{ fontSize: 13 }}>{session.name || who}</strong>
            <span style={{ display: "block", fontSize: 12, color: "var(--am-color-text-muted)" }}>
              {isletmeApp.logout}
            </span>
          </button>
        </div>
        <DekorNavCorner />
      </aside>
      <main id="isletme-icerik" className="am-main">
        <header className="am-topbar">
          <div className="am-work-title-row">
            {nested ? (
              <BackButton label={appCopy.back} fallback={parentOf(pathname ?? "/app/isletme")} />
            ) : null}
            <h1>{active?.label ?? isletmeApp.loginTitle}</h1>
          </div>
          <div className="am-topbar-meta">
            <LocalClock />
          </div>
        </header>
        {pending ? (
          <div className="am-banner" role="status">
            <span className="am-badge am-badge--pending">{isletmeApp.pendingBadge}</span>
            <p className="t-sm" style={{ marginTop: 8 }}>
              {isletmeApp.pendingBody}
            </p>
          </div>
        ) : null}
        {me?.business?.status === "rejected" ? (
          <div className="am-banner" role="status">
            <span className="am-badge am-badge--pending">{isletmeApp.rejectedBadge}</span>
            <p className="t-sm" style={{ marginTop: 8 }}>
              {isletmeApp.rejectedBody}
            </p>
          </div>
        ) : null}
        <div className="am-work">{children}</div>
      </main>
      <nav className="am-dash-tabbar" aria-label={isletmeApp.loginTitle}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            className={`am-tab${isOn(pathname ?? "", link.href) ? " is-on" : ""}`}
            href={link.href}
            onClick={() => setNavDirection("tab")}
          >
            <NavIcon name={link.icon} large />
            <span>{link.short}</span>
          </Link>
        ))}
      </nav>
      <span className="sr-only">{site.regionLine}</span>
    </div>
  );
}
