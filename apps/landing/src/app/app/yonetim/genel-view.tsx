"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
import { EmptyState } from "../../../components/app/EmptyState";
import { SampleBadge } from "../../../components/panel/SampleBadge";
import { WeekChart } from "../../../components/panel/WeekChart";
import {
  fetchApplications,
  fetchHealth,
  fetchReports,
  type AdminApplication,
  type AdminHealth,
  type AdminReports,
} from "../../../lib/yonetim-api";

const SAMPLE_KPI = { pending: 2, approved: 6, users: 18 };
const SAMPLE_WEEK = [5, 7, 6, 8, 9, 4, 2];
const SAMPLE_PENDING = [
  { name: "Örnek Klinik", meta: "Girne · Klinik · Başvuru" },
  { name: "Örnek Restoran", meta: "Mağusa · Restoran · Başvuru" },
];

function weekStart(day: Date) {
  const parts = utcToNicosiaParts(day);
  const asUtc = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
  const weekday = (asUtc.getUTCDay() + 6) % 7;
  return nicosiaWallTimeToUtc(parts.year, parts.month, parts.day - weekday, 0, 0);
}

function bucketWeek(dates: string[]) {
  const start = weekStart(new Date());
  const startMs = start.getTime();
  const endMs = startMs + 7 * 24 * 60 * 60 * 1000;
  const counts = [0, 0, 0, 0, 0, 0, 0];
  for (const raw of dates) {
    const at = new Date(raw).getTime();
    if (at < startMs || at >= endMs) continue;
    const parts = utcToNicosiaParts(new Date(raw));
    const asUtc = nicosiaWallTimeToUtc(parts.year, parts.month, parts.day, 12, 0);
    const idx = (asUtc.getUTCDay() + 6) % 7;
    counts[idx] = (counts[idx] ?? 0) + 1;
  }
  return counts;
}

function initial(name: string) {
  const ch = name.trim()[0];
  return ch ? ch.toLocaleUpperCase("tr-TR") : "İ";
}

export function GenelView() {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    const [rep, hel, apps] = await Promise.all([fetchReports(), fetchHealth(), fetchApplications()]);
    setReports(rep.reports);
    setHealth(hel.health);
    setApplications(apps.applications);
    setError(false);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void load().catch(() => {
      setError(true);
      setLoaded(true);
    });
  }, [load]);

  const weekCounts = useMemo(() => bucketWeek(applications.map((row) => row.createdAt)), [applications]);
  const hasWeek = weekCounts.some((n) => n > 0);
  const pendingApps = applications.filter(
    (row) => row.status === "pending" || row.status === "received" || row.status === "review",
  );

  if (!loaded) return null;
  if (error) return <EmptyState kind="hata" />;

  const pendingLive = (reports?.businessesPending ?? 0) > 0;
  const approvedLive = (reports?.businessesApproved ?? 0) > 0;
  const usersLive = (reports?.usersTotal ?? 0) > 0;
  const waitlistClosed = health ? !health.waitlistOpen : true;

  return (
    <>
      <div className="am-kpis">
        <article className="am-kpi">
          <p className="am-kicker">{yonetimApp.statPendingBiz}</p>
          <p className="am-kpi-val">{pendingLive ? reports?.businessesPending : SAMPLE_KPI.pending}</p>
          <p className="hint">{yonetimApp.statPendingHint}</p>
          {pendingLive ? null : <SampleBadge />}
        </article>
        <article className="am-kpi">
          <p className="am-kicker">{approvedLive ? yonetimApp.statApprovedBiz : yonetimApp.statLiveSample}</p>
          <p className="am-kpi-val">{approvedLive ? reports?.businessesApproved : SAMPLE_KPI.approved}</p>
          <p className="hint">{yonetimApp.statLiveSampleHint}</p>
          {approvedLive ? null : <SampleBadge />}
        </article>
        <article className="am-kpi">
          <p className="am-kicker">{yonetimApp.statUsers}</p>
          <p className="am-kpi-val">{usersLive ? reports?.usersTotal : SAMPLE_KPI.users}</p>
          <p className="hint">{yonetimApp.statUsersHint}</p>
          {usersLive ? null : <SampleBadge />}
        </article>
        <article className="am-kpi">
          <p className="am-kicker">{yonetimApp.statWaitlist}</p>
          <p className="am-kpi-val is-text">
            {waitlistClosed ? yonetimApp.waitlistClosed : yonetimApp.waitlistOpenLabel}
          </p>
          <p className="hint">{yonetimApp.statWaitlistHint}</p>
        </article>
      </div>
      <div className="am-grid-2">
        <section className="am-panel-card">
          <h2>
            {hasWeek ? yonetimApp.weekApps : yonetimApp.weekAppsSample} {hasWeek ? null : <SampleBadge />}
          </h2>
          <WeekChart values={hasWeek ? weekCounts : SAMPLE_WEEK} label={yonetimApp.weekAppsSample} />
          {hasWeek ? null : <p className="am-chart-caption">{yonetimApp.chartNote}</p>}
        </section>
        <section className="am-panel-card">
          <h2>
            {yonetimApp.pendingQueue} {pendingApps.length ? null : <SampleBadge />}
          </h2>
          {(pendingApps.length ? pendingApps.slice(0, 4) : SAMPLE_PENDING).map((row) => {
            const name = "businessName" in row ? row.businessName : row.name;
            const meta =
              "businessName" in row
                ? `${row.inTurkey ? "Türkiye" : (row.city ?? "—")} · ${row.sector} · ${yonetimApp.statusReceived}`
                : row.meta;
            const key = "id" in row ? row.id : name;
            return (
              <div key={key} className="am-entity">
                <div className="am-avatar">{initial(name)}</div>
                <div className="am-entity-body">
                  <h3>{name}</h3>
                  <p>{meta}</p>
                </div>
                <span className="am-badge am-badge--pending">{yonetimApp.statusAwaiting}</span>
              </div>
            );
          })}
          <Link className="am-sec-link" href="/app/yonetim/onaylar">
            {yonetimApp.goApprovals}
          </Link>
        </section>
      </div>
    </>
  );
}
