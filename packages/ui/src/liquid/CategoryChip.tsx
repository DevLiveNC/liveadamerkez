import type { ReactNode } from "react";
import { cx } from "../cx.js";
import { linkTag, type LinkRender } from "./link.js";

/** Filtre çipi. `am-chip` sınıfı korunur; kapalı kategoriler
 *  `aria-disabled="true"` ile bağlantı değil, metin olarak durur. */
export function CategoryChip({
  label,
  href,
  active = false,
  disabled = false,
  badge,
  link,
  className,
}: {
  label: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  link?: LinkRender;
  className?: string;
}) {
  const Link = linkTag(link);
  const classes = cx("am-chip", "atla-chip", active && "am-chip--on", className);
  const body = (
    <>
      {label}
      {badge}
    </>
  );

  if (disabled || !href) {
    return (
      <span className={classes} aria-disabled="true">
        {body}
      </span>
    );
  }

  return (
    <Link className={classes} href={href} aria-current={active ? "page" : undefined}>
      {body}
    </Link>
  );
}
