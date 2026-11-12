import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { AppHeader, Badge, BusinessCard } from "@ada-merkez/ui";
import { AppLink } from "../../../../components/app/AppLink";
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
      <AppHeader title={app.favoritesTitle} eyebrow={app.favorites} />
      {favorites.length ? (
        <>
          {favorites.every((row) => row.sample) ? (
            <p className="am-kicker">
              {favorites.length} {app.sampleSaves}
            </p>
          ) : null}
          <div className="am-stack mt-3">
            {favorites.map((row) => (
              <BusinessCard
                key={row.id}
                href={`/app/isletmeler/${row.businessId}`}
                name={row.name}
                meta={[row.city, row.category].filter(Boolean).join(" · ")}
                row
                link={AppLink}
                badges={
                  row.sample ? (
                    <Badge tone="sample" className="am-badge--on-img">
                      {app.example}
                    </Badge>
                  ) : null
                }
                heart={<FavoriteToggle businessId={row.businessId} initial />}
                heartOn
              />
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
