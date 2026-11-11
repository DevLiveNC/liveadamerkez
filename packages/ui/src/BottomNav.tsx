import { Fragment, type ReactNode } from "react";
import { cx } from "./cx.js";

export type BottomNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  current?: boolean;
};

export type BottomNavRenderItem = (item: BottomNavItem, className: string) => ReactNode;

export function BottomNav({
  items,
  label,
  className,
  renderItem,
}: {
  items: readonly BottomNavItem[];
  label: string;
  className?: string;
  renderItem?: BottomNavRenderItem;
}) {
  return (
    <nav className={cx("am-tabbar", className)} aria-label={label}>
      {items.map((item) => {
        const classNameItem = cx("am-tab", item.current && "is-on", item.current && "on");
        if (renderItem) {
          return <Fragment key={item.href}>{renderItem(item, classNameItem)}</Fragment>;
        }
        return (
          <a
            key={item.href}
            href={item.href}
            className={classNameItem}
            aria-current={item.current ? "page" : undefined}
          >
            {item.icon}
            {item.label}
          </a>
        );
      })}
    </nav>
  );
}
