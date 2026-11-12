"use client";

import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { UiIcon } from "@ada-merkez/ui";
import {
  currentRouteKey,
  lastDiscoverPath,
  readStack,
  resolveBack,
  setNavDirection,
} from "../../lib/app-nav";

/** Aynı anda iki geri isteğini yut: çift dokunma iki ekran atlamasın. */
const BACK_LOCK_MS = 700;

/**
 * Tek tip geri düğmesi: 44×44 cam yüzey, lacivert ikon.
 *
 * Davranış sırası:
 * 1. Uygulama içi önceki ekran varsa tarayıcı geçmişi (kaydırma korunur)
 * 2. Yoksa (PWA kısayolu / dış bağlantı) `fallback` ya da son keşif sorgusu
 * 3. O da yoksa rotanın üst ekranı
 *
 * JavaScript yokken `<a href>` olarak çalışır: bağlantı hiç ölü kalmaz.
 */
export function BackButton({
  fallback,
  label,
  className,
  icon,
  onNavigate,
}: {
  fallback?: string;
  label: string;
  className?: string;
  icon?: ReactNode;
  onNavigate?: () => void;
}) {
  const router = useRouter();
  const locked = useRef(false);
  const [href, setHref] = useState(() => fallback ?? "/app");

  useEffect(() => {
    if (fallback) {
      setHref(fallback);
      return;
    }
    setHref(lastDiscoverPath());
  }, [fallback]);

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (locked.current) return;
    locked.current = true;
    window.setTimeout(() => {
      locked.current = false;
    }, BACK_LOCK_MS);

    onNavigate?.();
    setNavDirection("back");
    const decision = resolveBack({ stack: readStack(), current: currentRouteKey(), fallback: href });
    if (decision.type === "back") {
      router.back();
      return;
    }
    if (decision.type === "replace") router.replace(decision.href);
  }

  return (
    <a
      href={href}
      className={className ? `atla-glass-btn am-back ${className}` : "atla-glass-btn am-back"}
      aria-label={label}
      onClick={onClick}
      data-am-back=""
    >
      {icon ?? <UiIcon name="back" />}
    </a>
  );
}
