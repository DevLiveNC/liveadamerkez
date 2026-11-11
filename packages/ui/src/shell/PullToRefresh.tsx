"use client";

import { useCallback, useRef, useState, type CSSProperties, type ReactNode, type TouchEvent } from "react";
import { cx } from "../cx.js";

const THRESHOLD = 56;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

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
  const startY = useRef(0);
  const pulling = useRef(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const finish = useCallback(async () => {
    pulling.current = false;
    startY.current = 0;
    if (offset >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setOffset(THRESHOLD);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
        setOffset(0);
      }
      return;
    }
    setOffset(0);
  }, [offset, onRefresh, refreshing]);

  function onTouchStart(event: TouchEvent<HTMLElement>) {
    if (disabled || refreshing) return;
    const target = event.currentTarget;
    if (target.scrollTop > 0) return;
    startY.current = event.touches[0]?.clientY ?? 0;
    pulling.current = true;
  }

  function onTouchMove(event: TouchEvent<HTMLElement>) {
    if (!pulling.current || disabled) return;
    const y = event.touches[0]?.clientY ?? 0;
    const dy = y - startY.current;
    if (dy <= 0 || event.currentTarget.scrollTop > 0) {
      setOffset(0);
      return;
    }
    const next = Math.min(dy * 0.42, 80);
    setOffset(prefersReducedMotion() ? Math.min(next, 8) : next);
  }

  function onTouchEnd() {
    if (!pulling.current) return;
    void finish();
  }

  const status = refreshing ? refreshingLabel : offset >= THRESHOLD ? releaseLabel : label;
  const reduce = prefersReducedMotion();
  const mainStyle: CSSProperties | undefined =
    offset && !refreshing && !reduce ? { transform: `translateY(${Math.round(offset)}px)` } : undefined;

  return (
    <div className={cx("am-ui-ptr", (offset > 8 || refreshing) && "is-pulling", refreshing && "is-refreshing")}>
      <div
        className="am-ui-ptr-indicator"
        aria-live={offset > 8 || refreshing ? "polite" : undefined}
        role={offset > 8 || refreshing ? "status" : undefined}
        style={{ height: refreshing || offset > 8 ? Math.max(offset, refreshing ? THRESHOLD : offset) : 0 }}
      >
        {offset > 8 || refreshing ? status : null}
      </div>
      <main
        id={mainId}
        className={cx("am-ui-main", mainClassName)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
        style={mainStyle}
      >
        {children}
      </main>
    </div>
  );
}
