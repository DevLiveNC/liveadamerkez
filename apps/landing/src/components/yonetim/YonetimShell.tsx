"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { site, yonetimApp } from "@ada-merkez/copy";
import { DekorNavCorner } from "@ada-merkez/ui";
import { ICON_SRC } from "../Logo";
import type { AppSession } from "../../lib/app-auth";
import { LocalClock } from "../panel/LocalClock";
import {
  IconApprove,
  IconOverview,
  IconReports,
  IconSystem,
  IconUsers,
} from "../panel/icons";

const LINKS = [
  { href: "/app/yonetim", label: yonetimApp.navOverview, short: yonetimApp.navOverviewShort, icon: "overview" },
  { href: "/app/yonetim/onaylar", label: yonetimApp.navApprovalsLong, short: yonetimApp.navApprovalsShort, icon: "approve" },
  { href: "/app/yonetim/kullanicilar", label: yonetimApp.navUsers, short: yonetimApp.navUsers, icon: "users" },
  { href: "/app/yonetim/raporlar", label: yonetimApp.navReports, short: yonetimApp.navReports, icon: "reports" },
  { href: "/app/yonetim/sistem", label: yonetimApp.navHealth, short: yonetimApp.navHealth, icon: "system" },
] as const;

const EXTRA_TITLES: Record<string, string> = {
  "/app/yonetim/kiracilar": yonetimApp.tenantsTitle,
  "/app/yonetim/rezervasyonlar": yonetimApp.bookingsTitle,
  "/app/yonetim/icerik": yonetimApp.contentTitle,
  "/app/yonetim/denetim": yonetimApp.auditTitle,
};

function isOn(pathname: string, href: string) {
  if (href === "/app/yonetim") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavIcon({ name, large }: { name: string; large?: boolean }) {
  const cls = large ? "am-icon am-icon-lg" : "am-icon";
  if (name === "overview") return <IconOverview className={cls} />;
  if (name === "approve") return <IconApprove className={cls} />;
  if (name === "users") return <IconUsers className={cls} />;
  if (name === "reports") return <IconReports className={cls} />;
  return <IconSystem className={cls} />;
}

function initial(name: string | null | undefined) {
  const ch = name?.trim()?.[0];
  return ch ? ch.toLocaleUpperCase("tr-TR") : "Y";
}

export function YonetimShell({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  const pathname = usePathname() ?? "/app/yonetim";
  const router = useRouter();
  const active = LINKS.find((link) => isOn(pathname, link.href));
  const title = active?.label ?? EXTRA_TITLES[pathname] ?? yonetimApp.loginTitle;

  async function logout() {
    await fetch("/app/api/oturum", { method: "DELETE", credentials: "same-origin" });
    router.replace("/app/giris?rol=yonetici");
    router.refresh();
  }

  return (
    <div className="yonetim-app am-dash">
      <aside className="am-side side-nav">
        <div className="am-side-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ICON_SRC} width={64} height={64} alt="" />
          <div>
            <strong>{site.name}</strong>
            <span>{yonetimApp.panelName}</span>
          </div>
        </div>
        <nav className="am-side-nav" aria-label={yonetimApp.panelName}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              className={`am-side-link${isOn(pathname, link.href) ? " is-on" : ""}`}
              href={link.href}
            >
              <NavIcon name={link.icon} />
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="am-side-foot">
          <div className="am-avatar" aria-hidden="true">
            {initial(session.name)}
          </div>
          <button type="button" onClick={() => void logout()}>
            <strong style={{ fontSize: 13 }}>{session.name || yonetimApp.who}</strong>
            <span style={{ display: "block", fontSize: 12, color: "var(--am-color-text-muted)" }}>
              {yonetimApp.logout}
            </span>
          </button>
        </div>
        <DekorNavCorner />
      </aside>
      <div className="am-main">
        <header className="am-topbar">
          <div className="am-work-title-row">
            <h1>{title}</h1>
          </div>
          <div className="am-topbar-meta">
            <LocalClock />
          </div>
        </header>
        <div className="am-work">{children}</div>
      </div>
      <nav className="am-dash-tabbar" aria-label={yonetimApp.panelName}>
        {LINKS.map((link) => (
          <Link
            key={link.href}
            className={`am-tab${isOn(pathname, link.href) ? " is-on" : ""}`}
            href={link.href}
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
