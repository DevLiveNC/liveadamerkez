import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "../cx.js";

export type TopBarProps = HTMLAttributes<HTMLElement> & {
  children: ReactNode;
  blur?: boolean;
};

export function TopBar({ className, blur = true, children, ...rest }: TopBarProps) {
  return (
    <header className={cx("am-header", blur && "am-header--blur", className)} {...rest}>
      {children}
    </header>
  );
}
