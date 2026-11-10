"use client";

import type { ReactNode } from "react";
import { SPRITES, SVG, type SpriteName } from "./assets.js";
import { useDesktop } from "./media.js";
import { useDekorParallax } from "./useParallax.js";

export function DekorSprite({
  name,
  className,
  parallax = 0,
  deskOnly = false,
  eager = false,
}: {
  name: SpriteName;
  className: string;
  parallax?: number;
  deskOnly?: boolean;
  eager?: boolean;
}) {
  const desktop = useDesktop();
  const ref = useDekorParallax(parallax);
  if (deskOnly && !desktop) return null;

  const asset = SPRITES[name];
  const deskSet = `${asset.src1x} 1x, ${asset.src2x} 2x`;
  const mobSet = `${asset.srcMob} 1x, ${asset.src2x} 2x`;
  const useEager = Boolean(eager && desktop);

  return (
    <div
      ref={ref}
      className={`am-dekor-item ${className}${deskOnly ? " am-dekor--desk-only" : ""}`}
      data-parallax={parallax || undefined}
      aria-hidden="true"
    >
      <picture>
        {deskOnly ? null : (
          <source media="(max-width: 860px)" type="image/webp" srcSet={mobSet} />
        )}
        <source media="(min-width: 861px)" type="image/webp" srcSet={deskSet} />
        <img
          data-am-dekor-sprite=""
          src={asset.src1x}
          srcSet={deskSet}
          alt=""
          width={asset.width2x}
          height={asset.height2x}
          decoding="async"
          loading={useEager ? "eager" : "lazy"}
          fetchPriority={useEager ? "low" : "auto"}
          draggable={false}
        />
      </picture>
    </div>
  );
}

export function DekorSvg({
  kind,
  className,
  width,
  height,
  parallax = 0,
}: {
  kind: "dalga" | "kopuk" | "ayakIzi";
  className: string;
  width: number;
  height: number;
  parallax?: number;
}) {
  const ref = useDekorParallax(parallax);
  return (
    <div
      ref={ref}
      className={`am-dekor-svg ${className}`}
      data-parallax={parallax || undefined}
      aria-hidden="true"
    >
      <img src={SVG[kind]} alt="" width={width} height={height} decoding="async" draggable={false} />
    </div>
  );
}

export function DekorBand({
  kind,
  parallax = 0,
  children,
}: {
  kind: "foam" | "wave" | "tracks";
  parallax?: number;
  children?: ReactNode;
}) {
  return (
    <div className={`am-dekor-band am-dekor-band--${kind}`} aria-hidden="true">
      {children ?? (
        kind === "foam" ? (
          <DekorSvg kind="kopuk" className="am-dekor--kopuk" width={1440} height={64} parallax={parallax} />
        ) : (
          <DekorSvg kind="dalga" className="am-dekor--dalga" width={1440} height={72} parallax={parallax} />
        )
      )}
    </div>
  );
}
