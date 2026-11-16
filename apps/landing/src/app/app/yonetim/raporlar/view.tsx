"use client";

import { useCallback, useState } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import {
  DataToolbar,
  PanelError,
  PanelFeedback,
  PanelIntro,
  PanelLoading,
} from "../../../../components/panel/PanelKit";
import {
  useOnline,
  usePanelData,
} from "../../../../components/panel/use-panel-data";
import { fetchReports } from "../../../../lib/yonetim-api";
import {
  dailyReportCsv,
  downloadCsv,
  reportRange,
  validReportRange,
} from "../../../../lib/panel-workflow";

export function RaporlarView() {
  const initial = reportRange("week");
  const [from, setFrom] = useState(initial.from);
  const [to, setTo] = useState(initial.to);
  const [range, setRange] = useState(initial);
  const [rangeError, setRangeError] = useState<string | null>(null);
  const online = useOnline();
  const loader = useCallback(() => fetchReports(range), [range]);
  const query = usePanelData(loader, `${range.from}:${range.to}`);
  const summary = query.data?.summary;
  function apply() {
    if (!validReportRange(from, to)) {
      setRangeError(panel.invalidRange);
      return;
    }
    setRangeError(null);
    setRange({ from, to });
  }
  function preset(value: "week" | "week7" | "month") {
    const next = reportRange(value);
    setFrom(next.from);
    setTo(next.to);
    setRange(next);
    setRangeError(null);
  }
  function exportCsv() {
    if (!summary) return;
    const rows: (string | number)[][] = [
      [
        panel.csvDay,
        panel.csvTotal,
        panel.csvConfirmed,
        panel.csvPending,
        panel.csvCancelled,
        panel.csvNoShow,
        panel.csvApp,
        panel.csvWhatsapp,
      ],
      ...summary.days.map((row) => [
        row.day,
        row.total,
        row.confirmed,
        row.pending,
        row.cancelled,
        row.noShow,
        row.app,
        row.whatsapp,
      ]),
    ];
    downloadCsv(
      `ada-merkez-rapor-${summary.from}-${summary.to}.csv`,
      dailyReportCsv(rows),
    );
  }
  const max = Math.max(
    1,
    ...(summary?.days ?? []).map((day) => day.confirmed + day.pending),
  );
  return (
    <>
      <PanelIntro
        eyebrow={yonetimApp.panelName}
        title={yonetimApp.reportsTitle}
        action={
          <button
            type="button"
            className="am-btn am-btn--ghost"
            disabled={!summary || !online}
            onClick={exportCsv}
          >
            {panel.exportCsv}
          </button>
        }
      >
        {panel.reportNote}
      </PanelIntro>
      <div className="pn-chips" role="group" aria-label={panel.reportRange}>
        <button
          type="button"
          className="am-chip"
          onClick={() => preset("week")}
        >
          {panel.thisWeek}
        </button>
        <button
          type="button"
          className="am-chip"
          onClick={() => preset("week7")}
        >
          {panel.last7}
        </button>
        <button
          type="button"
          className="am-chip"
          onClick={() => preset("month")}
        >
          {panel.thisMonth}
        </button>
      </div>
      <form
        className="pn-range"
        onSubmit={(event) => {
          event.preventDefault();
          apply();
        }}
      >
        <div className="pn-field">
          <label htmlFor="report-from">{panel.from}</label>
          <input
            id="report-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            required
          />
        </div>
        <div className="pn-field">
          <label htmlFor="report-to">{panel.to}</label>
          <input
            id="report-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="am-btn am-btn--primary"
          disabled={!online || query.refreshing}
        >
          {panel.applyRange}
        </button>
      </form>
      <PanelFeedback error={rangeError} />
      {query.loading ? (
        <PanelLoading />
      ) : !summary ? (
        <PanelError
          message={query.error ?? ""}
          retry={() => {
            void query.refresh();
          }}
        />
      ) : (
        <>
          <DataToolbar updated={query.updatedAt} refreshing={query.refreshing}>
            <span>
              {summary.from} — {summary.to} · Europe/Nicosia
            </span>
          </DataToolbar>
          {query.error ? <PanelError compact message={query.error} /> : null}
          <div className="pn-kpis">
            {[
              {
                label: panel.totalBookings,
                value: summary.total,
                hint: `${panel.activeAppointments}: ${summary.active}`,
              },
              {
                label: yonetimApp.statAppRequests,
                value: summary.app,
                hint: yonetimApp.statAppHint,
              },
              {
                label: yonetimApp.statWaRequests,
                value: summary.whatsapp,
                hint: yonetimApp.statWaHint,
              },
              {
                label: panel.cancelledStatus,
                value: summary.days.reduce(
                  (sum, day) => sum + day.cancelled,
                  0,
                ),
                hint: panel.reportRange,
              },
            ].map((kpi, index) => (
              <article
                className={`pn-kpi${index === 0 ? " pn-kpi--accent" : ""}`}
                key={kpi.label}
              >
                <span className="pn-kpi-label">{kpi.label}</span>
                <strong>{kpi.value}</strong>
                <small>{kpi.hint}</small>
              </article>
            ))}
          </div>
          <section className="pn-card">
            <h3>{panel.dailySummary}</h3>
            <p className="pn-lead">{panel.weekNote}</p>
            <svg
              className="pn-chart"
              viewBox={`0 0 ${Math.max(420, summary.days.length * 30)} 210`}
              role="img"
              aria-label={`${panel.dailySummary}: ${summary.active} ${panel.activeAppointments}`}
            >
              <line
                x1="0"
                y1="175"
                x2={Math.max(420, summary.days.length * 30)}
                y2="175"
                stroke="#e4dbce"
              />
              {summary.days.map((day, index) => {
                const width =
                  Math.max(420, summary.days.length * 30) / summary.days.length;
                const active = day.confirmed + day.pending;
                const h = (active / max) * 130;
                const confirmedH = (day.confirmed / max) * 130;
                const x = index * width + width * 0.2;
                return (
                  <g key={day.day}>
                    <title>
                      {day.day}: {active} {panel.activeAppointments},{" "}
                      {day.total} {panel.total}
                    </title>
                    <rect
                      x={x}
                      y={175 - h}
                      width={width * 0.6}
                      height={Math.max(2, h)}
                      rx="4"
                      fill="#e5b777"
                    />
                    <rect
                      x={x}
                      y={175 - confirmedH}
                      width={width * 0.6}
                      height={confirmedH}
                      rx="3"
                      fill="#0e7c78"
                    />
                    <text
                      x={x + width * 0.3}
                      y={165 - h}
                      textAnchor="middle"
                      fontSize="11"
                      fill="#0f2c44"
                    >
                      {active}
                    </text>
                    <text
                      x={x + width * 0.3}
                      y="197"
                      textAnchor="middle"
                      fontSize="10"
                      fill="#6e5e4e"
                    >
                      {day.day.slice(5)}
                    </text>
                  </g>
                );
              })}
            </svg>
            <details className="pn-audit-detail">
              <summary>{panel.details}</summary>
              <div className="am-table-wrap">
                <table className="am-table">
                  <thead>
                    <tr>
                      <th>{panel.date}</th>
                      <th>{panel.confirmed}</th>
                      <th>{panel.pending}</th>
                      <th>{panel.cancelledStatus}</th>
                      <th>{panel.noShow}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary.days.map((day) => (
                      <tr key={day.day}>
                        <td data-th={panel.date}>{day.day}</td>
                        <td data-th={panel.confirmed}>{day.confirmed}</td>
                        <td data-th={panel.pending}>{day.pending}</td>
                        <td data-th={panel.cancelledStatus}>{day.cancelled}</td>
                        <td data-th={panel.noShow}>{day.noShow}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </section>
        </>
      )}
    </>
  );
}
