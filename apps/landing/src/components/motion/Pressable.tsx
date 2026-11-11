"use client";

import * as m from "motion/react-m";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { MOTION_TRANSITION_PRESS } from "../../lib/motion-tokens";

type Props = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & {
  children: ReactNode;
};

export function Pressable({ children, className, disabled, type = "button", ...props }: Props) {
  return (
    <m.button
      type={type}
      className={className}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98, y: 1 }}
      transition={MOTION_TRANSITION_PRESS}
      {...props}
    >
      {children}
    </m.button>
  );
}
