"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { app, nav, ui } from "@ada-merkez/copy";
import {
  AppShell,
  BottomNav,
  PageFade,
  PullToRefresh,
  TopBar,
  UiIcon,
  startAppTransition,
  type BottomNavItem,
} from "@ada-merkez/ui";
import { Logo } from "../Logo";
import { AppSwRegister } from "./AppSwRegister";
import { AppInstallSheet } from "./AppInstallSheet";
import { AppLaunch } from "./AppLaunch";

const TABS = [
  {
    href: "/app",
    label: app.discover,
    icon: "home" as const,
    match: (p: string) => p === "/app" || p.startsWith("/app/isletmeler"),
  },
  {
    href: "/app/randevular",
    label: app.bookings,
    icon: "calendar" as const,
    match: (p: string) => p.startsWith("/app/randevular"),
  },
  {
    href: "/app/favoriler",
    label: app.favorites,
    icon: "heart" as const,
    match: (p: string) => p.startsWith("/app/favoriler"),
  },
  {
    href: "/app/hesap",
    label: app.account,
    icon: "user" as const,
    match: (p: string) => p.startsWith("/app/hesap"),
  },
] as const;

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/app";
  const router = useRouter();
  const isPanel =
    pathname === "/app/isletme" ||
    pathname.startsWith("/app/isletme/") ||
    pathname === "/app/yonetim" ||
    pathname.startsWith("/app/yonetim/") ||
    pathname.startsWith("/app/yonetici");
  const isAuth = pathname.startsWith("/app/giris");
  const bookingSent = /^\/app\/randevular\/[^/]+$/.test(pathname);
  const hideChrome = isPanel || isAuth || bookingSent;
  const hideCustomerTop =
    hideChrome ||
    pathname === "/app" ||
    pathname.startsWith("/app/isletmeler") ||
    pathname.startsWith("/app/randevular") ||
    pathname.startsWith("/app/favoriler") ||
    pathname.startsWith("/app/hesap");

  const items: BottomNavItem[] = TABS.map((tab) => ({
    href: tab.href,
    label: tab.label,
    icon: <UiIcon name={tab.icon} />,
    current: tab.match(pathname),
  }));

  return (
    <AppShell
      className="am-shell"
      skipHref={
        pathname.startsWith("/app/yonetim")
          ? "#yonetim-icerik"
          : isPanel
            ? "#isletme-icerik"
            : "#icerik"
      }
      skipLabel={ui.skipToContent}
      header={
        hideCustomerTop ? null : (
          <TopBar className="am-top" blur>
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
          </TopBar>
        )
      }
      footer={
        hideChrome ? null : (
          <BottomNav
            className="am-tabs am-tabbar"
            label={app.navAria}
            items={items}
            renderItem={(item, className) => (
              <Link
                href={item.href}
                className={className}
                aria-current={item.current ? "page" : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                  if (item.current) {
                    event.preventDefault();
                    return;
                  }
                  event.preventDefault();
                  startAppTransition(() => {
                    router.push(item.href);
                  });
                }}
              >
                {item.icon}
                <span className="am-tab-label">{item.label}</span>
              </Link>
            )}
          />
        )
      }
    >
      {hideChrome ? (
        isAuth ? (
          <main id="icerik" className="am-main am-ui-main">
            {children}
          </main>
        ) : (
          children
        )
      ) : (
        <PullToRefresh
          onRefresh={() => router.refresh()}
          label={ui.pullToRefresh}
          releaseLabel={ui.releaseToRefresh}
          refreshingLabel={ui.refreshing}
          mainClassName="am-main"
        >
          <PageFade key={pathname}>{children}</PageFade>
        </PullToRefresh>
      )}
      <AppSwRegister />
      <AppInstallSheet />
      <AppLaunch />
    </AppShell>
  );
}
