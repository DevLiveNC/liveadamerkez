import Link from "next/link";
import { notFound } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { Badge } from "@ada-merkez/ui";
import { FavoriteToggle } from "../../../../components/app/FavoriteToggle";
import { ReservationFlow } from "../../../../components/app/ReservationFlow";
import type { SheetSlot } from "../../../../components/app/ReservationSheet";
import { getSession } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";
import { exampleCard } from "../../../../lib/discover";
import { nicosiaDayStrip } from "../../../../lib/nicosia-days";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type LiveService = { id: string; name: string; durationMinutes?: number };

export default async function IsletmeDetayPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rezervasyon?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
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
          services: LiveService[];
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
        services: live.business.services,
      }
    : example
      ? {
          id: example.id,
          name: example.name,
          sample: example.sample,
          city: example.city,
          category: example.category,
          services: example.serviceName ? [{ id: "ornek", name: example.serviceName }] : [],
        }
      : null;
  if (!biz) notFound();

  const days = nicosiaDayStrip(7);
  const slotsByDate: Record<string, SheetSlot[]> = {};
  if (UUID.test(id)) {
    const loaded = await Promise.all(
      days.map(async (day) => {
        const data = await serverApi<{ ok?: boolean; slots?: SheetSlot[] }>(
          `/v1/public/businesses/${id}/slots?date=${day.key}`,
        );
        return [day.key, data?.ok ? (data.slots ?? []) : []] as const;
      }),
    );
    for (const [key, slots] of loaded) slotsByDate[key] = slots;
  }

  const favorited =
    session && UUID.test(id)
      ? Boolean(
          (
            await serverApi<{ ok?: boolean; favorites?: { businessId: string }[] }>("/v1/me/favorites")
          )?.favorites?.some((item) => item.businessId === id),
        )
      : false;
  const detailPath = `/app/isletmeler/${id}`;

  return (
    <>
      <p>
        <Link href="/app">{app.back}</Link>
      </p>
      <header className="am-head">
        <p className="t-label">{biz.category}</p>
        <h1>{biz.name}</h1>
        <p className="am-note">{[biz.city, biz.category].filter(Boolean).join(" · ")}</p>
        {biz.sample ? <Badge tone="sample">{app.example}</Badge> : null}
      </header>
      {biz.sample ? <p className="am-banner">{app.exampleNote}</p> : null}
      {session && UUID.test(id) ? <FavoriteToggle businessId={id} initial={favorited} /> : null}
      {session ? null : (
        <p>
          <Link className="btn btn-ghost" href={loginUrl({ next: detailPath })}>
            {app.loginToFavorite}
          </Link>
        </p>
      )}
      <h2 className="am-sec">
        <span>{app.servicesTitle}</span>
      </h2>
      {biz.services.length ? (
        biz.services.map((svc, index) => (
          <div className={index === 0 ? "am-svc is-on" : "am-svc"} key={svc.id}>
            <div>
              <h3>{svc.name}</h3>
              <p>{app.priceAsk}</p>
            </div>
            {svc.durationMinutes ? (
              <span className="am-svc-dur">
                {svc.durationMinutes} {app.minutes}
              </span>
            ) : null}
          </div>
        ))
      ) : (
        <p className="am-note">{app.priceAsk}</p>
      )}
      <ReservationFlow
        businessId={biz.id}
        businessName={biz.name}
        sample={biz.sample}
        signedIn={Boolean(session)}
        canSubmit={Boolean(session && UUID.test(id))}
        services={biz.services}
        days={days}
        slotsByDate={slotsByDate}
        detailPath={detailPath}
        initialOpen={query.rezervasyon === "1"}
        bookLabel={app.book}
      />
    </>
  );
}
