"use client";

import { useEffect, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { EmptyKabuki } from "../../../../components/isletme/EmptyKabuki";
import { fetchStats, type StatsRow } from "../../../../lib/isletme-api";

export function IstatistikView() {
  const [stats, setStats] = useState<StatsRow | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    void fetchStats()
      .then((data) => {
        setStats(data.stats);
        setLoaded(true);
      })
      .catch(() => {
        setError(true);
        setLoaded(true);
      });
  }, []);

  if (!loaded) return <div className="isletme-head" />;
  if (error) return <EmptyKabuki kind="hata" />;

  const empty =
    !stats ||
    (stats.todayConfirmed === 0 &&
      stats.todayPending === 0 &&
      stats.weekConfirmed === 0 &&
      stats.pendingIncoming === 0);

  return (
    <div>
      <div className="isletme-head">
        <h1>{isletmeApp.statsTitle}</h1>
        <p className="t-sm t-muted">{isletmeApp.statsLead}</p>
      </div>
      {empty || !stats ? (
        <EmptyKabuki
          kind="sonuc-yok"
          title={isletmeApp.statsEmptyTitle}
          body={isletmeApp.statsEmptyBody}
        />
      ) : (
        <div className="isletme-stats">
          <article className="isletme-stat">
            <span className="t-xs t-muted">{isletmeApp.statTodayConfirmed}</span>
            <strong>{stats.todayConfirmed}</strong>
          </article>
          <article className="isletme-stat">
            <span className="t-xs t-muted">{isletmeApp.statTodayPending}</span>
            <strong>{stats.todayPending}</strong>
          </article>
          <article className="isletme-stat">
            <span className="t-xs t-muted">{isletmeApp.statWeekConfirmed}</span>
            <strong>{stats.weekConfirmed}</strong>
          </article>
          <article className="isletme-stat">
            <span className="t-xs t-muted">{isletmeApp.statPending}</span>
            <strong>{stats.pendingIncoming}</strong>
          </article>
        </div>
      )}
    </div>
  );
}
