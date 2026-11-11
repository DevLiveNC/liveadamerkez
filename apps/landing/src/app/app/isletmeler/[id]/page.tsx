import Link from "next/link";
import { notFound } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { loginUrl, nicosiaTomorrowDateKey } from "@ada-merkez/shared";
import { BookSlotForm } from "../../../../components/app/BookSlotForm";
import { FavoriteToggle } from "../../../../components/app/FavoriteToggle";
import { EmptyState } from "../../../../components/app/EmptyState";
import { getSession } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";
import { exampleCard } from "../../../../lib/discover";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function IsletmeDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const live = UUID.test(id)
    ? await serverApi<{
        ok?: boolean;
        business?: {
          id: string;
          name: string;
          sample: boolean;
          city: string | null;
          category: string | null;
          services: { id: string; name: string }[];
        };
      }>(`/v1/public/businesses/${id}`)
    : null;
  const example = exampleCard(id);
  const biz = live?.ok && live.business
    ? {
        id: live.business.id,
        name: live.business.name,
        sample: live.business.sample,
        city: live.business.city,
        category: live.business.category,
        serviceName: live.business.services[0]?.name ?? null,
      }
    : example;
  if (!biz) notFound();

  const date = nicosiaTomorrowDateKey();
  const slots = UUID.test(id)
    ? await serverApi<{ ok?: boolean; slots?: { startsAt: string; label: string; serviceId: string | null }[] }>(
        `/v1/public/businesses/${id}/slots?date=${date}`,
      )
    : null;
  const openSlots = slots?.ok ? (slots.slots ?? []) : [];
  const favorited =
    session && UUID.test(id)
      ? Boolean(
          (
            await serverApi<{ ok?: boolean; favorites?: { businessId: string }[] }>("/v1/me/favorites")
          )?.favorites?.some((item) => item.businessId === id),
        )
      : false;
  const loginHref = loginUrl({ next: `/app/isletmeler/${id}` });

  return (
    <>
      <p>
        <Link href="/app">{app.back}</Link>
      </p>
      <header className="am-head">
        <p className="t-label">{biz.category}</p>
        <h1>{biz.name}</h1>
        <p className="am-note">
          {[biz.city, biz.serviceName].filter(Boolean).join(" · ")}
        </p>
        {biz.sample ? <span className="badge-ornek">{app.example}</span> : null}
      </header>
      {biz.sample ? <p className="am-banner">{app.exampleNote}</p> : null}
      {session ? (
        UUID.test(id) ? <FavoriteToggle businessId={id} initial={favorited} /> : null
      ) : (
        <p>
          <Link className="btn btn-ghost" href={loginHref}>
            {app.loginToFavorite}
          </Link>
        </p>
      )}
      <h2 className="t-label">
        {app.slotsTitle} · {app.tomorrow}
      </h2>
      {openSlots.length ? (
        session ? (
          <BookSlotForm businessId={id} slots={openSlots} />
        ) : (
          <p>
            <Link className="btn btn-coral" href={loginHref}>
              {app.loginToBook}
            </Link>
          </p>
        )
      ) : (
        <>
          <EmptyState kind="sonuc-yok" />
          <p className="am-note">{app.noSlots}</p>
          {session ? null : (
            <p>
              <Link className="btn btn-coral" href={loginHref}>
                {app.loginToBook}
              </Link>
            </p>
          )}
        </>
      )}
    </>
  );
}
