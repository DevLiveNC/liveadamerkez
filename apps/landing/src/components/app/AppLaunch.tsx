"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AppOnboarding } from "./AppOnboarding";
import { AppSplash } from "./AppSplash";
import {
  ONBOARDING_KEY,
  SPLASH_SESSION_KEY,
  shouldPlaySplash,
  shouldShowOnboarding,
} from "../../lib/splash-timing";

function hideLaunch(pathname: string): boolean {
  return (
    pathname.startsWith("/app/giris") ||
    pathname === "/app/isletme" ||
    pathname.startsWith("/app/isletme/") ||
    pathname === "/app/yonetim" ||
    pathname.startsWith("/app/yonetim/") ||
    pathname.startsWith("/app/yonetici")
  );
}

export function AppLaunch() {
  const pathname = usePathname() ?? "/app";
  const [splash, setSplash] = useState(false);
  const [onboard, setOnboard] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSplash(shouldPlaySplash(sessionStorage, window.location.search));
    setOnboard(shouldShowOnboarding(localStorage));
    setReady(true);
  }, []);

  const finishSplash = useCallback(() => {
    try {
      sessionStorage.setItem(SPLASH_SESSION_KEY, "1");
    } catch {
      /* gizli */
    }
    setSplash(false);
  }, []);

  const finishOnboarding = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_KEY, "1");
    } catch {
      /* gizli */
    }
    setOnboard(false);
  }, []);

  if (hideLaunch(pathname) || !ready) return null;

  return (
    <>
      {splash ? <AppSplash onDone={finishSplash} /> : null}
      {!splash && onboard ? <AppOnboarding onDone={finishOnboarding} /> : null}
    </>
  );
}
