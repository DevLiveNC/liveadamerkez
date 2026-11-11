import { Suspense } from "react";
import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { DiscoverSkeleton } from "../../components/app/DiscoverSkeleton";
import { EmptyState } from "../../components/app/EmptyState";
import { loadDiscover } from "../../lib/discover";

const COLORS = ["#0F2C44", "#1F6A8F", "#E4572E", "#0E7C78"];

const FILTERS = [
  { id: "all", label: app.all, category: "" },
  { id: "hair", label: app.hair, category: "kuafor" },
  { id: "clinic", label: app.clinic, category: "klinik" },
  { id: "resto", label: app.resto, category: "restoran" },
] as const;

async function HomeInner({
  q,
  category,
}: {
  q: string;
  category: string;
}) {
  const { cards, fromExamples } = await loadDiscover({ q, category });

  return (
    <>
      <header className="am-head">
        <p className="t-label">{app.kicker}</p>
        <h1>{app.homeTitle}</h1>
        <form>
          <input
            className="am-search"
            type="search"
            name="q"
            defaultValue={q}
            placeholder={app.searchPlaceholder}
            aria-label={app.searchPlaceholder}
          />
          {category ? <input type="hidden" name="category" value={category} /> : null}
        </form>
        <div className="am-chips">
          {FILTERS.map((filter) => {
            const href = filter.category
              ? `/app?category=${encodeURIComponent(filter.category)}${q ? `&q=${encodeURIComponent(q)}` : ""}`
              : q
                ? `/app?q=${encodeURIComponent(q)}`
                : "/app";
            const on = (category || "") === filter.category;
            return (
              <Link key={filter.id} className={on ? "filter on" : "filter"} href={href}>
                {filter.label}
              </Link>
            );
          })}
          <span className="filter" style={{ opacity: 0.55 }}>
            {app.events} <span className="badge-soon">{app.soon}</span>
          </span>
        </div>
      </header>
      {fromExamples ? <p className="am-banner">{app.demoBanner}</p> : null}
      {cards.length ? (
        cards.map((card, index) => (
          <Link className="am-biz" href={`/app/isletmeler/${card.id}`} key={card.id}>
            <div className="am-biz-av" style={{ background: COLORS[index % COLORS.length] }}>
              {card.name.replace("Örnek ", "").slice(0, 1)}
            </div>
            <div>
              <h2>{card.name}</h2>
              <p>
                {[card.city, card.serviceName ?? card.category].filter(Boolean).join(" · ")}
              </p>
            </div>
            {card.sample || fromExamples ? <span className="badge-ornek">{app.example}</span> : null}
          </Link>
        ))
      ) : (
        <EmptyState kind="sonuc-yok" />
      )}
    </>
  );
}

export default async function AppHomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; iskelet?: string }>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "";
  if (params.iskelet === "1") {
    return <DiscoverSkeleton />;
  }
  return (
    <Suspense fallback={<DiscoverSkeleton />}>
      <HomeInner q={q} category={category} />
    </Suspense>
  );
}
