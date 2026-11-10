"use client";

import { useCallback, useEffect, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { EmptyKabuki } from "../../../../components/isletme/EmptyKabuki";
import {
  fetchBookings,
  fetchServices,
  formatNicosiaDate,
  initials,
  patchBooking,
  type BookingRow,
  type ServiceRow,
} from "../../../../lib/isletme-api";

export function GelenView() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [bookings, svc] = await Promise.all([
      fetchBookings({ status: "pending" }),
      fetchServices().catch(() => ({ services: [] as ServiceRow[] })),
    ]);
    setRows(bookings.bookings);
    setServices(svc.services);
    setError(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setError(true);
      setLoaded(true);
    });
  }, [load]);

  async function act(id: string, status: "confirmed" | "cancelled") {
    setBusyId(id);
    try {
      await patchBooking(id, status);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  if (!loaded) return <div className="isletme-head" />;
  if (error) return <EmptyKabuki kind="hata" />;

  return (
    <div>
      <div className="isletme-head">
        <h1>{isletmeApp.inboxTitle}</h1>
        <p className="t-sm t-muted">{isletmeApp.inboxLead}</p>
      </div>
      {rows.length === 0 ? (
        <EmptyKabuki
          kind="rezervasyon-yok"
          title={isletmeApp.inboxEmptyTitle}
          body={isletmeApp.inboxEmptyBody}
        />
      ) : (
        rows.map((row) => {
          const service = services.find((item) => item.id === row.serviceId)?.name ?? "Randevu";
          const when = `${formatNicosiaDate(row.startsAt, { weekday: "short", day: "numeric", month: "short" })} ${formatNicosiaDate(row.startsAt, { hour: "2-digit", minute: "2-digit" })}`;
          return (
            <article key={row.id} className="req is-wait">
              <div>
                <h3>
                  {when} · {service}
                </h3>
                <p>
                  {row.channel === "whatsapp" ? isletmeApp.whatsappChannel : isletmeApp.appChannel}
                  {" · "}
                  {initials(row.customerName)}
                </p>
                {row.notes ? <p>{row.notes}</p> : null}
              </div>
              <div className="acts">
                <button
                  className="btn btn-coral btn-sm"
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void act(row.id, "confirmed")}
                >
                  {isletmeApp.approve}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  disabled={busyId === row.id}
                  onClick={() => void act(row.id, "cancelled")}
                >
                  {isletmeApp.reject}
                </button>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}
