"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { navDirection } from "../../lib/app-nav";

function reducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Rota değişiminde tek, yön duyarlı giriş animasyonu.
 *
 * Çocuklar yeniden bağlanmaz (key yok): sunucu içeriği yerinde güncellenir,
 * yalnız sarmalayıcıya `data-enter` yazılır. Böylece:
 * - çift animasyon / arka plan sıçraması olmaz,
 * - yalnız opacity + transform kullanıldığı için düzen kaymaz,
 * - `prefers-reduced-motion` açıkken hiç animasyon çalışmaz.
 */
export function PageTransition({ routeKey, children }: { routeKey: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!mounted.current) {
      mounted.current = true;
      el.removeAttribute("data-enter");
      return;
    }
    el.removeAttribute("data-enter");
    if (reducedMotion()) return;
    // Animasyonu yeniden başlatmak için bir kare boya zorlanır.
    el.getBoundingClientRect();
    el.setAttribute("data-enter", navDirection());
  }, [routeKey]);

  return (
    <div ref={ref} className="am-ui-page">
      {children}
    </div>
  );
}
