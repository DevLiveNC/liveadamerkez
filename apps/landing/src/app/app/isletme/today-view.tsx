"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
import { EmptyKabuki } from "../../../components/isletme/EmptyKabuki";
import {
  fetchBookings,
  fetchServices,
  fetchSlots,
  formatNicosiaDate,
  initials,
  type BookingRow,
  type ServiceRow,
  type SlotCell,
} from "../../../lib/isletme-api";

const HOUR_PX = 52;

function dayBounds(day: Date) {
  const parts = utcToNicosiaParts(day);
  const from = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0);
  const to = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + 1, 0, 0);
  return { from, to, parts };
}

function shiftDay(day: Date, delta: number) {
  const parts = utcToNicosiaParts(day);
  return nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + delta, 12, 0);
}

export function TodayView() {
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

  const hours = useMemo(() => {
    const times = [
      ...bookings.map((row) => utcToNicosiaParts(new Date(row.startsAt)).hour),
      ...bookings.map((row) => utcToNicosiaParts(new Date(row.endsAt)).hour),
      ...slots.map((row) => utcToNicosiaParts(new Date(row.startsAt)).hour),
    ];
    if (!times.length) return [] as number[];
    const min = Math.min(...times);
    const max = Math.max(Math.max(...times), min + 1);
    const list: number[] = [];
    for (let h = min; h <= max; h += 1) list.push(h);
    return list;
  }, [bookings, slots]);

  const heading = formatNicosiaDate(day.toISOString(), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  if (!loaded) return <div className="isletme-head" />;
  if (error) return <EmptyKabuki kind="hata" />;

  const empty = bookings.length === 0 && slots.length === 0;

  return (
    <div>
      <div className="isletme-head">
        <p className="t-label">{heading}</p>
        <h1>{isletmeApp.todayTitle}</h1>
        <p className="t-sm t-muted">{isletmeApp.tz}. İsimler baş harftir.</p>
      </div>
      <div className="day-nav">
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDay(shiftDay(day, -1))}>
          {isletmeApp.prevDay}
        </button>
        <button className="btn btn-navy btn-sm" type="button" onClick={() => setDay(new Date())}>
          {isletmeApp.today}
        </button>
        <button className="btn btn-ghost btn-sm" type="button" onClick={() => setDay(shiftDay(day, 1))}>
          {isletmeApp.nextDay}
        </button>
      </div>
      {empty ? (
        <EmptyKabuki
          kind="rezervasyon-yok"
          title={isletmeApp.todayEmptyTitle}
          body={isletmeApp.todayEmptyBody}
        />
      ) : (
        <DayCalendar hours={hours} bookings={bookings} slots={slots} services={services} />
      )}
    </div>
  );
}

function DayCalendar({
  hours,
  bookings,
  slots,
  services,
}: {
  hours: number[];
  bookings: BookingRow[];
  slots: SlotCell[];
  services: ServiceRow[];
}) {
  const startHour = hours[0] ?? 9;
  const height = Math.max(hours.length, 1) * HOUR_PX;
  const serviceName = (id: string | null) => services.find((row) => row.id === id)?.name ?? "Randevu";

  return (
    <div className="cal" style={{ minHeight: height + 32 }}>
      <div className="cal-times" style={{ gridTemplateRows: `repeat(${hours.length}, ${HOUR_PX}px)` }}>
        {hours.map((hour) => (
          <time key={hour}>{String(hour).padStart(2, "0")}:00</time>
        ))}
      </div>
      <div className="cal-track" style={{ height }}>
        {slots
          .filter((slot) => slot.status === "free")
          .map((slot) => {
            const pos = position(slot.startsAt, slot.endsAt, startHour);
            return (
              <div
                key={`free-${slot.startsAt}`}
                className="apt apt-free"
                style={{ top: pos.top, height: pos.height }}
              >
                {isletmeApp.free}
              </div>
            );
          })}
        {bookings.map((row) => {
          const pos = position(row.startsAt, row.endsAt, startHour);
          const cls =
            row.status === "confirmed"
              ? "apt apt-confirmed"
              : row.status === "pending"
                ? "apt apt-pending"
                : "apt apt-cancelled";
          return (
            <div key={row.id} className={cls} style={{ top: pos.top, height: pos.height }}>
              <b>{serviceName(row.serviceId)}</b> {initials(row.customerName)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function position(startsAt: string, endsAt: string, startHour: number) {
  const start = utcToNicosiaParts(new Date(startsAt));
  const end = utcToNicosiaParts(new Date(endsAt));
  const startMin = start.hour * 60 + start.minute - startHour * 60;
  const endMin = end.hour * 60 + end.minute - startHour * 60;
  return {
    top: Math.max(0, (startMin / 60) * HOUR_PX + 4),
    height: Math.max(36, ((endMin - startMin) / 60) * HOUR_PX - 8),
  };
}
