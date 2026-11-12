import Link from "next/link";
import { notFound } from "next/navigation";
import { app, examples } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { Badge, UiIcon } from "@ada-merkez/ui";
import { BackButton } from "../../../../components/app/BackButton";
import { BusinessGallery } from "../../../../components/app/BusinessGallery";
import { FavoriteToggle } from "../../../../components/app/FavoriteToggle";
import { ReservationFlow } from "../../../../components/app/ReservationFlow";
import type { SheetSlot } from "../../../../components/app/ReservationSheet";
import { getSession } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";
import { exampleCard } from "../../../../lib/discover";
import { nicosiaDayStrip } from "../../../../lib/nicosia-days";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function stock(name: string) {
  return `/landing/stok/${name}.webp`;
}

function galleryFor(image?: string | null): string[] {
  if (!image) return [];
  if (image === "kuafor-salon") return [stock("kuafor-salon"), stock("kuafor-makas"), stock("restoran-sofra")];
  if (image === "kuafor-makas") return [stock("kuafor-makas"), stock("kuafor-salon"), stock("restoran-sofra")];
  return [stock(image), stock("kuafor-salon"), stock("kuafor-makas")];
}

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
  const exampleMeta = example ? examples.cards.find((card) => card.name === example.name) : undefined;
  const biz = live?.ok && live.business
    ? {
        id: live.business.id,
        name: live.business.name,
        sample: live.business.sample,
        city: live.business.city,
        category: live.business.category,
        services: live.business.services,
        image: null as string | null,
      }
    : example
      ? {
          id: example.id,
          name: example.name,
          sample: example.sample,
          city: example.city,
          category: example.category,
          services: example.serviceName ? [{ id: "ornek", name: example.serviceName }] : [],
          image: exampleMeta?.image ?? null,
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
  const loginHref = loginUrl({ next: `/app/isletmeler/${id}` });
  const slides = galleryFor(biz.image);
  const heartHref = session && UUID.test(id) ? undefined : loginHref;
  const detailPath = `/app/isletmeler/${id}`;

  return (
    <>
      <BusinessGallery
        slides={slides}
        nav={
          <div className="am-gallery-nav">
            <BackButton label={app.back} className="am-back--on-image" />
            <div className="am-header-side">
              {session && UUID.test(id) ? (
                <FavoriteToggle businessId={id} initial={favorited} icon />
              ) : (
                <Link className="am-icon-btn am-icon-btn--light" href={heartHref ?? loginHref} aria-label={app.loginToFavorite}>
                  <UiIcon name="heart" />
                </Link>
              )}
              <span className="am-icon-btn am-icon-btn--light" aria-hidden="true">
                <UiIcon name="share" />
              </span>
            </div>
          </div>
        }
      />
      <div className="am-biz-hero-meta">
        <div className="am-biz-title-row" style={{ marginBottom: 6 }}>
          {biz.sample ? <Badge tone="sample">{app.example}</Badge> : null}
          {biz.sample ? <Badge tone="new">{app.newBadge}</Badge> : null}
        </div>
        <h1>{biz.name}</h1>
        <p className="am-meta-row">
          <UiIcon name="pin" className="am-icon am-icon-sm" />
          <span>{[biz.city, biz.category].filter(Boolean).join(" · ")}</span>
        </p>
      </div>
      {biz.sample ? <p className="am-note">{app.exampleNote}</p> : null}
      <h2 className="am-sec">
        <span>{app.services}</span>
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
      <p className="am-wa mt-3">
        <UiIcon name="message" /> {app.messageWa}
      </p>
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
