"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
import { SampleBadge } from "../../../components/panel/SampleBadge";
import { EmptyKabuki } from "../../../components/isletme/EmptyKabuki";
import {
  fetchBookings,
  fetchServices,
  fetchSlots,
  fetchStats,
  formatNicosiaDate,
  initials,
  type BookingRow,
  type ServiceRow,
  type SlotCell,
  type StatsRow,
} from "../../../lib/isletme-api";

const SAMPLE_KPI = { requests: 12, confirmed: 8, pending: 3, free: 4 };
const SAMPLE_WEEK = [5, 7, 6, 8, 9, 4, 2];
const WEEK_LABELS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

function dayBounds(day: Date) {
  const parts = utcToNicosiaParts(day);
  const from = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 0, 0);
  const to = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + 1, 0, 0);
  return { from, to };
}

function weekStart(day: Date) {
  const parts = utcToNicosiaParts(day);
  const asUtc = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
  const weekday = (asUtc.getUTCDay() + 6) % 7;
  return nicosiaWallTimeToUtc(parts.year, parts.month, parts.day - weekday, 0, 0);
}

export function GenelView() {
  const [stats, setStats] = useState<StatsRow | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [weekBookings, setWeekBookings] = useState<BookingRow[]>([]);
  const [slots, setSlots] = useState<SlotCell[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const now = new Date();
    const { from, to } = dayBounds(now);
    const start = weekStart(now);
    const weekEnd = nicosiaWallTimeToUtc(
      utcToNicosiaParts(start).year,
      utcToNicosiaParts(start).month,
      utcToNicosiaParts(start).day + 7,
      0,
      0,
    );
    const [st, b, wb, s, svc] = await Promise.all([
      fetchStats(),
      fetchBookings({ from: from.toISOString(), to: to.toISOString() }),
      fetchBookings({ from: start.toISOString(), to: weekEnd.toISOString() }),
      fetchSlots({ from: from.toISOString(), days: 1 }),
      fetchServices().catch(() => ({ services: [] as ServiceRow[] })),
    ]);
    setStats(st.stats);
    setBookings(b.bookings);
    setWeekBookings(wb.bookings);
    setSlots(s.slots);
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

  const freeCount = slots.filter((slot) => slot.status === "free").length;
  const hasKpi =
    Boolean(stats) &&
    ((stats?.todayConfirmed ?? 0) +
      (stats?.todayPending ?? 0) +
      (stats?.weekConfirmed ?? 0) +
      (stats?.pendingIncoming ?? 0) +
      freeCount >
      0);

  const weekCounts = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const row of weekBookings) {
      if (row.status === "cancelled" || row.status === "no_show") continue;
      const parts = utcToNicosiaParts(new Date(row.startsAt));
      const asUtc = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
      const idx = (asUtc.getUTCDay() + 6) % 7;
      counts[idx] = (counts[idx] ?? 0) + 1;
    }
    return counts;
  }, [weekBookings]);
  const hasWeek = weekCounts.some((n) => n > 0);
  const chart = hasWeek ? weekCounts : SAMPLE_WEEK;
  const maxBar = Math.max(...chart, 1);

  const flow = useMemo(() => {
    const items: { time: string; title: string; meta: string; kind: "confirmed" | "pending" | "free" }[] = [];
    for (const row of bookings.filter((item) => item.status !== "cancelled" && item.status !== "no_show")) {
      const service = services.find((svc) => svc.id === row.serviceId)?.name ?? "Randevu";
      items.push({
        time: formatNicosiaDate(row.startsAt, { hour: "2-digit", minute: "2-digit" }),
        title: service,
        meta: `${initials(row.customerName)} · ${
          row.channel === "whatsapp" ? isletmeApp.sourceWa : isletmeApp.sourceApp
        } · ${row.status === "confirmed" ? isletmeApp.statusConfirmed : isletmeApp.statusPending}`,
        kind: row.status === "confirmed" ? "confirmed" : "pending",
      });
    }
    for (const slot of slots.filter((item) => item.status === "free")) {
      items.push({
        time: formatNicosiaDate(slot.startsAt, { hour: "2-digit", minute: "2-digit" }),
        title: isletmeApp.free,
        meta: "Uygun",
        kind: "free",
      });
    }
    return items.sort((a, b) => a.time.localeCompare(b.time, "tr"));
  }, [bookings, services, slots]);

  if (!loaded) return null;
  if (error) return <EmptyKabuki kind="hata" />;

  const kpis = hasKpi
    ? [
        {
          label: isletmeApp.todayRequests,
          value: (stats?.todayConfirmed ?? 0) + (stats?.todayPending ?? 0),
          hint: `${isletmeApp.sourceApp} ve ${isletmeApp.sourceWa}`,
        },
        { label: "Onaylı", value: stats?.todayConfirmed ?? 0, hint: "Bugünün onaylı randevuları" },
        { label: "Onay bekliyor", value: stats?.todayPending ?? 0, hint: "İşletme yanıtı beklenen" },
        { label: isletmeApp.free, value: freeCount, hint: "Görünen uygun aralık" },
      ]
    : [
        { label: isletmeApp.todayRequests, value: SAMPLE_KPI.requests, hint: `${isletmeApp.sourceApp} ve ${isletmeApp.sourceWa}` },
        { label: "Onaylı", value: SAMPLE_KPI.confirmed, hint: "Bugünün onaylı randevuları" },
        { label: "Onay bekliyor", value: SAMPLE_KPI.pending, hint: "İşletme yanıtı beklenen" },
        { label: isletmeApp.free, value: SAMPLE_KPI.free, hint: "Görünen uygun aralık" },
      ];

  const sampleFlow = [
    { time: "09:00", title: "Örnek kesim", meta: "Örnek müşteri · 45 dk · Onaylı", kind: "confirmed" as const },
    { time: "10:00", title: isletmeApp.free, meta: "45 dk uygun", kind: "free" as const },
    { time: "11:00", title: "Örnek kesim", meta: `Örnek müşteri · ${isletmeApp.sourceWa} · Onay bekliyor`, kind: "pending" as const },
    { time: "14:00", title: "Örnek sakal", meta: "Örnek müşteri · 20 dk · Onaylı", kind: "confirmed" as const },
    { time: "16:00", title: isletmeApp.free, meta: "60 dk uygun", kind: "free" as const },
  ];
  const shownFlow = flow.length ? flow : sampleFlow;
  const flowSample = flow.length === 0;

  return (
    <>
      <div className="am-kpis">
        {kpis.map((kpi) => (
          <article key={kpi.label} className="am-kpi">
            <p className="am-kicker">{kpi.label}</p>
            <p className="am-kpi-val">{kpi.value}</p>
            <p className="hint">{kpi.hint}</p>
            {hasKpi ? null : <SampleBadge />}
          </article>
        ))}
      </div>
      <div className="am-grid-2">
        <section className="am-panel-card">
          <h2>
            {hasWeek ? "Haftalık talepler" : isletmeApp.weekChart} {hasWeek ? null : <SampleBadge />}
          </h2>
          <svg className="am-chart" viewBox="0 0 420 200" role="img" aria-label={isletmeApp.weekChart}>
            {chart.map((value, index) => {
              const height = Math.max(8, (value / maxBar) * 126);
              const x = 24 + index * 56;
              const y = 160 - height;
              const fill = index === 2 ? "#0F2C44" : "#0E7C78";
              return (
                <g key={WEEK_LABELS[index]}>
                  <rect x={x} y={y} width={40} height={height} rx={6} fill={fill} />
                  <text x={x + 20} y={y - 6} textAnchor="middle" fontSize="11" fill="#0A4F4D" fontFamily="Inter">
                    {value}
                  </text>
                  <text x={x + 20} y={180} textAnchor="middle" fontSize="11" fill="#6E5E4E" fontFamily="Inter">
                    {WEEK_LABELS[index]}
                  </text>
                </g>
              );
            })}
          </svg>
          {hasWeek ? null : <p className="am-chart-caption">{isletmeApp.chartNote}</p>}
        </section>
        <section className="am-panel-card">
          <h2>
            {isletmeApp.todayFlow} {flowSample ? <SampleBadge /> : null}
          </h2>
          <div className="am-flow">
            {shownFlow.map((item) => (
              <div key={`${item.time}-${item.title}-${item.kind}`} className="am-flow-item">
                <div className="am-flow-time">{item.time}</div>
                <div className="am-flow-rail">
                  <span className={`am-flow-dot is-${item.kind}`} />
                </div>
                <div className="am-flow-body">
                  <h3>{item.title}</h3>
                  <p>{item.meta}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
