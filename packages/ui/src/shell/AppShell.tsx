import type { ReactNode } from "react";
import { cx } from "../cx.js";

export function AppShell({
  header,
  footer,
  children,
  className,
  skipHref = "#icerik",
  skipLabel,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  skipHref?: string;
  skipLabel?: string;
}) {
  return (
    <div className={cx("am-ui-shell", className)}>
      {skipLabel ? (
        <a className="skip" href={skipHref}>
          {skipLabel}
        </a>
      ) : null}
      {header}
      {children}
      {footer}
    </div>
  );
}
