import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { EmptyState } from "../../../components/app/EmptyState";
import { getSession } from "../../../lib/app-auth";

export default async function FavorilerPage() {
  const session = await getSession();
  return (
    <>
      <header className="am-head">
        <h1>{app.favorites}</h1>
      </header>
      <EmptyState kind="favori-yok" />
      {session ? null : (
        <p>
          <Link className="btn btn-coral" href={loginUrl({ next: "/app/favoriler" })}>
            {app.loginToFavorite}
          </Link>
        </p>
      )}
    </>
  );
}
