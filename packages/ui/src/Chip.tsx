import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type ChipTone = "default" | "navy" | "coral" | "live" | "outline" | "filter";

export type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  tone?: ChipTone;
  pressed?: boolean;
  children: ReactNode;
};

export function Chip({
  tone = "default",
  pressed,
  className,
  type = "button",
  children,
  ...rest
}: ChipProps) {
  return (
    <button
      type={type}
      className={cx(
        "am-chip",
        pressed && "am-chip--on",
        tone === "filter" && "am-chip--filter",
        className,
      )}
      aria-pressed={pressed}
      {...rest}
    >
      {children}
    </button>
  );
}
