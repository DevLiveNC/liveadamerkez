"use client";

import { useCallback, useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import {
  fetchApplications,
  fetchBusinesses,
  patchApplication,
  patchBusiness,
  type AdminApplication,
  type AdminBusiness,
} from "../../../../lib/yonetim-api";

type Filter = "pending" | "approved" | "rejected" | "all";

function statusLabel(status: string) {
  if (status === "pending" || status === "received") return yonetimApp.statusAwaiting;
  if (status === "approved") return yonetimApp.statusApproved;
  if (status === "rejected") return yonetimApp.statusRejected;
  if (status === "review") return yonetimApp.statusReview;
  return status;
}

function badgeClass(status: string) {
  if (status === "approved") return "am-badge am-badge--confirmed";
  if (status === "rejected") return "am-badge am-badge--cancelled";
  return "am-badge am-badge--pending";
}

function isPending(status: string) {
  return status === "pending" || status === "received" || status === "review";
}

function shortDate(iso: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Nicosia",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function OnaylarView() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [businesses, setBusinesses] = useState<AdminBusiness[] | null>(null);
  const [applications, setApplications] = useState<AdminApplication[] | null>(null);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const status = filter === "all" ? undefined : filter;
      const appStatus = filter === "pending" ? "received" : filter === "all" ? undefined : filter;
      const [biz, apps] = await Promise.all([
        fetchBusinesses(status),
        fetchApplications(appStatus),
      ]);
      setBusinesses(biz.businesses);
      setApplications(apps.applications);
    } catch {
      setError(true);
      setBusinesses([]);
      setApplications([]);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <EmptyState kind="hata" />;
  if (!businesses || !applications) return null;

  const rows = [
    ...businesses.map((row) => ({
      key: `b-${row.id}`,
      name: row.name,
      category: row.categoryName ?? row.sector ?? "—",
      place: row.inTurkey ? "Türkiye" : (row.cityName ?? "—"),
      status: row.status,
      date: shortDate(row.createdAt),
      onApprove: () => patchBusiness(row.id, "approved").then(load),
      onReject: () => patchBusiness(row.id, "rejected").then(load),
    })),
    ...applications.map((row) => ({
      key: `a-${row.id}`,
      name: row.businessName,
      category: row.sector,
      place: row.inTurkey ? "Türkiye" : (row.city ?? "—"),
      status: row.status,
      date: shortDate(row.createdAt),
      onApprove: () => patchApplication(row.id, "approved").then(load),
      onReject: () => patchApplication(row.id, "rejected").then(load),
    })),
  ];

  return (
    <>
      <div className="am-toolbar">
        {(
          [
            ["all", yonetimApp.filterAll],
            ["pending", yonetimApp.statusAwaiting],
            ["approved", yonetimApp.filterApproved],
            ["rejected", yonetimApp.filterRejected],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`am-chip${filter === id ? " am-chip--on" : ""}`}
            onClick={() => setFilter(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          kind="onay-bekliyor"
          title={yonetimApp.emptyApprovalsTitle}
          body={yonetimApp.emptyApprovalsBody}
        />
      ) : (
        <section className="am-panel-card">
          <h2>
            {yonetimApp.approvalsTitle}
          </h2>
          <div className="am-table-wrap">
            <table className="am-table">
              <thead>
                <tr>
                  <th>{yonetimApp.colBusiness}</th>
                  <th>{yonetimApp.colCity}</th>
                  <th>{yonetimApp.colCategory}</th>
                  <th>{yonetimApp.colDate}</th>
                  <th>{yonetimApp.colStatus}</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key}>
                    <td data-th={yonetimApp.colBusiness}>{row.name}</td>
                    <td data-th={yonetimApp.colCity}>{row.place}</td>
                    <td data-th={yonetimApp.colCategory}>{row.category}</td>
                    <td data-th={yonetimApp.colDate}>{row.date}</td>
                    <td data-th={yonetimApp.colStatus}>
                      <span className={badgeClass(row.status)}>{statusLabel(row.status)}</span>
                    </td>
                    <td data-th="">
                      {isPending(row.status) ? (
                        <>
                          <button
                            className="am-btn am-btn--primary am-btn--sm"
                            type="button"
                            onClick={() => void row.onApprove()}
                          >
                            {yonetimApp.approve}
                          </button>{" "}
                          <button
                            className="am-btn am-btn--ghost am-btn--sm"
                            type="button"
                            onClick={() => void row.onReject()}
                          >
                            {yonetimApp.reject}
                          </button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
