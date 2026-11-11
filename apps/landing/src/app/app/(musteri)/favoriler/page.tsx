import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { Badge } from "@ada-merkez/ui";
import { FavoriteToggle } from "../../../../components/app/FavoriteToggle";
import { EmptyState } from "../../../../components/app/EmptyState";
import { requireRole } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";

type FavoriteRow = {
  id: string;
  businessId: string;
  name: string;
  sample: boolean;
  city: string | null;
  category: string | null;
};

export default async function FavorilerPage() {
  await requireRole("customer", "/app/favoriler");
  const data = await serverApi<{ ok?: boolean; favorites?: FavoriteRow[] }>("/v1/me/favorites");
  const favorites = data?.ok ? (data.favorites ?? []) : [];

  return (
    <>
      <header className="am-header am-header--blur">
        <h1 className="am-header-title">{app.favoritesTitle}</h1>
      </header>
      {favorites.length ? (
        <>
          <p className="am-kicker">
            {favorites.length} {app.sampleSaves}
          </p>
          <div className="am-stack mt-3">
            {favorites.map((row) => (
              <article className="am-biz am-biz--row" key={row.id}>
                <div className="am-biz-photo">
                  <Link href={`/app/isletmeler/${row.businessId}`} aria-label={row.name}>
                    <span className="am-biz-av" aria-hidden="true">
                      {row.name.replace("Örnek ", "").slice(0, 1)}
                    </span>
                  </Link>
                  {row.sample ? (
                    <div className="am-badges-left">
                      <Badge tone="sample" className="am-badge--on-img">
                        {app.example}
                      </Badge>
                    </div>
                  ) : null}
                  <div className="am-heart is-on">
                    <FavoriteToggle businessId={row.businessId} initial />
                  </div>
                </div>
                <div className="am-biz-body">
                  <div className="am-biz-title-row">
                    <h3>
                      <Link href={`/app/isletmeler/${row.businessId}`}>{row.name}</Link>
                    </h3>
                    {row.sample ? <Badge tone="sample">{app.example}</Badge> : null}
                  </div>
                  <p className="am-biz-meta">{[row.city, row.category].filter(Boolean).join(" · ")}</p>
                </div>
              </article>
            ))}
          </div>
        </>
      ) : (
        <EmptyState
          kind="favori-yok"
          title={app.emptyFavorites}
          body={app.emptyFavoritesLead}
          action={
            <Link className="am-btn am-btn--primary" href="/app">
              {app.favoritesCta}
            </Link>
          }
        />
      )}
    </>
  );
}
