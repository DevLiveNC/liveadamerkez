import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { Badge, UiIcon } from "@ada-merkez/ui";
import type { DiscoverCard } from "../../lib/discover";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function stockSrc(image?: string | null): string | null {
  if (!image) return null;
  return `/landing/stok/${image}.webp`;
}

export function BizCard({
  card,
  row = false,
  signedIn = false,
}: {
  card: DiscoverCard;
  row?: boolean;
  signedIn?: boolean;
}) {
  const href = `/app/isletmeler/${card.id}`;
  const photo = stockSrc(card.image);
  const initial = card.name.replace("Örnek ", "").slice(0, 1);
  const actionHref = signedIn && UUID.test(card.id) ? href : loginUrl({ next: href });
  return (
    <article className={row ? "am-biz am-biz--row" : "am-biz"}>
      <div className="am-biz-photo">
        <Link href={href} aria-label={card.name} tabIndex={-1}>
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt="" width={456} height={296} />
          ) : (
            <span className="am-biz-av" aria-hidden="true">
              {initial}
            </span>
          )}
        </Link>
        <div className="am-badges-left">
          {card.sample ? (
            <Badge tone="sample" className="am-badge--on-img">
              {app.example}
            </Badge>
          ) : null}
          {card.sample ? <Badge tone="new">{app.newBadge}</Badge> : null}
        </div>
        <Link
          className="am-heart"
          href={actionHref}
          aria-label={signedIn ? app.addFavorite : app.loginToFavorite}
        >
          <UiIcon name="heart" className="am-icon am-icon-sm" />
        </Link>
      </div>
      <div className="am-biz-body">
        <div className="am-biz-title-row">
          <h3>
            <Link href={href}>{card.name}</Link>
          </h3>
          {row && card.sample ? <Badge tone="sample">{app.example}</Badge> : null}
        </div>
        <p className="am-biz-meta">{[card.city, card.category ?? card.serviceName].filter(Boolean).join(" · ")}</p>
      </div>
    </article>
  );
}
