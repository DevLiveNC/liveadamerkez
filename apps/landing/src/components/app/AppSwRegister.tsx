"use client";

import { useEffect } from "react";
import { unregisterLegacyAppServiceWorkers } from "../../lib/pwa";

const RELOAD_KEY = "am_sw_reload_at";
/** Güncelleme kontrolü en fazla bu sıklıkta (ms). */
const UPDATE_CHECK_MS = 30 * 60 * 1000;
/** Kendi kendini yeniden yükleme döngüsüne karşı koruma. */
const RELOAD_GUARD_MS = 5 * 60 * 1000;

function reloadOnce(): boolean {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? 0);
    if (Date.now() - last < RELOAD_GUARD_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
    return true;
  } catch {
    return false;
  }
}

/**
 * Uygulama service worker'ı.
 *
 * - Kayıt kapsamı `/app`; eski `/app/` kayıtları temizlenir.
 * - Yeni sürüm devraldığında sayfa bir kez yenilenir: eski HTML + yeni
 *   parçalar karışıp kırık ekran oluşmaz.
 * - Gizli sekmede/özel modda kayıt hatası uygulamayı düşürmez.
 */
export function AppSwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    let cancelled = false;
    const hadController = Boolean(navigator.serviceWorker.controller);

    const onControllerChange = () => {
      if (cancelled || !hadController) return;
      if (!reloadOnce()) return;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    navigator.serviceWorker
      .register("/app/sw.js", { scope: "/app", updateViaCache: "none" })
      .then((registration) => {
        if (cancelled) return;
        void unregisterLegacyAppServiceWorkers(registration);
        void registration.update().catch(() => undefined);
      })
      .catch(() => {
        /* Service worker yoksa uygulama normal çalışır. */
      });

    let lastCheck = Date.now();
    const onVisible = () => {
      if (document.visibilityState !== "visible") return;
      if (Date.now() - lastCheck < UPDATE_CHECK_MS) return;
      lastCheck = Date.now();
      void navigator.serviceWorker.getRegistration("/app").then((registration) => {
        void registration?.update().catch(() => undefined);
      });
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      cancelled = true;
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return null;
}
