"use client";

import { useEffect } from "react";

/** iOS'ta klavye bu eşiğin altındaysa açık sayılmaz (adres çubuğu küçülmesi). */
const KEYBOARD_MIN = 120;

/**
 * Görsel görünüm takibi.
 *
 * iOS Safari'de klavye açıldığında düzen görünümü küçülmez; yüzen alt şerit
 * girdinin üstünde kalabilir. Burada köke `--am-keyboard-inset` yazılır ve
 * gövdeye `data-keyboard` işaretlenir; CSS şeridi gizler, kaydırma payını
 * ayarlar. `visualViewport` desteklenmiyorsa hiçbir şey değişmez.
 */
export function useKeyboardInset(): void {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const root = document.documentElement;
    let frame = 0;

    const apply = () => {
      frame = 0;
      const layoutHeight = window.innerHeight;
      const inset = Math.max(0, Math.round(layoutHeight - viewport.height - viewport.offsetTop));
      if (inset > 0) root.style.setProperty("--am-keyboard-inset", `${inset}px`);
      else root.style.removeProperty("--am-keyboard-inset");
      const open = inset >= KEYBOARD_MIN;
      document.body.dataset.keyboard = open ? "open" : "closed";
    };
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(apply);
    };

    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    window.addEventListener("orientationchange", schedule);
    schedule();

    return () => {
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("orientationchange", schedule);
      if (frame) window.cancelAnimationFrame(frame);
      root.style.removeProperty("--am-keyboard-inset");
      delete document.body.dataset.keyboard;
    };
  }, []);
}
