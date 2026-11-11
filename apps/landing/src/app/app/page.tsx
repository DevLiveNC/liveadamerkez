import { Suspense } from "react";
import Link from "next/link";
import { app, events } from "@ada-merkez/copy";
import { Badge, UiIcon } from "@ada-merkez/ui";
import { BizCard, stockSrc } from "../../components/app/BizCard";
import { DiscoverHeader, SearchHeader } from "../../components/app/DiscoverChrome";
import { DiscoverSkeleton } from "../../components/app/DiscoverSkeleton";
import { EmptyState } from "../../components/app/EmptyState";
import { getSession } from "../../lib/app-auth";
import { loadDiscover } from "../../lib/discover";

const FILTERS = [
  { id: "all", label: app.all, category: "" },
  { id: "hair", label: app.hair, category: "kuafor" },
  { id: "beauty", label: app.beauty, category: "guzellik" },
  { id: "clinic", label: app.clinic, category: "klinik" },
  { id: "resto", label: app.resto, category: "restoran" },
  { id: "sport", label: app.sport, category: "spor" },
  { id: "beach", label: app.beach, category: "sahil" },
] as const;

function hrefFor(category: string, q: string, liste?: boolean) {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (liste) params.set("liste", "1");
  const query = params.toString();
  return query ? `/app?${query}` : "/app";
}

async function HomeInner({
  q,
  category,
  listMode,
}: {
  q: string;
  category: string;
  listMode: boolean;
}) {
  const session = await getSession();
  const { cards, fromExamples } = await loadDiscover({ q, category });

  return (
    <>
      {listMode ? <SearchHeader /> : <DiscoverHeader />}
      {listMode ? null : <h1 className="visually-hidden">{app.homeTitle}</h1>}
      {listMode ? null : (
        <div className="am-greet">
          <div className="am-greet-img">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/landing/maskot/kabuki-selam-512.webp"
              width={104}
              height={104}
              alt=""
            />
          </div>
          <div className="am-balloon">
            <p>{app.greeting}</p>
            <p className="am-slogan">{app.slogan}</p>
          </div>
        </div>
      )}
      <form action="/app" className="am-search" role="search">
        <UiIcon name="search" />
        <input
          className="am-search-input"
          type="search"
          name="q"
          defaultValue={q}
          placeholder={app.searchPlaceholder}
          aria-label={app.searchPlaceholder}
        />
        {category ? <input type="hidden" name="category" value={category} /> : null}
        {q ? (
          <Link className="am-search-clear" href={hrefFor(category, "")} aria-label={app.clearSearch}>
            <UiIcon name="close" className="am-icon am-icon-sm" />
          </Link>
        ) : (
          <span className="am-search-filter" aria-hidden="true">
            <UiIcon name="filter" />
          </span>
        )}
      </form>
      <div className="am-chips" aria-label={app.filters}>
        {FILTERS.map((filter) => {
          const on = (category || "") === filter.category;
          return (
            <Link
              key={filter.id}
              className={on ? "am-chip am-chip--on" : "am-chip"}
              href={hrefFor(filter.category, q, listMode)}
              aria-current={on ? "page" : undefined}
            >
              {filter.label}
            </Link>
          );
        })}
        <span className="am-chip" aria-disabled="true">
          {app.events} <Badge tone="soon">{app.soon}</Badge>
        </span>
      </div>
      {fromExamples ? <p className="am-banner">{app.demoBanner}</p> : null}
      {listMode ? (
        <>
          <p className="am-kicker mt-4">
            {cards.length} {app.sampleResults}
          </p>
          {cards.length ? (
            <div className="am-stack mt-3">
              {cards.map((card) => (
                <BizCard key={card.id} card={card} row signedIn={Boolean(session)} />
              ))}
            </div>
          ) : (
            <EmptyState kind="sonuc-yok" />
          )}
        </>
      ) : (
        <>
          <div className="am-sec">
            <h2>{app.nearby}</h2>
            <Link className="am-sec-link" href={hrefFor(category, q, true)}>
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
            <EmptyState kind="sonuc-yok" />
          )}
          <div className="am-sec">
            <h2>{app.sampleEvents}</h2>
            <Badge tone="soon">{app.soon}</Badge>
          </div>
          <div className="am-hscroll">
            {events.cards.map((item) => (
              <article className="am-event" key={item.name}>
                <div className="am-event-photo">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stockSrc(item.image) ?? ""} alt="" width={504} height={264} />
                  <Badge tone="sample" className="am-badge--on-img">
                    {app.example}
                  </Badge>
                </div>
                <div className="am-event-body">
                  <Badge tone="soon">{app.soon}</Badge>
                  <h3>{item.name}</h3>
                  <p>
                    {item.city} · {app.dateSoon}
                  </p>
                </div>
              </article>
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
  searchParams: Promise<{ q?: string; category?: string; liste?: string; iskelet?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  const listMode = Boolean(q) || params.liste === "1";
  if (params.iskelet === "1") {
    return <DiscoverSkeleton />;
  }
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <HomeInner q={q} category={category} listMode={listMode} />
    </Suspense>
  );
}
