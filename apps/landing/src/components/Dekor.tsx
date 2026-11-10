"use client";

import { useEffect } from "react";

type DekorName =
  | "kum-tepecigi"
  | "palmiye"
  | "begonvil"
  | "tarak-kabuk"
  | "sarmal-kabuk"
  | "dalga"
  | "kopuk-serit"
  | "zeytin-dali"
  | "deniz-yildizi"
  | "ayak-izi";

/** Masaüstü WebP doğal ölçüler (CLS için width/height). */
const DESK: Record<DekorName, { w: number; h: number }> = {
  "kum-tepecigi": { w: 919, h: 342 },
  palmiye: { w: 770, h: 749 },
  begonvil: { w: 1002, h: 599 },
  "tarak-kabuk": { w: 585, h: 508 },
  "sarmal-kabuk": { w: 552, h: 494 },
  dalga: { w: 950, h: 518 },
  "kopuk-serit": { w: 1516, h: 143 },
  "zeytin-dali": { w: 743, h: 665 },
  "deniz-yildizi": { w: 592, h: 549 },
  "ayak-izi": { w: 1516, h: 132 },
};

/** Mobil *-m.webp doğal ölçüler. */
const MOB: Record<DekorName, { w: number; h: number }> = {
  "kum-tepecigi": { w: 621, h: 231 },
  palmiye: { w: 520, h: 506 },
  begonvil: { w: 640, h: 383 },
  "tarak-kabuk": { w: 395, h: 343 },
  "sarmal-kabuk": { w: 373, h: 334 },
  dalga: { w: 640, h: 349 },
  "kopuk-serit": { w: 640, h: 60 },
  "zeytin-dali": { w: 502, h: 449 },
  "deniz-yildizi": { w: 400, h: 371 },
  "ayak-izi": { w: 640, h: 56 },
};

export function DekorImg({
  name,
  className,
  eager = false,
  speed,
}: {
  name: DekorName;
  className?: string;
  eager?: boolean;
  speed?: number;
}) {
  const desk = DESK[name];
  const mob = MOB[name];
  return (
    <picture className={className} data-speed={speed ?? undefined}>
      <source
        media="(max-width: 860px)"
        srcSet={`/landing/dekor/${name}-m.webp`}
        width={mob.w}
        height={mob.h}
        type="image/webp"
      />
      <img
        src={`/landing/dekor/${name}.webp`}
        alt=""
        width={desk.w}
        height={desk.h}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        draggable={false}
      />
    </picture>
  );
}

export function DekorBand({
  kind,
  side,
  className,
}: {
  kind: "dalga" | "kopuk-serit" | "ayak-izi";
  side?: "zeytin-dali" | "deniz-yildizi";
  className?: string;
}) {
  const speed = kind === "dalga" ? 0.18 : kind === "ayak-izi" ? 0.08 : 0.1;
  return (
    <div className={`dekor-band dekor-band--${kind}${className ? ` ${className}` : ""}`} aria-hidden="true">
      <DekorImg name={kind} className={`dekor dekor-strip dekor-strip--${kind}`} speed={speed} />
      {side === "zeytin-dali" ? <DekorImg name="zeytin-dali" className="dekor dekor-olive dekor-desk" speed={0.16} /> : null}
      {side === "deniz-yildizi" ? <DekorImg name="deniz-yildizi" className="dekor dekor-star dekor-desk" speed={0.12} /> : null}
    </div>
  );
}

/** README paralaks hızları; prefers-reduced-motion’da kapalı. */
export function DekorMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const apply = () => {
      const nodes = document.querySelectorAll<HTMLElement>("picture.dekor");
      if (reduce.matches) {
        nodes.forEach((el) => {
          el.style.transform = "";
        });
        return;
      }
      const mid = window.innerHeight / 2;
      nodes.forEach((el) => {
        const speed = Number(el.dataset.speed);
        if (!speed) return;
        const rect = el.getBoundingClientRect();
        const delta = (rect.top + rect.height / 2 - mid) * speed * 0.35;
        el.style.transform = `translate3d(0, ${delta.toFixed(1)}px, 0)`;
      });
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        apply();
      });
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    reduce.addEventListener("change", apply);
    return () => {
      window.removeEventListener("scroll", onScroll);
      reduce.removeEventListener("change", apply);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);
  return null;
}
