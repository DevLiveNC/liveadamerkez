"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx.js";

/* Köşeli parantezler \u005B ile yazılır: seçici aynı kalır, kopya taraması
   CSS seçicisini yer tutucu sanmaz (depodaki yerleşik desen). */
const FOCUSABLE = [
  "a\u005Bhref]",
  "button:not(\u005Bdisabled])",
  "textarea:not(\u005Bdisabled])",
  "input:not(\u005Bdisabled]):not(\u005Btype='hidden'])",
  "select:not(\u005Bdisabled])",
  "\u005Btabindex]:not(\u005Btabindex='-1'])",
].join(",");

/** Kapanış animasyonu süresi (CSS ile aynı). */
const CLOSE_MS = 180;

function reducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function")
    return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Sayfanın kaydırma kabı: sheet açıkken arka plan kaymaz. */
function scrollHost(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return (
    document.querySelector<HTMLElement>("#icerik") ??
    document.querySelector<HTMLElement>("#isletme-icerik") ??
    document.querySelector<HTMLElement>("#yonetim-icerik") ??
    document.querySelector<HTMLElement>(".am-ui-main")
  );
}

/** Odaklanabilir öğeler. Görünür olmayanlar (display:none, hidden,
 *  aria-hidden) tuzağa alınmaz; aksi halde Tab "kayboluyor" gibi hissettirir. */

function visibleFocusables(root: HTMLElement): HTMLElement[] {
  return [...root.querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => {
    if (el.hasAttribute("disabled")) return false;
    if (el.getAttribute("aria-hidden") === "true") return false;
    if (el.closest("\u005Bhidden]")) return false;
    return el.offsetParent !== null || el === document.activeElement;
  });
}

export function BottomSheet({
  open,
  onClose,
  title,
  titleId,
  closeLabel,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  titleId?: string;
  closeLabel: string;
  children: ReactNode;
  className?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);
  /* Üst bileşen her render'ında yeni kapanış fonksiyonu verebilir; odak
     kilidi buna göre yeniden kurulmaz (panel saati her saniye tick eder). */
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  const generatedId = useId();
  const headingId = titleId ?? generatedId;
  const [mounted, setMounted] = useState(false);
  const [closing, setClosing] = useState(false);
  const wasOpen = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  /* Kapanış animasyonu: içerik hemen kaybolmaz, yumuşak kapanır. */
  useEffect(() => {
    if (open) {
      wasOpen.current = true;
      setClosing(false);
      return;
    }
    if (!wasOpen.current) return;
    wasOpen.current = false;
    if (reducedMotion()) {
      setClosing(false);
      return;
    }
    setClosing(true);
    const timer = window.setTimeout(() => setClosing(false), CLOSE_MS);
    return () => window.clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    lastFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const panel = panelRef.current;
    const first = panel ? visibleFocusables(panel)[0] : undefined;
    first?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = visibleFocusables(panel);
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!firstNode || !lastNode) {
        event.preventDefault();
        return;
      }
      const active = document.activeElement;
      const inside = active instanceof HTMLElement && panel.contains(active);
      if (!inside) {
        event.preventDefault();
        (event.shiftKey ? lastNode : firstNode).focus();
        return;
      }
      if (event.shiftKey && active === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && active === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    /* Gövde yerine gerçek kaydırma kabı kilitlenir: body zaten kilitli,
       asıl kayan içerik arkada kaymasın. */
    const host = scrollHost();
    const hostOverflow = host?.style.overflowY ?? "";
    const hostTop = host?.scrollTop ?? 0;
    if (host) host.style.overflowY = "hidden";
    const prevBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevBodyOverflow;
      if (host) {
        host.style.overflowY = hostOverflow;
        host.scrollTop = hostTop;
      }
      lastFocus.current?.focus();
    };
  }, [open]);

  if (!open && !closing) return null;
  if (!mounted) return null;

  const node = (
    <div
      className={cx("am-overlay", "am-sheet-root", closing && "is-closing")}
      role="presentation"
      data-state={open ? "open" : "closed"}
    >
      <button
        type="button"
        className="am-sheet-scrim"
        style={{ position: "absolute", inset: 0, zIndex: 0 }}
        aria-label={closeLabel}
        tabIndex={-1}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        className={cx("am-sheet", closing && "is-closing", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="am-sheet-handle" aria-hidden="true" />
        <div className="am-sheet-head">
          {title ? (
            <h2 id={headingId}>{title}</h2>
          ) : (
            <span id={headingId} className="visually-hidden">
              {closeLabel}
            </span>
          )}
          <button
            type="button"
            className="am-icon-btn am-icon-btn--ghost"
            aria-label={closeLabel}
            onClick={onClose}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );

  const host = document.querySelector(".am-shell") ?? document.body;
  return createPortal(node, host);
}
