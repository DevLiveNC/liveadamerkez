import { app } from "@ada-merkez/copy";
import { formatInNicosia } from "@ada-merkez/shared";
import { CancelBookingButton } from "../../../../components/app/CancelBookingButton";
import { EmptyState } from "../../../../components/app/EmptyState";
import { requireRole } from "../../../../lib/app-auth";
import { serverApi } from "../../../../lib/app-api";

type BookingRow = {
  id: string;
  status: string;
  startsAt: string | Date;
  businessName: string;
  sample: boolean;
  city: string | null;
  serviceName: string | null;
};

function bookingStatusLabel(status: string): string {
  if (status === "pending") return app.bookingPending;
  if (status === "confirmed") return app.bookingConfirmed;
  if (status === "cancelled") return app.bookingCancelled;
  if (status === "no_show") return app.bookingNoShow;
  return status;
}

export default async function RandevularPage() {
  await requireRole("customer", "/app/randevular");
  const data = await serverApi<{ ok?: boolean; bookings?: BookingRow[] }>("/v1/me/bookings");
  const bookings = data?.ok ? (data.bookings ?? []) : [];

  return (
    <>
      <header className="am-head">
        <h1>{app.bookings}</h1>
      </header>
      {bookings.length ? (
        bookings.map((row) => (
          <article className="am-biz" key={row.id}>
            <div>
              <h2>{row.businessName}</h2>
              <p>
                {formatInNicosia(new Date(row.startsAt))}
                {row.serviceName ? ` · ${row.serviceName}` : ""}
                {row.city ? ` · ${row.city}` : ""}
              </p>
              <p className="am-note">{bookingStatusLabel(row.status)}</p>
            </div>
            {row.sample ? <span className="badge-ornek">{app.example}</span> : null}
            {row.status === "pending" || row.status === "confirmed" ? (
              <CancelBookingButton bookingId={row.id} />
            ) : null}
          </article>
        ))
      ) : (
        <EmptyState kind="rezervasyon-yok" />
      )}
    </>
  );
}
