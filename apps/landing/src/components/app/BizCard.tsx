import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { Badge, BusinessCard, UiIcon } from "@ada-merkez/ui";
import type { DiscoverCard } from "../../lib/discover";
import { AppLink } from "./AppLink";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function stockSrc(image?: string | null): string | null {
  if (!image) return null;
  return `/landing/stok/${image}.webp`;
}

/** Keşif kartını cam işletme kartına bağlar; kalp yalnız girişliyken işlem yapar. */
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
  const badge = card.sample ? (
    <>
      <Badge tone="sample" className="am-badge--on-img">
        {app.example}
      </Badge>
      <Badge tone="new">{app.newBadge}</Badge>
    </>
  ) : null;

  return (
    <BusinessCard
      href={href}
      name={card.name}
      meta={[card.city, card.category ?? card.serviceName].filter(Boolean).join(" · ")}
      imageSrc={photo}
      initial={initial}
      row={row}
      link={AppLink}
      badges={badge}
      heart={
        <AppLink
          className="am-heart-hit"
          href={actionHref}
          aria-label={signedIn ? app.addFavorite : app.loginToFavorite}
        >
          <UiIcon name="heart" className="am-icon am-icon-sm" />
        </AppLink>
      }
    />
  );
}
