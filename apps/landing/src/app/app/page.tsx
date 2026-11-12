import { Suspense } from "react";
import Link from "next/link";
import { app, events } from "@ada-merkez/copy";
import { Badge, CategoryChip, EventCard, UiIcon } from "@ada-merkez/ui";
import { BizCard, stockSrc } from "../../components/app/BizCard";
import { AppLink } from "../../components/app/AppLink";
import { AppSearch } from "../../components/app/AppSearch";
import { DiscoverHeader, SearchHeader } from "../../components/app/DiscoverChrome";
import { DiscoverSkeleton } from "../../components/app/DiscoverSkeleton";
import { EmptyState } from "../../components/app/EmptyState";
import { getSession } from "../../lib/app-auth";
import { loadDiscover } from "../../lib/discover";
import { greetingForNicosia } from "../../lib/nicosia-date";
import { cityName } from "../../lib/pilot-cities";
import { skeletonQueryEnabled } from "../../lib/skeleton-query";

const SOON_CATEGORIES = new Set(["kafe", "spor", "sahil"]);

const FILTERS = [
  { id: "all", label: app.all, category: "", soon: false },
  { id: "hair", label: app.hair, category: "kuafor", soon: false },
  { id: "beauty", label: app.beauty, category: "guzellik", soon: false },
  { id: "clinic", label: app.clinic, category: "klinik", soon: false },
  { id: "resto", label: app.resto, category: "restoran", soon: false },
  { id: "cafe", label: app.cafe, category: "kafe", soon: true },
  { id: "sport", label: app.sport, category: "spor", soon: true },
  { id: "beach", label: app.beach, category: "sahil", soon: true },
] as const;

function hrefFor(category: string, q: string, liste?: boolean, city?: string) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (liste) params.set("liste", "1");
  if (city) params.set("sehir", city);
  const query = params.toString();
  return query ? `/app?${query}` : "/app";
}

async function HomeInner({
  q,
  category,
  listMode,
  city,
}: {
  q: string;
  category: string;
  listMode: boolean;
  city: string;
}) {
  const session = await getSession();
  const soonCategory = SOON_CATEGORIES.has(category);
  const { cards, fromExamples } = soonCategory
    ? { cards: [] as Awaited<ReturnType<typeof loadDiscover>>["cards"], fromExamples: false }
    : await loadDiscover({ q, category, city });

  return (
    <>
      {listMode ? <SearchHeader /> : <DiscoverHeader city={city} />}
      {listMode ? null : <h1 className="visually-hidden">{app.homeTitle}</h1>}
      {listMode ? null : (
        <div className="am-greet">
          <div className="am-balloon atla-greeting">
            <p>{greetingForNicosia()}</p>
            <p className="am-slogan">{app.slogan}</p>
          </div>
        </div>
      )}
      <AppSearch
        action="/app"
        defaultValue={q}
        placeholder={app.searchPlaceholder}
        ariaLabel={app.searchPlaceholder}
        hidden={{ category, sehir: city }}
        action2={
          q ? (
            <Link className="am-search-clear" href={hrefFor(category, "", listMode, city)} aria-label={app.clearSearch}>
              <UiIcon name="close" className="am-icon am-icon-sm" />
            </Link>
          ) : null
        }
      />
      <div className="am-chips" aria-label={app.filters}>
        {FILTERS.map((filter) => {
          if (filter.soon) {
            return (
              <CategoryChip
                key={filter.id}
                label={filter.label}
                disabled
                badge={<Badge tone="soon">{app.soon}</Badge>}
              />
            );
          }
          const on = (category || "") === filter.category;
          return (
            <CategoryChip
              key={filter.id}
              label={filter.label}
              href={hrefFor(filter.category, q, listMode, city)}
              active={on}
              link={AppLink}
            />
          );
        })}
        <CategoryChip label={app.events} disabled badge={<Badge tone="soon">{app.soon}</Badge>} />
      </div>
      {fromExamples ? <p className="am-banner">{app.demoBanner}</p> : null}
      {listMode ? (
        <>
          {fromExamples ? (
            <p className="am-kicker mt-4">
              {cards.length} {app.sampleResults}
            </p>
          ) : null}
          {cards.length ? (
            <div className="am-stack mt-3">
              {cards.map((card) => (
                <BizCard key={card.id} card={card} row signedIn={Boolean(session)} />
              ))}
            </div>
          ) : (
            <EmptyState
              kind="sonuc-yok"
              title={soonCategory ? app.soon : undefined}
              body={soonCategory ? app.categorySoonBody : undefined}
            />
          )}
        </>
      ) : (
        <>
          <div className="am-sec">
            <h2>{app.nearby}</h2>
            <Link className="am-sec-link" href={hrefFor(category, q, true, city)}>
              {app.seeAll}
            </Link>
          </div>
          {cards.length ? (
            <div className="am-hscroll">
              {cards.map((card) => (
                <BizCard key={card.id} card={card} signedIn={Boolean(session)} />
              ))}
            </div>
          ) : (
            <EmptyState
              kind="sonuc-yok"
              title={soonCategory ? app.soon : undefined}
              body={soonCategory ? app.categorySoonBody : undefined}
            />
          )}
          <div className="am-sec">
            <h2>{app.sampleEvents}</h2>
            <Badge tone="soon">{app.soon}</Badge>
          </div>
          <div className="am-hscroll">
            {events.cards.map((item) => (
              <EventCard
                key={item.name}
                name={item.name}
                meta={[item.city, app.dateSoon].filter(Boolean).join(" · ")}
                imageSrc={stockSrc(item.image)}
                badge={
                  <Badge tone="sample" className="am-badge--on-img">
                    {app.example}
                  </Badge>
                }
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; liste?: string; iskelet?: string; sehir?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const city = cityName(params.sehir);
  const listMode = Boolean(q) || params.liste === "1" || Boolean(city);
  if (params.iskelet === "1" && skeletonQueryEnabled()) {
    return <DiscoverSkeleton />;
  }
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <HomeInner q={q} category={category} listMode={listMode} city={city} />
    </Suspense>
  );
}
