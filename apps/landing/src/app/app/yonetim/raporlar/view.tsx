"use client";

import { useEffect, useMemo, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
import { EmptyState } from "../../../../components/app/EmptyState";
import { SampleBadge } from "../../../../components/panel/SampleBadge";
import { WeekChart } from "../../../../components/panel/WeekChart";
import {
  fetchBookings,
  type AdminBooking,
  type AdminBookingCounted,
} from "../../../../lib/yonetim-api";

const SAMPLE_KPI = { week: 41, wa: 11, app: 30 };
const SAMPLE_WEEK = [5, 7, 6, 8, 9, 4, 2];

function weekStart(day: Date) {
  const parts = utcToNicosiaParts(day);
  const asUtc = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
  const weekday = (asUtc.getUTCDay() + 6) % 7;
  return nicosiaWallTimeToUtc(parts.year, parts.month, parts.day - weekday, 0, 0);
}

function inThisWeek(iso: string, startMs: number, endMs: number) {
  const at = new Date(iso).getTime();
  return at >= startMs && at < endMs;
}

export function RaporlarView() {
  const [bookings, setBookings] = useState<AdminBooking[] | null>(null);
  const [counted, setCounted] = useState<AdminBookingCounted | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const start = weekStart(new Date());
    const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
    fetchBookings({ from: start.toISOString(), to: end.toISOString() })
      .then((data) => {
        setBookings(data.bookings);
        setCounted(data.counted ?? null);
        setTruncated(Boolean(data.truncated));
      })
      .catch(() => setError(true));
  }, []);

  const week = useMemo(() => {
    const start = weekStart(new Date());
    const startMs = start.getTime();
    const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
    const counts = [0, 0, 0, 0, 0, 0, 0];
    let wa = 0;
    let app = 0;
    for (const row of bookings ?? []) {
      if (row.status === "cancelled" || row.status === "no_show") continue;
      if (!inThisWeek(row.startsAt, startMs, endMs)) continue;
      const parts = utcToNicosiaParts(new Date(row.startsAt));
      const asUtc = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
      const idx = (asUtc.getUTCDay() + 6) % 7;
      counts[idx] = (counts[idx] ?? 0) + 1;
      if (row.channel === "whatsapp") wa += 1;
      else app += 1;
    }
    return { counts, wa, app, total: wa + app };
  }, [bookings]);

  if (error) return <EmptyState kind="hata" />;
  if (!bookings) return null;

  const kpiTotal = counted?.total ?? week.total;
  const kpiWa = counted?.wa ?? week.wa;
  const kpiApp = counted?.app ?? week.app;
  const live = kpiTotal > 0;

  return (
    <>
      <div className="am-kpis">
        <article className="am-kpi">
          <p className="am-kicker">{live ? yonetimApp.statWeekBookings : yonetimApp.statWeekBookingsSample}</p>
          <p className="am-kpi-val">{live ? kpiTotal : SAMPLE_KPI.week}</p>
          <p className="hint">{yonetimApp.statWeekBookingsHint}</p>
          {live ? null : <SampleBadge />}
        </article>
        <article className="am-kpi">
          <p className="am-kicker">{yonetimApp.statWaRequests}</p>
          <p className="am-kpi-val">{live ? kpiWa : SAMPLE_KPI.wa}</p>
          <p className="hint">{yonetimApp.statWaHint}</p>
          {live ? null : <SampleBadge />}
        </article>
        <article className="am-kpi">
          <p className="am-kicker">{yonetimApp.statAppRequests}</p>
          <p className="am-kpi-val">{live ? kpiApp : SAMPLE_KPI.app}</p>
          <p className="hint">{yonetimApp.statAppHint}</p>
          {live ? null : <SampleBadge />}
        </article>
        <article className="am-kpi">
          <p className="am-kicker">{yonetimApp.statEvents}</p>
          <p className="am-kpi-val is-text">{yonetimApp.eventsSoon}</p>
          <p className="hint">{yonetimApp.eventsSoonHint}</p>
          <span className="am-badge am-badge--soon">{yonetimApp.eventsSoon}</span>
        </article>
      </div>
      <section className="am-panel-card">
        <h2>
          {live ? yonetimApp.weekVolume : yonetimApp.weekVolumeSample} {live ? null : <SampleBadge />}
        </h2>
        <WeekChart values={live ? week.counts : SAMPLE_WEEK} label={yonetimApp.weekVolumeSample} />
        {live ? null : <p className="am-chart-caption">{yonetimApp.reportsChartNote}</p>}
        {truncated ? <p className="am-chart-caption">{yonetimApp.listTruncated}</p> : null}
      </section>
      <section className="am-panel-card mt-4">
        <h2>
          {yonetimApp.statEvents} <span className="am-badge am-badge--soon">{yonetimApp.eventsSoon}</span>
        </h2>
        <p className="am-muted">{yonetimApp.eventsBody}</p>
      </section>
    </>
  );
}
