import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "./cx.js";

export type BadgeTone = "sample" | "new" | "soon" | "confirmed" | "pending" | "free" | "cancelled" | "navy" | "coral" | "ok" | "wait" | "info" | "muted";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

const TONE: Record<BadgeTone, string> = {
  sample: "am-badge--sample",
  new: "am-badge--new",
  soon: "am-badge--soon",
  confirmed: "am-badge--confirmed",
  pending: "am-badge--pending",
  free: "am-badge--free",
  cancelled: "am-badge--cancelled",
  navy: "am-badge--confirmed",
  coral: "am-badge--soon",
  ok: "am-badge--confirmed",
  wait: "am-badge--pending",
  info: "am-badge--new",
  muted: "am-badge--cancelled",
};

export function Badge({ tone = "sample", className, children, ...rest }: BadgeProps) {
  return (
    <span className={cx("am-badge", TONE[tone], className)} {...rest}>
      {children}
    </span>
  );
}
