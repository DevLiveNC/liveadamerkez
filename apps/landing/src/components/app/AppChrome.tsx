"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useMemo } from "react";
import { app, nav, ui } from "@ada-merkez/copy";
import {
  AppShell,
  BottomNav,
  PullToRefresh,
  TopBar,
  UiIcon,
  shouldReduceMotion,
  type BottomNavItem,
} from "@ada-merkez/ui";
import { Logo } from "../Logo";
import { AppSwRegister } from "./AppSwRegister";
import { AppInstallSheet } from "./AppInstallSheet";
import { AppLaunch } from "./AppLaunch";
import { AppScrollMemory } from "./AppScrollMemory";
import { BackButton } from "./BackButton";
import { PageTransition } from "./PageTransition";
import { useKeyboardInset } from "./useKeyboardInset";
import {
  installNavIntentListeners,
  navDirection,
  normalizeKey,
  recordNavigation,
  rememberDiscover,
  rememberScroll,
  setNavDirection,
} from "../../lib/app-nav";

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

function isRootTab(pathname: string): boolean {
  return pathname === "/app" || pathname.startsWith("/app/isletmeler");
}

/** Sekmeye yeniden dokununca içerik başa döner (iOS davranışı). */
function scrollMainToTop() {
  const main = document.getElementById("icerik");
  if (!main) return;
  main.scrollTo({ top: 0, behavior: shouldReduceMotion() ? "auto" : "smooth" });
}

export function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/app";
  const searchParams = useSearchParams();
  const search = searchParams?.toString() ?? "";
  const routeKey = useMemo(() => normalizeKey(pathname, search), [pathname, search]);
  const router = useRouter();

  const isPanel =
    pathname === "/app/isletme" ||
    pathname.startsWith("/app/isletme/") ||
    pathname === "/app/yonetim" ||
    pathname.startsWith("/app/yonetim/") ||
    pathname.startsWith("/app/yonetici");
  const isAuth = pathname.startsWith("/app/giris");
  const isLegal = pathname.startsWith("/app/yasal");
  /* Talep onayı ve yasal metinler odaklanmış ekranlardır: sekme şeridi yok. */
  const bookingSent = /^\/app\/randevular\/[^/]+$/.test(pathname);
  const hideChrome = isPanel || isAuth || bookingSent || isLegal;
  const showTabbar = !hideChrome;
  const hideCustomerTop =
    hideChrome ||
    pathname === "/app" ||
    pathname.startsWith("/app/isletmeler") ||
    pathname.startsWith("/app/randevular") ||
    pathname.startsWith("/app/favoriler") ||
    pathname.startsWith("/app/hesap");

  useKeyboardInset();

  /* Tarayıcı yön ipuçları: tıklama = ileri, popstate = geri. */
  useEffect(() => installNavIntentListeners(), []);

  /* Gezinme yığını: geri düğmesinin "anlamlı ekran" kararı buna dayanır. */
  useEffect(() => {
    recordNavigation(routeKey, navDirection());
    rememberDiscover(routeKey);
  }, [routeKey]);

  const items: BottomNavItem[] = TABS.map((tab) => ({
    href: tab.href,
    label: tab.label,
    icon: <UiIcon name={tab.icon} />,
    current: tab.match(pathname),
  }));

  /* Kaydırma kabı kimliği tek yerden türetilir: atlama bağlantısı, kaydırma
     hafızası ve "başa dön" aynı öğeyi hedeflesin. (Eski kodda işletme detay
     ekranı da "isletme-icerik" alıyordu; oysa o ekranın kabuğu `icerik`
     üretiyor, atlama bağlantısı boşa gidiyordu.) */
  const mainId = pathname.startsWith("/app/yonetim") || pathname.startsWith("/app/yonetici")
    ? "yonetim-icerik"
    : isPanel
      ? "isletme-icerik"
      : "icerik";

  return (
    <AppShell
      className="am-shell"
      skipHref={`#${mainId}`}
      skipLabel={ui.skipToContent}
      header={
        hideCustomerTop ? null : (
          <TopBar className="am-top" blur>
            {isRootTab(pathname) ? null : <BackButton label={app.back} className="am-top__back" />}
            <Link href="/app" aria-label={app.title} className="am-top__brand">
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
        showTabbar ? (
          <BottomNav
            className="am-tabs"
            label={app.navAria}
            items={items}
            renderItem={(item, className) => (
              <Link
                href={item.href}
                className={className}
                aria-current={item.current ? "page" : undefined}
                onClick={(event) => {
                  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
                  event.preventDefault();
                  if (item.current) {
                    /* Etkin sekmede: kök ekrandaysa başa dön, alt ekrandaysa
                       köke çık (iOS sekme davranışı). */
                    if (pathname === item.href) {
                      scrollMainToTop();
                      return;
                    }
                  }
                  const main = document.getElementById(mainId);
                  if (main) rememberScroll(routeKey, main.scrollTop);
                  setNavDirection("tab");
                  router.push(item.href, { scroll: false });
                }}
              >
                {item.icon}
                <span className="am-tab-label">{item.label}</span>
              </Link>
            )}
          />
        ) : null
      }
    >
      {hideChrome ? (
        isAuth ? (
          <main id="icerik" className="am-main am-ui-main">
            {children}
          </main>
        ) : (
          <>
            {children}
            <AppScrollMemory routeKey={routeKey} mainId={mainId} />
          </>
        )
      ) : (
        <Fragment>
          <PullToRefresh
            onRefresh={() => router.refresh()}
            label={ui.pullToRefresh}
            releaseLabel={ui.releaseToRefresh}
            refreshingLabel={ui.refreshing}
            mainClassName={showTabbar ? "am-main am-has-tabbar" : "am-main"}
            mainId={mainId}
          >
            <PageTransition routeKey={routeKey}>{children}</PageTransition>
          </PullToRefresh>
          <AppScrollMemory routeKey={routeKey} mainId={mainId} />
        </Fragment>
      )}
      <AppSwRegister />
      <AppInstallSheet />
      <AppLaunch />
    </AppShell>
  );
}
