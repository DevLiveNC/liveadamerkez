"use client";

import { useEffect, useRef } from "react";

/** will-change yalnızca kaydırma sırasında. prefers-reduced-motion kapalı. */
export function useDekorParallax(speed: number) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !speed) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let idle = 0;
    const apply = (active: boolean) => {
      if (reduce.matches) {
        el.style.transform = "";
        el.style.willChange = "";
        return;
      }
      el.style.willChange = active ? "transform" : "";
      const vh = window.innerHeight || 800;
      const r = el.getBoundingClientRect();
      let offset = (r.top + r.height / 2 - vh / 2) * speed;
      if (offset > 16) offset = 16;
      if (offset < -16) offset = -16;
      el.style.transform = `translate3d(0,${offset.toFixed(1)}px,0)`;
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        apply(true);
        window.clearTimeout(idle);
        idle = window.setTimeout(() => {
          el.style.willChange = "";
        }, 180);
      });
    };
    const onReduce = () => apply(false);
    apply(false);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    reduce.addEventListener("change", onReduce);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      reduce.removeEventListener("change", onReduce);
      if (frame) window.cancelAnimationFrame(frame);
      window.clearTimeout(idle);
      el.style.transform = "";
      el.style.willChange = "";
    };
  }, [speed]);
  return ref;
}
