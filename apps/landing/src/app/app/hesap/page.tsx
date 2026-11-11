import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { CikisButton } from "../../../components/app/CikisButton";
import { getSession } from "../../../lib/app-auth";

function roleLabel(role: string): string {
  if (role === "business") return app.business;
  if (role === "admin") return app.admin;
  return app.customer;
}

export default async function HesapPage() {
  const session = await getSession();
  if (!session) {
    return (
      <>
        <header className="am-head">
          <h1>{app.account}</h1>
          <p className="am-note">{app.profileGuest}</p>
        </header>
        <p>
          <Link className="btn btn-coral" href={loginUrl({ next: "/app/hesap" })}>
            {app.signIn}
          </Link>
        </p>
      </>
    );
  }
  return (
    <>
      <header className="am-head">
        <h1>{app.account}</h1>
        <p className="am-note">
          {session.name || roleLabel(session.role)} · {session.phone}
        </p>
      </header>
      <p className="am-banner">{roleLabel(session.role)}</p>
      {session.role === "business" ? (
        <p>
          <Link className="btn btn-ghost" href="/app/isletme">
            {app.business}
          </Link>
        </p>
      ) : null}
      {session.role === "admin" ? (
        <p>
          <Link className="btn btn-ghost" href="/app/yonetim">
            {app.admin}
          </Link>
        </p>
      ) : null}
      <CikisButton />
    </>
  );
}
