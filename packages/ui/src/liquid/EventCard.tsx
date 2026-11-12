import type { ReactNode } from "react";
import { cx } from "../cx.js";

/** Etkinlik kartı — cam gövde, üstte fotoğraf, sağ üstte durum rozeti. */
export function EventCard({
  name,
  meta,
  imageSrc,
  imageAlt = "",
  badge,
  className,
}: {
  name: string;
  meta?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  badge?: ReactNode;
  className?: string;
}) {
  return (
    <article className={cx("am-event", "atla-tile", className)}>
      <div className="am-event-photo">
        {imageSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageSrc}
            alt={imageAlt}
            width={504}
            height={264}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="am-event-photo__mark" aria-hidden="true" />
        )}
        {badge}
      </div>
      <div className="am-event-body">
        <h3>{name}</h3>
        {meta ? <p>{meta}</p> : null}
      </div>
    </article>
  );
}
