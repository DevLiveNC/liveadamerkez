import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { FavoriteToggle } from "../../../components/app/FavoriteToggle";
import { EmptyState } from "../../../components/app/EmptyState";
import { getSession } from "../../../lib/app-auth";
import { serverApi } from "../../../lib/app-api";

type FavoriteRow = {
  id: string;
  businessId: string;
  name: string;
  sample: boolean;
  city: string | null;
  category: string | null;
};

export default async function FavorilerPage() {
  const session = await getSession();
  const data = session
    ? await serverApi<{ ok?: boolean; favorites?: FavoriteRow[] }>("/v1/me/favorites")
    : null;
  const favorites = data?.ok ? (data.favorites ?? []) : [];

  return (
    <>
      <header className="am-head">
        <h1>{app.favorites}</h1>
      </header>
      {session ? null : (
        <p>
          <Link className="btn btn-coral" href={loginUrl({ next: "/app/favoriler" })}>
            {app.loginToFavorite}
          </Link>
        </p>
      )}
      {favorites.length ? (
        favorites.map((row) => (
          <article className="am-biz" key={row.id}>
            <div>
              <h2>
                <Link href={`/app/isletmeler/${row.businessId}`}>{row.name}</Link>
              </h2>
              <p>{[row.city, row.category].filter(Boolean).join(" · ")}</p>
            </div>
            {row.sample ? <span className="badge-ornek">{app.example}</span> : null}
            <FavoriteToggle businessId={row.businessId} initial />
          </article>
        ))
      ) : (
        <EmptyState kind="favori-yok" />
      )}
    </>
  );
}
