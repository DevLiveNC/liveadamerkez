"use client";

import { useEffect, useRef, useState } from "react";
import { splash } from "@ada-merkez/copy";
import {
  SPLASH_HANDOFF_MS,
  SPLASH_MAX_MS,
  SPLASH_MIN_READY_MS,
  SPLASH_REDUCED_MS,
  SPLASH_SETTLE_MS,
  prefersReducedMotion,
} from "../../lib/splash-timing";
import "./splash.css";

const MARK_PATH =
  "M65.0 -2.2 61.800000000000004 -21.400000000000002Q61.800000000000004 -22.400000000000002 60.6 -22.400000000000002H35.2Q34.0 -22.400000000000002 34.0 -21.400000000000002L30.8 -2.2Q30.6 0.0 28.200000000000003 0.0H4.800000000000001Q2.2 0.0 2.8000000000000003 -2.6L32.2 -137.8Q32.6 -140.0 34.800000000000004 -140.0H61.800000000000004Q64.0 -140.0 64.4 -137.8L93.60000000000001 -2.6L93.80000000000001 -1.8Q93.80000000000001 0.0 91.60000000000001 0.0H67.60000000000001Q65.2 0.0 65.0 -2.2ZM38.800000000000004 -44.2H56.800000000000004Q57.800000000000004 -44.2 57.6 -45.2L48.2 -99.80000000000001Q48.0 -100.4 47.6 -100.4Q47.2 -100.4 47.0 -99.80000000000001L38.0 -45.2Q38.0 -44.2 38.800000000000004 -44.2Z";

export function AppSplash({ onDone }: { onDone: () => void }) {
  const [handoff, setHandoff] = useState(false);
  const done = useRef(false);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    const started = Date.now();
    const timers: number[] = [];
    const finish = () => {
      if (done.current) return;
      done.current = true;
      onDone();
    };
    const startHandoff = () => {
      if (done.current) return;
      setHandoff(true);
      timers.push(window.setTimeout(finish, reduced ? SPLASH_REDUCED_MS : SPLASH_HANDOFF_MS));
    };

    if (reduced) {
      timers.push(window.setTimeout(startHandoff, SPLASH_REDUCED_MS));
      return () => timers.forEach(clearTimeout);
    }

    const tryHandoff = () => {
      if (done.current) return;
      const elapsed = Date.now() - started;
      const ready = document.readyState === "complete";
      if (elapsed >= SPLASH_MAX_MS) {
        startHandoff();
        return;
      }
      if (ready && elapsed >= SPLASH_MIN_READY_MS) {
        startHandoff();
        return;
      }
      if (elapsed >= SPLASH_SETTLE_MS && ready) {
        startHandoff();
      }
    };

    timers.push(window.setTimeout(tryHandoff, SPLASH_MIN_READY_MS));
    timers.push(window.setTimeout(tryHandoff, SPLASH_SETTLE_MS));
    timers.push(window.setTimeout(tryHandoff, SPLASH_MAX_MS));
    window.addEventListener("load", tryHandoff, { once: true });
    return () => {
      timers.forEach(clearTimeout);
      window.removeEventListener("load", tryHandoff);
    };
  }, [onDone]);

  return (
    <div
      className={handoff ? "am-splash devir" : "am-splash"}
      role="dialog"
      aria-modal="true"
      aria-label={splash.aria}
      data-splash={handoff ? "handoff" : "play"}
    >
      <div className="am-splash-base" />
      <div className="am-splash-sun" />
      <div className="am-splash-lef" />
      <div className="am-splash-rays" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="am-splash-beg am-splash-b1" src="/app/v3/desen/begonvil.svg" alt="" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="am-splash-beg am-splash-b2" src="/app/v3/desen/begonvil.svg" alt="" />
      <div className="am-splash-mark">
        <svg viewBox="0 0 120.4 156" aria-hidden="true">
          <g transform="translate(8 148)">
            <path className="a" d={MARK_PATH} fill="#0F2C44" />
            <rect className="sq" x="39.8" y="-52.6" width="14.8" height="14.8" fill="#FFFBF2" />
          </g>
        </svg>
      </div>
      <div className="am-splash-words">
        <p className="am-splash-slogan">
          {splash.sloganLead}
          <br />
          <b>{splash.sloganEm}</b>
        </p>
        <p className="am-splash-geo">{splash.geo}</p>
      </div>
      <div className="am-splash-sea">
        <svg className="am-splash-wv s1" viewBox="0 0 1560 260" preserveAspectRatio="none">
          <path d="M0 30 q65.0 -16 130.0 0 t130.0 0 q65.0 -16 130.0 0 t130.0 0 q65.0 -16 130.0 0 t130.0 0 q65.0 -16 130.0 0 t130.0 0 q65.0 -16 130.0 0 t130.0 0 q65.0 -16 130.0 0 t130.0 0 L1560 260 L0 260 Z" fill="#7EDDD5" />
        </svg>
        <svg className="am-splash-wv s2" viewBox="0 0 1560 260" preserveAspectRatio="none">
          <path d="M0 70 q78.0 -14 156.0 0 t156.0 0 q78.0 -14 156.0 0 t156.0 0 q78.0 -14 156.0 0 t156.0 0 q78.0 -14 156.0 0 t156.0 0 q78.0 -14 156.0 0 t156.0 0 L1560 260 L0 260 Z" fill="#22B8AF" />
        </svg>
        <svg className="am-splash-wv s3" viewBox="0 0 1560 260" preserveAspectRatio="none">
          <path d="M0 120 q65.0 -12 130.0 0 t130.0 0 q65.0 -12 130.0 0 t130.0 0 q65.0 -12 130.0 0 t130.0 0 q65.0 -12 130.0 0 t130.0 0 q65.0 -12 130.0 0 t130.0 0 q65.0 -12 130.0 0 t130.0 0 L1560 260 L0 260 Z" fill="#0B5FA5" />
        </svg>
        <svg className="am-splash-wv s4" viewBox="0 0 1560 260" preserveAspectRatio="none">
          <path d="M0 170 q97.5 -10 195.0 0 t195.0 0 q97.5 -10 195.0 0 t195.0 0 q97.5 -10 195.0 0 t195.0 0 q97.5 -10 195.0 0 t195.0 0 L1560 260 L0 260 Z" fill="#083E6E" />
        </svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="am-splash-kabuki"
        src="/app/v3/maskot/kabuki-selam.png"
        srcSet="/app/v3/maskot/kabuki-selam-512.png 512w, /app/v3/maskot/kabuki-selam.png 1024w"
        sizes="240px"
        width={1024}
        height={1024}
        alt=""
      />
      <div className="am-splash-foam" />
      <button type="button" className="am-splash-skip" aria-label={splash.skipAria} onClick={onDone}>
        {splash.skip}
      </button>
    </div>
  );
}
