"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "./cx.js";

const FOCUSABLE =
  "a\u005Bhref], button:not(\u005Bdisabled]), textarea, input, select, \u005Btabindex]:not(\u005Btabindex=\"-1\"])";

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
  const generatedId = useId();
  const headingId = titleId ?? generatedId;

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>(FOCUSABLE);
    first?.focus();

    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const nodes = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)].filter(
        (el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true",
      );
      if (nodes.length === 0) return;
      const firstNode = nodes[0];
      const lastNode = nodes[nodes.length - 1];
      if (!firstNode || !lastNode) return;
      if (event.shiftKey && document.activeElement === firstNode) {
        event.preventDefault();
        lastNode.focus();
      } else if (!event.shiftKey && document.activeElement === lastNode) {
        event.preventDefault();
        firstNode.focus();
      }
    }

    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      lastFocus.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="am-overlay" role="presentation">
      <button type="button" className="am-overlay" style={{ position: "absolute", inset: 0, zIndex: 0 }} aria-label={closeLabel} onClick={onClose} />
      <div
        ref={panelRef}
        className={cx("am-sheet", className)}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
      >
        <div className="am-sheet-handle" aria-hidden="true" />
        <div className="am-sheet-head">
          {title ? <h2 id={headingId}>{title}</h2> : <span id={headingId} className="visually-hidden">{closeLabel}</span>}
          <button type="button" className="am-icon-btn am-icon-btn--ghost" aria-label={closeLabel} onClick={onClose}>
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
