"use client";

import { useEffect, useRef } from "react";
import {
  currentRouteKey,
  flushScroll,
  navDirection,
  rememberScroll,
  scrollFor,
} from "../../lib/app-nav";

/**
 * Kaydırma konumu hatırlama.
 *
 * Kaydırma kabuğun içindeki `main` üzerinde olduğu için tarayıcının kendi
 * geri yüklemesi çalışmaz. Burada:
 * - geri/sekme geçişlerinde o rotanın son konumu geri yüklenir,
 * - ileri geçişlerde sayfa başına dönülür,
 * - hash varsa (#bildirimler) hedefe kaydırılır,
 * - konumlar bellekte tutulur, oturuma seyrek yazılır (kaydırma sırasında
 *   senkron depolama yapılmaz → takılma yok).
 *
 * Konum her kaydırmada bu rotanın anahtarına yazıldığı için, sayfadan
 * çıkarken ayrıca "önceki konumu kaydet" adımına gerek yoktur; DOM yeni
 * içerikle değiştiğinde okunan değer zaten yanlış olurdu.
 */
export function AppScrollMemory({ routeKey, mainId = "icerik" }: { routeKey: string; mainId?: string }) {
  const restoring = useRef(false);

  useEffect(() => {
    const host = document.getElementById(mainId);
    if (!host) return;

    const direction = navDirection();
    restoring.current = true;
    let frame = 0;
    let inner = 0;

    const apply = () => {
      const hash = window.location.hash;
      if (hash.length > 1) {
        const target = document.getElementById(decodeURIComponent(hash.slice(1)));
        if (target) {
          /* scroll-padding-top başlık payını zaten uygular. */
          target.scrollIntoView({ block: "start" });
          return;
        }
      }
      if (direction === "back" || direction === "tab") {
        host.scrollTop = scrollFor(routeKey) ?? 0;
        return;
      }
      host.scrollTop = 0;
    };

    /* İçerik aynı karede yerleşsin diye iki kare beklenir (RSC akışı). */
    frame = window.requestAnimationFrame(() => {
      apply();
      inner = window.requestAnimationFrame(() => {
        apply();
        restoring.current = false;
        flushScroll();
      });
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      if (inner) window.cancelAnimationFrame(inner);
      restoring.current = false;
    };
  }, [routeKey, mainId]);

  /* Kaydırma sırasında yalnız belleğe yazılır; geri yükleme sırasında susar. */
  useEffect(() => {
    const host = document.getElementById(mainId);
    if (!host) return;
    let frame = 0;
    const onScroll = () => {
      if (restoring.current || frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (restoring.current) return;
        rememberScroll(routeKey, host.scrollTop);
      });
    };
    host.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      host.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [routeKey, mainId]);

  /* Uygulama gizlenirken/kapanırken son konumlar kalıcı olsun. */
  useEffect(() => {
    const flush = () => {
      const host = document.getElementById(mainId);
      if (host) rememberScroll(currentRouteKey(), host.scrollTop);
      flushScroll();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    window.addEventListener("pagehide", flush);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("pagehide", flush);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [mainId]);

  return null;
}
