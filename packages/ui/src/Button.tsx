import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type ButtonVariant = "primary" | "accent" | "secondary" | "ghost" | "soft" | "coral" | "navy";
export type ButtonSize = "sm" | "md" | "lg";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
  children: ReactNode;
};

const VARIANT: Record<ButtonVariant, string> = {
  primary: "am-btn--primary",
  navy: "am-btn--primary",
  accent: "am-btn--accent",
  coral: "am-btn--accent",
  secondary: "am-btn--secondary",
  ghost: "am-btn--ghost",
  soft: "am-btn--soft",
};

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  className,
  type = "button",
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx("am-btn", VARIANT[variant], size === "sm" && "am-btn--sm", block && "am-btn--block", className)}
      {...rest}
    >
      {children}
    </button>
  );
}
