"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { panel, site, ui } from "@ada-merkez/copy";
import { BottomSheet, DekorNavCorner } from "@ada-merkez/ui";
import { setNavDirection } from "../../lib/app-nav";
import { clearAppCaches } from "../../lib/clear-app-caches";
import { PANEL_UPDATE, refreshPanels } from "../../lib/panel-api";
import { ICON_SRC } from "../Logo";
import { LocalClock } from "./LocalClock";
import { useOnline } from "./use-panel-data";
import { PanelFeedback } from "./PanelKit";

export type PanelLink = {
  href: string;
  label: string;
  short: string;
  icon: ReactNode;
};

export function PanelShell({
  kind,
  root,
  name,
  roleLabel,
  links,
  primary,
  children,
  banner,
}: {
  kind: "isletme" | "yonetim";
  root: string;
  name: string;
  roleLabel: string;
  links: readonly PanelLink[];
  primary: readonly string[];
  children: ReactNode;
  banner?: ReactNode;
}) {
  const pathname = usePathname() ?? root;
  const router = useRouter();
  const online = useOnline();
  const [more, setMore] = useState(false);
  const [update, setUpdate] = useState(false);
  const [updateDismissed, setUpdateDismissed] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const active = links.find((link) =>
    link.href === root
      ? pathname === root
      : pathname.startsWith(`${link.href}/`) || pathname === link.href,
  );
  const tabs = primary
    .map((href) => links.find((link) => link.href === href)!)
    .filter(Boolean);
  const secondary = links.filter((link) => !primary.includes(link.href));

  useEffect(() => {
    setMore(false);
  }, [pathname]);
  useEffect(() => {
    const check = () => {
      if (!("serviceWorker" in navigator)) return;
      void navigator.serviceWorker
        .getRegistration("/app")
        .then((registration) => {
          if (registration?.waiting) {
            setUpdate(true);
            setUpdateDismissed(false);
          }
        })
        .catch(() => undefined);
    };
    check();
    window.addEventListener(PANEL_UPDATE, check);
    return () => window.removeEventListener(PANEL_UPDATE, check);
  }, []);

  async function applyUpdate() {
    if (updating) return;
    setUpdating(true);
    setUpdateError(null);
    try {
      const registration =
        await navigator.serviceWorker?.getRegistration("/app");
      if (registration?.waiting) {
        const worker = registration.waiting;
        await new Promise<void>((resolve) => {
          const done = () => {
            window.clearTimeout(timer);
            navigator.serviceWorker.removeEventListener(
              "controllerchange",
              done,
            );
            resolve();
          };
          const timer = window.setTimeout(done, 5000);
          navigator.serviceWorker.addEventListener("controllerchange", done);
          worker.postMessage({ type: "SKIP_WAITING" });
        });
      }
      window.location.reload();
    } catch {
      setUpdateError(panel.updateError);
      setUpdating(false);
    }
  }

  async function logout() {
    if (leaving) return;
    setLeaving(true);
    setLogoutError(null);
    try {
      const response = await fetch("/app/api/oturum", {
        method: "DELETE",
        credentials: "same-origin",
        cache: "no-store",
      });
      if (!response.ok) throw new Error("logout");
      await clearAppCaches();
      router.replace(`/app/giris?rol=${kind}`);
      router.refresh();
    } catch {
      setLogoutError(panel.logoutError);
      setLeaving(false);
    }
  }

  function nav(link: PanelLink, mobile = false) {
    const on = active?.href === link.href;
    return (
      <Link
        key={link.href}
        href={link.href}
        className={
          mobile
            ? `am-tab${on ? " is-on" : ""}`
            : `am-side-link${on ? " is-on" : ""}`
        }
        aria-current={on ? "page" : undefined}
        onClick={() => {
          setNavDirection("tab");
          setMore(false);
        }}
      >
        {link.icon}
        <span>{mobile ? link.short : link.label}</span>
      </Link>
    );
  }

  return (
    <div className={`${kind}-app am-dash pn-shell`}>
      <aside className="am-side side-nav">
        <Link href={root} className="am-side-brand">
          {/* eslint-disable-next-line @next/next/no-img-element -- shared SVG brand asset */}
          <img src={ICON_SRC} width={40} height={40} alt="" />
          <div>
            <strong>{name}</strong>
            <span>{roleLabel}</span>
          </div>
        </Link>
        <nav className="am-side-nav" aria-label={roleLabel}>
          {links.map((link) => nav(link))}
        </nav>
        <div className="pn-side-tools">
          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(new Event("am:install-request"))
            }
          >
            {panel.install}
          </button>
        </div>
        <div className="am-side-foot">
          <div className="pn-account-dot" aria-hidden="true">
            {name.trim().slice(0, 1).toLocaleUpperCase("tr-TR")}
          </div>
          <button
            type="button"
            disabled={leaving || !online}
            onClick={() => {
              void logout();
            }}
          >
            <strong>{name}</strong>
            <span>
              {leaving
                ? panel.sending
                : online
                  ? panel.logoutAction
                  : panel.offlineShort}
            </span>
          </button>
        </div>
        <DekorNavCorner />
      </aside>
      <main id={`${kind}-icerik`} className="am-main" tabIndex={-1}>
        <header className="am-topbar">
          <div className="am-work-title-row">
            <span className="pn-mobile-mark" aria-hidden="true">
              A
            </span>
            <h1>{active?.label ?? roleLabel}</h1>
          </div>
          <div className="am-topbar-meta">
            <LocalClock />
            <span className={`pn-connection${online ? "" : " is-offline"}`}>
              <i aria-hidden="true" />
              {online ? panel.online : panel.offlineShort}
            </span>
            <button
              className="pn-refresh"
              type="button"
              disabled={!online}
              onClick={refreshPanels}
              aria-label={panel.refresh}
            >
              <svg className="am-icon" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20 7v5h-5M4 17v-5h5M6.1 7a7 7 0 0 1 11.6-1L20 9M4 15l2.3 3A7 7 0 0 0 18 17" />
              </svg>
            </button>
          </div>
        </header>
        {!online ? (
          <div className="pn-offline" role="status">
            {panel.offline}
          </div>
        ) : null}
        {update && !updateDismissed ? (
          <div className="pn-update" role="status">
            <div>
              <strong>{panel.updateTitle}</strong>
              <p>{panel.updateBody}</p>
            </div>
            <button
              type="button"
              className="am-btn am-btn--primary am-btn--sm"
              disabled={updating}
              onClick={() => {
                void applyUpdate();
              }}
            >
              {updating ? panel.refreshing : panel.updateAction}
            </button>
            <button
              type="button"
              className="am-btn am-btn--ghost am-btn--sm"
              onClick={() => setUpdateDismissed(true)}
            >
              {panel.later}
            </button>
          </div>
        ) : null}
        {updateError ? (
          <div className="pn-logout">
            <PanelFeedback error={updateError} />
          </div>
        ) : null}
        {banner}
        <div className="pn-logout">
          <PanelFeedback error={logoutError} />
        </div>
        <div className="am-work pn-work">{children}</div>
        <footer className="pn-work-footer">
          <span>{site.regionLine}</span>
          <button
            type="button"
            disabled={leaving || !online}
            onClick={() => {
              void logout();
            }}
          >
            {leaving ? panel.sending : panel.logoutAction}
          </button>
        </footer>
      </main>
      <nav className="am-dash-tabbar" aria-label={roleLabel}>
        {tabs.map((link) => nav(link, true))}
        <button
          type="button"
          className={`am-tab${secondary.some((link) => link.href === pathname) ? " is-on" : ""}`}
          aria-haspopup="dialog"
          aria-expanded={more}
          onClick={() => setMore(true)}
        >
          <svg
            className="am-icon am-icon-lg"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle cx="5" cy="12" r="1" />
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
          </svg>
          <span>{panel.more}</span>
        </button>
      </nav>
      <BottomSheet
        open={more}
        onClose={() => setMore(false)}
        title={panel.moreTitle}
        closeLabel={ui.close}
        className="pn-more-sheet"
      >
        <nav aria-label={panel.moreTitle} className="pn-more-links">
          {secondary.map((link) => nav(link))}
        </nav>
        <button
          type="button"
          className="am-btn am-btn--ghost am-btn--block"
          onClick={() => {
            setMore(false);
            window.dispatchEvent(new Event("am:install-request"));
          }}
        >
          {panel.install}
        </button>
        <button
          type="button"
          className="am-btn am-btn--ghost am-btn--block"
          disabled={leaving || !online}
          onClick={() => {
            void logout();
          }}
        >
          {leaving ? panel.sending : panel.logoutAction}
        </button>
        <PanelFeedback error={logoutError} />
      </BottomSheet>
    </div>
  );
}
