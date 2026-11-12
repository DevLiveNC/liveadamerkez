"use client";

import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { readMotionSeconds } from "../../lib/motion-tokens";

gsap.registerPlugin(useGSAP, ScrollTrigger);

function playLandingScenes(root: HTMLElement) {
  const duration = readMotionSeconds("--motion-duration-base", 0.14);
  const targets = [...root.querySelectorAll<HTMLElement>(
    ".cat, .ex, .ev, .pilot, .tool, .rail-item, .biz-stat, .kabuki--compact",
  )].filter((el) => !el.closest(".hero"));
  if (!targets.length) return;

  ScrollTrigger.batch(targets, {
    start: "top 92%",
    once: true,
    onEnter: (batch) => {
      const fold = window.innerHeight;
      const incoming = batch.filter((el) => el.getBoundingClientRect().top >= fold);
      if (!incoming.length) return;
      gsap.fromTo(
        incoming,
        { y: 8 },
        {
          y: 0,
          duration,
          stagger: 0.03,
          ease: "power2.out",
          overwrite: true,
          force3D: true,
        },
      );
    },
  });
}

export function LandingScrollScenes() {
  useGSAP(
    () => {
      const page = document.getElementById("icerik");
      if (!page) return;

      document.documentElement.setAttribute("data-gsap-ready", "true");
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        document.documentElement.setAttribute("data-gsap-reduced", "true");
      });

      const start = () => {
        mm.add("(prefers-reduced-motion: no-preference)", () => {
          document.documentElement.removeAttribute("data-gsap-reduced");
          playLandingScenes(page);
          ScrollTrigger.refresh();
        });
      };

      if (document.readyState === "complete") start();
      else window.addEventListener("load", start, { once: true });

      return () => {
        mm.revert();
        document.documentElement.removeAttribute("data-gsap-ready");
        document.documentElement.removeAttribute("data-gsap-reduced");
      };
    },
    { dependencies: [] },
  );

  return null;
}
