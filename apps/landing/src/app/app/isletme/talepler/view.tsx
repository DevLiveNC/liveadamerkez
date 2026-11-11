"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { EmptyKabuki } from "../../../../components/isletme/EmptyKabuki";
import { IconApp, IconMessage } from "../../../../components/panel/icons";
import {
  fetchBookings,
  fetchServices,
  formatNicosiaDate,
  initials,
  patchBooking,
  type BookingRow,
  type ServiceRow,
} from "../../../../lib/isletme-api";

type Filter = "all" | "pending" | "confirmed" | "whatsapp" | "app";

function badgeFor(status: BookingRow["status"]) {
  if (status === "confirmed") return { cls: "am-badge am-badge--confirmed", label: isletmeApp.statusConfirmed };
  if (status === "pending") return { cls: "am-badge am-badge--pending", label: isletmeApp.statusPending };
  return { cls: "am-badge am-badge--cancelled", label: "İptal" };
}

export function TaleplerView() {
  const [rows, setRows] = useState<BookingRow[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [bookings, svc] = await Promise.all([
      fetchBookings({}),
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

  const visible = useMemo(() => {
    return rows.filter((row) => {
      if (filter === "pending") return row.status === "pending";
      if (filter === "confirmed") return row.status === "confirmed";
      if (filter === "whatsapp") return row.channel === "whatsapp";
      if (filter === "app") return row.channel === "app";
      return true;
    });
  }, [rows, filter]);

  if (!loaded) return null;
  if (error) return <EmptyKabuki kind="hata" />;

  const chips: { id: Filter; label: string; extra?: "filter" }[] = [
    { id: "all", label: "Tümü" },
    { id: "pending", label: isletmeApp.statusPending, extra: "filter" },
    { id: "confirmed", label: isletmeApp.statusConfirmed },
    { id: "whatsapp", label: isletmeApp.sourceWa },
    { id: "app", label: isletmeApp.sourceApp },
  ];

  return (
    <>
      <div className="am-toolbar">
        {chips.map((chip) => (
          <button
            key={chip.id}
            type="button"
            className={`am-chip${filter === chip.id ? " am-chip--on" : chip.extra === "filter" ? " am-chip--filter" : ""}`}
            onClick={() => setFilter(chip.id)}
          >
            {chip.id === "whatsapp" ? <IconMessage /> : null}
            {chip.label}
          </button>
        ))}
      </div>
      <section className="am-panel-card">
        <h2>{isletmeApp.inboxTitle}</h2>
        {visible.length === 0 ? (
          <EmptyKabuki kind="rezervasyon-yok" title={isletmeApp.inboxEmptyTitle} body={isletmeApp.inboxEmptyBody} />
        ) : (
          <div className="am-table-wrap">
            <table className="am-table">
              <thead>
                <tr>
                  <th>Saat</th>
                  <th>Müşteri</th>
                  <th>Hizmet</th>
                  <th>Kaynak</th>
                  <th>Durum</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {visible.map((row) => {
                  const service = services.find((item) => item.id === row.serviceId)?.name ?? "Randevu";
                  const badge = badgeFor(row.status);
                  return (
                    <tr key={row.id}>
                      <td data-th="Saat" className="num">
                        {formatNicosiaDate(row.startsAt, { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td data-th="Müşteri">{initials(row.customerName)}</td>
                      <td data-th="Hizmet">{service}</td>
                      <td data-th="Kaynak">
                        {row.channel === "whatsapp" ? <IconMessage /> : <IconApp />}{" "}
                        {row.channel === "whatsapp" ? isletmeApp.sourceWa : isletmeApp.sourceApp}
                      </td>
                      <td data-th="Durum">
                        <span className={badge.cls}>{badge.label}</span>
                      </td>
                      <td data-th="">
                        {row.status === "pending" ? (
                          <>
                            <button
                              className="am-btn am-btn--primary am-btn--sm"
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => void act(row.id, "confirmed")}
                            >
                              {isletmeApp.approve}
                            </button>{" "}
                            <button
                              className="am-btn am-btn--ghost am-btn--sm"
                              type="button"
                              disabled={busyId === row.id}
                              onClick={() => void act(row.id, "cancelled")}
                            >
                              {isletmeApp.reject}
                            </button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
