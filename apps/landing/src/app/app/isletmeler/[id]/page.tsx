import Link from "next/link";
import { notFound } from "next/navigation";
import { app, examples } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { getSession } from "../../../../lib/app-auth";

export default async function IsletmeDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const index = Number(id) - 1;
  const card = examples.cards[index];
  if (!card) notFound();
  const session = await getSession();
  const bookHref = session
    ? `/app/randevular`
    : loginUrl({ next: `/app/isletmeler/${id}` });

  return (
    <>
      <p>
        <Link href="/app">{app.back}</Link>
      </p>
      <header className="am-head">
        <p className="t-label">{card.category}</p>
        <h1>{card.name}</h1>
        <p className="am-note">
          {card.city} · {card.service}
        </p>
        <span className="badge-ornek">{app.example}</span>
      </header>
      <p className="am-banner">{app.exampleNote}</p>
      <p>
        <Link className="btn btn-coral" href={bookHref}>
          {session ? app.book : app.loginToBook}
        </Link>
      </p>
    </>
  );
}
