import type { ReactNode } from "react";
import { cx } from "../cx.js";
import { UiIcon } from "../icons.js";
import { linkTag, type LinkRender } from "./link.js";

/** Müşteri ekranlarının cam başlığı.
 *  `am-header` sınıfı korunur: kabuk ölçüleri ve test seçicileri buna bağlı. */
export function AppHeader({
  title,
  eyebrow,
  titleId,
  back,
  side,
  sticky = true,
  className,
  link,
}: {
  title: ReactNode;
  eyebrow?: ReactNode;
  titleId?: string;
  back?: { href: string; label: string; icon?: ReactNode };
  side?: ReactNode;
  sticky?: boolean;
  className?: string;
  link?: LinkRender;
}) {
  const Link = linkTag(link);
  return (
    <header className={cx("am-header", "am-header--blur", "atla-header", !sticky && "atla-header--static", className)}>
      {back ? (
        <Link className="atla-glass-btn" href={back.href} aria-label={back.label}>
          {back.icon ?? <UiIcon name="back" />}
        </Link>
      ) : null}
      <div className="atla-header__text">
        {eyebrow ? <p className="atla-header__eyebrow">{eyebrow}</p> : null}
        <h1 className="am-header-title atla-header__title" id={titleId}>
          {title}
        </h1>
      </div>
      {side ? <div className="am-header-side">{side}</div> : null}
    </header>
  );
}
