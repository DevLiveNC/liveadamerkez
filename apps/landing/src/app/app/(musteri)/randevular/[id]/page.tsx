import Link from "next/link";
import { app, emptyState } from "@ada-merkez/copy";
import { Badge } from "@ada-merkez/ui";
import { formatInNicosia, utcToNicosiaParts } from "@ada-merkez/shared";
import { requireRole } from "../../../../../lib/app-auth";
import { serverApi } from "../../../../../lib/app-api";

type BookingRow = {
  id: string;
  status: string;
  startsAt: string | Date;
  businessName: string;
  sample: boolean;
  city: string | null;
  serviceName: string | null;
};

export default async function TalepIletildiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireRole("customer", `/app/randevular/${id}`);
  const data = await serverApi<{ ok?: boolean; bookings?: BookingRow[] }>("/v1/me/bookings");
  const row = data?.ok ? data.bookings?.find((item) => item.id === id) : undefined;
  const parts = row ? utcToNicosiaParts(new Date(row.startsAt)) : null;
  const month = row
    ? new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "Europe/Nicosia" }).format(new Date(row.startsAt))
    : "";

  return (
    <main id="icerik" className="am-main am-ui-main">
      <header className="am-header">
        <Link className="am-icon-btn" href="/app" aria-label={app.bookingBackDiscover}>
          ×
        </Link>
        <h1 className="am-header-title">{app.bookingSentTitle}</h1>
        <span style={{ width: 44 }} />
      </header>
      <div className="am-success">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/maskot/kabuki-dusunen-512.webp"
          srcSet="/landing/maskot/kabuki-dusunen.webp 160w, /landing/maskot/kabuki-dusunen-512.webp 320w"
          sizes="160px"
          width={160}
          height={160}
          alt={emptyState["onay-bekliyor"].alt}
        />
        <div style={{ margin: "8px 0 12px" }}>
          <Badge tone="pending">{app.bookingPending}</Badge>
        </div>
        <h1>{app.bookingSentHeading}</h1>
        <p className="lead">
          {row ? `${row.businessName} ${app.bookingSentLead}` : app.bookingSentLeadGeneric}
        </p>
      </div>
      {row ? (
        <article className="am-appt am-appt--pending">
          <div className="am-appt-date">
            <span className="d">{parts?.day ?? ""}</span>
            <span className="m">{month}</span>
          </div>
          <div style={{ minWidth: 0 }}>
            <h3>{row.businessName}</h3>
            <p>
              {[row.serviceName, formatInNicosia(new Date(row.startsAt))].filter(Boolean).join(" · ")}
            </p>
            {row.city ? <p>{row.city}</p> : null}
            <div className="am-appt-badges">
              <Badge tone="pending">{app.bookingPending}</Badge>
              {row.sample ? <Badge tone="sample">{app.example}</Badge> : null}
            </div>
          </div>
        </article>
      ) : null}
      <div className="flex-col gap-2 mt-4">
        <Link className="am-btn am-btn--primary am-btn--block" href="/app/randevular">
          {app.bookingGoAppointments}
        </Link>
        <Link className="am-btn am-btn--ghost am-btn--block" href="/app">
          {app.bookingBackDiscover}
        </Link>
      </div>
    </main>
  );
}
