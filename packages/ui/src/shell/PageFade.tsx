import type { ReactNode } from "react";
import { cx } from "../cx.js";

export function PageFade({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("am-ui-page", className)}>{children}</div>;
}
