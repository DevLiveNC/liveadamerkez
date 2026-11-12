"use client";

import { LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";

const loadDomAnimation = () =>
  import("motion/react").then((mod) => mod.domAnimation);

export function MotionRoot({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadDomAnimation} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  );
}
