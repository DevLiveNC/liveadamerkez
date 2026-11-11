"use client";

import { useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { fetchReports, type AdminReports } from "../../../../lib/yonetim-api";

export function RaporlarView() {
  const [reports, setReports] = useState<AdminReports | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchReports()
      .then((data) => setReports(data.reports))
      .catch(() => setError(true));
  }, []);

  if (error) return <EmptyState kind="hata" />;
  if (!reports) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.reportsTitle}</h1>
      </div>
    );
  }

  const empty =
    reports.businessesPending +
      reports.businessesApproved +
      reports.usersTotal +
      reports.bookingsToday +
      reports.applicationsTotal ===
    0;

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.reportsTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.reportsLead}</p>
      </div>
      {empty ? (
        <EmptyState kind="sonuc-yok" title={yonetimApp.emptyReportsTitle} body={yonetimApp.emptyReportsBody} />
      ) : (
        <div className="yonetim-stats">
          <article className="yonetim-stat">
            <p className="t-xs t-muted">{yonetimApp.statPendingBiz}</p>
            <strong>{reports.businessesPending}</strong>
          </article>
          <article className="yonetim-stat">
            <p className="t-xs t-muted">{yonetimApp.statApprovedBiz}</p>
            <strong>{reports.businessesApproved}</strong>
          </article>
          <article className="yonetim-stat">
            <p className="t-xs t-muted">{yonetimApp.statUsers}</p>
            <strong>{reports.usersTotal}</strong>
          </article>
          <article className="yonetim-stat">
            <p className="t-xs t-muted">{yonetimApp.statTodayBookings}</p>
            <strong>{reports.bookingsToday}</strong>
          </article>
          <article className="yonetim-stat">
            <p className="t-xs t-muted">{yonetimApp.statApplications}</p>
            <strong>{reports.applicationsTotal}</strong>
          </article>
        </div>
      )}
    </div>
  );
}
