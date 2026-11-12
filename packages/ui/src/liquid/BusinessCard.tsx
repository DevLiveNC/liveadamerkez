import type { ReactNode } from "react";
import { cx } from "../cx.js";
import { linkTag, type LinkRender } from "./link.js";

export type BusinessCardProps = {
  href: string;
  name: string;
  meta?: string;
  imageSrc?: string | null;
  imageAlt?: string;
  initial?: string;
  badges?: ReactNode;
  heart?: ReactNode;
  heartOn?: boolean;
  row?: boolean;
  className?: string;
  headingLevel?: "h2" | "h3";
  link?: LinkRender;
};

/** İşletme kartı — cam yüzey + fotoğraf + kalp yuvası.
 *  `am-biz` sınıf ailesi korunur; landing'de `Link` enjekte edilir. */
export function BusinessCard({
  href,
  name,
  meta,
  imageSrc,
  imageAlt = "",
  initial,
  badges,
  heart,
  heartOn = false,
  row = false,
  className,
  headingLevel = "h3",
  link,
}: BusinessCardProps) {
  const Link = linkTag(link);
  const Heading = headingLevel;
  const mark = initial ?? name.replace("Örnek ", "").slice(0, 1);

  return (
    <article className={cx("am-biz", "atla-tile", row && "am-biz--row", className)}>
      <div className="am-biz-photo">
        <Link href={href} aria-label={name} tabIndex={-1}>
          {imageSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageSrc} alt={imageAlt} width={456} height={296} />
          ) : (
            <span className="am-biz-av" aria-hidden="true">
              {mark}
            </span>
          )}
        </Link>
        {badges ? <div className="am-badges-left">{badges}</div> : null}
        {heart ? <div className={heartOn ? "am-heart is-on" : "am-heart"}>{heart}</div> : null}
      </div>
      <div className="am-biz-body">
        <div className="am-biz-title-row">
          <Heading>
            <Link href={href}>{name}</Link>
          </Heading>
        </div>
        {meta ? <p className="am-biz-meta">{meta}</p> : null}
      </div>
    </article>
  );
}
