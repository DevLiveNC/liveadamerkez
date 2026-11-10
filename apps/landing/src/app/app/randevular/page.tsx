import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { EmptyState } from "../../../components/app/EmptyState";
import { getSession } from "../../../lib/app-auth";

export default async function RandevularPage() {
  const session = await getSession();
  return (
    <>
      <header className="am-head">
        <h1>{app.bookings}</h1>
      </header>
      <EmptyState kind="rezervasyon-yok" />
      {session ? null : (
        <p>
          <Link className="btn btn-coral" href={loginUrl({ next: "/app/randevular" })}>
            {app.loginToBook}
          </Link>
        </p>
      )}
    </>
  );
}
