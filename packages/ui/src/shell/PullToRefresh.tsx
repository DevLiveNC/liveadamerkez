"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent } from "react";
import { cx } from "../cx.js";

const THRESHOLD = 56;
const MAX_PULL = 80;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type Phase = "idle" | "pull" | "release" | "refreshing";

/**
 * Aşağı çekip yenileme.
 *
 * Eski sürüm her `touchmove` olayında React state'i güncelliyordu; bu, düşük
 * güçlü iPhone'larda kare düşürüyordu. Burada konum doğrudan DOM'a yazılır
 * (rAF ile birleştirilir), state yalnız eşik geçişlerinde değişir.
 * Yatay kaydırma (kart karuseli) algılanırsa jest iptal edilir.
 */
export function PullToRefresh({
  onRefresh,
  label,
  releaseLabel,
  refreshingLabel,
  children,
  disabled,
  mainId = "icerik",
  mainClassName,
}: {
  onRefresh: () => Promise<void> | void;
  label: string;
  releaseLabel: string;
  refreshingLabel: string;
  children: ReactNode;
  disabled?: boolean;
  mainId?: string;
  mainClassName?: string;
}) {
  const mainRef = useRef<HTMLElement>(null);
  const indicatorRef = useRef<HTMLDivElement>(null);
  const start = useRef({ x: 0, y: 0, active: false, horizontal: false });
  const offset = useRef(0);
  const frame = useRef(0);
  const refreshingRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");

  const paint = useCallback((value: number) => {
    const main = mainRef.current;
    const indicator = indicatorRef.current;
    if (main) {
      main.style.transform = value > 0 && !refreshingRef.current ? `translate3d(0, ${Math.round(value)}px, 0)` : "";
    }
    if (indicator) {
      indicator.style.height = value > 0 ? `${Math.round(value)}px` : "0px";
    }
  }, []);

  const schedule = useCallback(
    (value: number) => {
      offset.current = value;
      if (frame.current) return;
      frame.current = window.requestAnimationFrame(() => {
        frame.current = 0;
        paint(offset.current);
      });
    },
    [paint],
  );

  const reset = useCallback(() => {
    offset.current = 0;
    start.current.active = false;
    start.current.horizontal = false;
    paint(0);
    setPhase("idle");
  }, [paint]);

  const finish = useCallback(async () => {
    if (!start.current.active) return;
    start.current.active = false;
    if (offset.current < THRESHOLD || refreshingRef.current) {
      reset();
      return;
    }
    refreshingRef.current = true;
    setPhase("refreshing");
    paint(THRESHOLD);
    try {
      await onRefresh();
    } finally {
      refreshingRef.current = false;
      reset();
    }
  }, [onRefresh, paint, reset]);

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    if (disabled || refreshingRef.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    if (event.currentTarget.scrollTop > 0) return;
    start.current = { x: touch.clientX, y: touch.clientY, active: true, horizontal: false };
  }

  function onTouchMove(event: TouchEvent<HTMLElement>) {
    if (!start.current.active || disabled || refreshingRef.current) return;
    const touch = event.touches[0];
    if (!touch) return;
    const dx = touch.clientX - start.current.x;
    const dy = touch.clientY - start.current.y;
    if (!start.current.horizontal && Math.abs(dx) > Math.abs(dy) + 4) {
      /* Yatay jest (karusel): dikey çekme iptal. */
      start.current.horizontal = true;
      reset();
      return;
    }
    if (start.current.horizontal) return;
    if (dy <= 0 || event.currentTarget.scrollTop > 0) {
      if (offset.current !== 0) reset();
      return;
    }
    const reduce = prefersReducedMotion();
    const next = Math.min(dy * 0.42, reduce ? 8 : MAX_PULL);
    schedule(next);
    const nextPhase: Phase = next >= THRESHOLD ? "release" : "pull";
    if (next > 8 && phase !== nextPhase) setPhase(nextPhase);
    else if (next <= 8 && phase !== "idle") setPhase("idle");
  }

  function onTouchEnd() {
    if (!start.current.active) return;
    void finish();
  }

  useEffect(
    () => () => {
      if (frame.current) window.cancelAnimationFrame(frame.current);
    },
    [],
  );

  const showIndicator = offset.current > 8 || phase === "refreshing";
  const status =
    phase === "refreshing" ? refreshingLabel : phase === "release" ? releaseLabel : label;

  return (
    <div className={cx("am-ui-ptr", (offset.current > 8 || phase !== "idle") && "is-pulling", phase === "refreshing" && "is-refreshing")}>
      <div
        ref={indicatorRef}
        className="am-ui-ptr-indicator"
        aria-live={showIndicator ? "polite" : undefined}
        role={showIndicator ? "status" : undefined}
      >
        {showIndicator ? status : null}
      </div>
      <main
        ref={mainRef}
        id={mainId}
        className={cx("am-ui-main", mainClassName)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {children}
      </main>
    </div>
  );
}
