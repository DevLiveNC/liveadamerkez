"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
import { EmptyKabuki } from "../../../../components/isletme/EmptyKabuki";
import { SampleBadge } from "../../../../components/panel/SampleBadge";
import {
  fetchBookings,
  fetchServices,
  fetchSlots,
  formatNicosiaDate,
  initials,
  type BookingRow,
  type ServiceRow,
  type SlotCell,
} from "../../../../lib/isletme-api";

const HOUR_PX = 64;
const START_HOUR = 9;
const HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const DOW = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function shiftDay(day: Date, delta: number) {
  const parts = utcToNicosiaParts(day);
  return nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + delta, 12, 0);
}

function weekDays(day: Date) {
  const parts = utcToNicosiaParts(day);
  const noon = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
  const weekday = (noon.getUTCDay() + 6) % 7;
  const start = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day - weekday, 12, 0);
  return Array.from({ length: 7 }, (_, i) => shiftDay(start, i));
}

function dayBounds(day: Date) {
  const parts = utcToNicosiaParts(day);
  return {
    from: nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0),
    to: nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + 1, 0, 0),
    parts,
  };
}

function position(startsAt: string, endsAt: string) {
  const start = utcToNicosiaParts(new Date(startsAt));
  const end = utcToNicosiaParts(new Date(endsAt));
  const startMin = start.hour * 60 + start.minute - START_HOUR * 60;
  const endMin = end.hour * 60 + end.minute - START_HOUR * 60;
  return {
    top: Math.max(0, (startMin / 60) * HOUR_PX),
    height: Math.max(24, ((endMin - startMin) / 60) * HOUR_PX - 4),
  };
}

export function TakvimView() {
  const [day, setDay] = useState(() => new Date());
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [slots, setSlots] = useState<SlotCell[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const { from, to } = dayBounds(day);
    const [b, s, svc] = await Promise.all([
      fetchBookings({ from: from.toISOString(), to: to.toISOString() }),
      fetchSlots({ from: from.toISOString(), days: 1 }),
      fetchServices().catch(() => ({ services: [] as ServiceRow[] })),
    ]);
    setBookings(b.bookings);
    setSlots(s.slots);
    setServices(svc.services);
    setError(false);
    setLoaded(true);
  }, [day]);

  useEffect(() => {
    void load().catch(() => {
      setError(true);
      setLoaded(true);
    });
  }, [load]);

  const days = useMemo(() => weekDays(day), [day]);
  const selected = utcToNicosiaParts(day);
  const heading = formatNicosiaDate(day.toISOString(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!loaded) return null;
  if (error) return <EmptyKabuki kind="hata" />;

  const empty = bookings.length === 0 && slots.length === 0;
  const serviceName = (id: string | null) => services.find((row) => row.id === id)?.name ?? "Randevu";

  return (
    <>
      <p className="am-muted" style={{ marginBottom: 12 }}>
        {heading}. {isletmeApp.tz}.
      </p>
      <div className="am-week">
        {days.map((item) => {
          const parts = utcToNicosiaParts(item);
          const on = parts.day === selected.day && parts.month === selected.month;
          return (
            <button
              key={`${parts.year}-${parts.month}-${parts.day}`}
              type="button"
              className={`am-week-d${on ? " is-on" : ""}`}
              onClick={() => setDay(item)}
            >
              <span className="dow">{DOW[(item.getUTCDay() + 6) % 7]}</span>
              <span className="num">{parts.day}</span>
            </button>
          );
        })}
      </div>
      <section className="am-panel-card">
        <h2>
          {isletmeApp.todayFlow} {empty ? <SampleBadge /> : null}
        </h2>
        {empty ? (
          <EmptyKabuki kind="rezervasyon-yok" title={isletmeApp.todayEmptyTitle} body={isletmeApp.todayEmptyBody} />
        ) : (
          <div className="am-daycal">
            <div>
              {HOURS.map((hour) => (
                <div key={hour} className="am-daycal-hour">
                  {String(hour).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            <div className="am-daycal-slots">
              {HOURS.map((hour) => (
                <div key={hour} className="line" />
              ))}
              {slots
                .filter((slot) => slot.status === "free")
                .map((slot) => {
                  const pos = position(slot.startsAt, slot.endsAt);
                  return (
                    <div
                      key={`free-${slot.startsAt}`}
                      className="am-cal-block is-free"
                      style={{ top: pos.top, height: pos.height }}
                    >
                      <strong>{isletmeApp.free}</strong>
                    </div>
                  );
                })}
              {bookings.map((row) => {
                const pos = position(row.startsAt, row.endsAt);
                const kind =
                  row.status === "confirmed" ? "confirmed" : row.status === "pending" ? "pending" : "cancelled";
                const status =
                  row.status === "confirmed"
                    ? isletmeApp.statusConfirmed
                    : row.status === "pending"
                      ? isletmeApp.statusPending
                      : "İptal";
                return (
                  <div
                    key={row.id}
                    className={`am-cal-block is-${kind}`}
                    style={{ top: pos.top, height: pos.height }}
                  >
                    <strong>
                      {serviceName(row.serviceId)} · {status}
                    </strong>
                    {pos.height >= 40 ? <span>{initials(row.customerName)}</span> : null}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
