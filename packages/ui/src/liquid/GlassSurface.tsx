import type { ReactNode } from "react";
import { cx } from "../cx.js";

export type GlassTone = "plain" | "soft" | "strong" | "peach" | "mint" | "navy";
export type GlassRadius = "sm" | "md" | "lg" | "xl";

const TONE: Record<GlassTone, string | undefined> = {
  plain: undefined,
  soft: "atla-glass--soft",
  strong: "atla-glass--strong",
  peach: "atla-glass--peach",
  mint: "atla-glass--mint",
  navy: "atla-glass--navy",
};

const RADIUS: Record<GlassRadius, string | undefined> = {
  sm: "atla-glass--r-sm",
  md: undefined,
  lg: undefined,
  xl: "atla-glass--r-xl",
};

export function GlassSurface({
  as = "div",
  tone = "plain",
  radius = "md",
  flat = false,
  className,
  children,
  ...rest
}: {
  as?: "div" | "article" | "section" | "li" | "aside";
  tone?: GlassTone;
  radius?: GlassRadius;
  flat?: boolean;
  className?: string;
  children?: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  const Tag = as;
  return (
    <Tag
      className={cx("atla-glass", TONE[tone], RADIUS[radius], flat && "atla-glass--flat", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
