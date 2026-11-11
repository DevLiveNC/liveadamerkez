"use client";

import { useCallback, useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../components/app/EmptyState";
import {
  fetchApplications,
  fetchBusinesses,
  patchApplication,
  patchBusiness,
  type AdminApplication,
  type AdminBusiness,
} from "../../../lib/yonetim-api";

type Filter = "pending" | "approved" | "rejected" | "all";

function statusLabel(status: string) {
  if (status === "pending" || status === "received") return yonetimApp.statusPending;
  if (status === "approved") return yonetimApp.statusApproved;
  if (status === "rejected") return yonetimApp.statusRejected;
  if (status === "review") return yonetimApp.statusReview;
  return status;
}

function badgeClass(status: string) {
  if (status === "approved") return "ok";
  if (status === "rejected") return "off";
  return "wait";
}

function isPending(status: string) {
  return status === "pending" || status === "received" || status === "review";
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

  if (error) {
    return <EmptyState kind="hata" />;
  }
  if (!businesses || !applications) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.approvalsTitle}</h1>
      </div>
    );
  }

  const rows = [
    ...businesses.map((row) => ({
      key: `b-${row.id}`,
      name: row.name,
      category: row.categoryName ?? row.sector ?? "—",
      place: row.inTurkey ? "Türkiye" : (row.cityName ?? "—"),
      status: row.status,
      onApprove: () => patchBusiness(row.id, "approved").then(load),
      onReject: () => patchBusiness(row.id, "rejected").then(load),
    })),
    ...applications.map((row) => ({
      key: `a-${row.id}`,
      name: row.businessName,
      category: row.sector,
      place: row.inTurkey ? "Türkiye" : (row.city ?? "—"),
      status: row.status,
      onApprove: () => patchApplication(row.id, "approved").then(load),
      onReject: () => patchApplication(row.id, "rejected").then(load),
    })),
  ];

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.approvalsTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.approvalsLead}</p>
      </div>
      <div className="yonetim-filters">
        {(
          [
            ["pending", yonetimApp.filterPending],
            ["approved", yonetimApp.filterApproved],
            ["rejected", yonetimApp.filterRejected],
            ["all", yonetimApp.filterAll],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={`chip ${filter === id ? "chip-navy" : "chip-outline"}`}
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
        <div className="yonetim-list">
          {rows.map((row) => (
            <article key={row.key} className="yonetim-card">
              <p className="t-sm" style={{ fontWeight: 600 }}>
                {row.name}
              </p>
              <p className="t-xs t-muted">
                {row.category} · {row.place}
              </p>
              <p style={{ margin: "8px 0" }}>
                <span className={`yonetim-badge ${badgeClass(row.status)}`}>{statusLabel(row.status)}</span>
              </p>
              {isPending(row.status) ? (
                <div className="yonetim-actions">
                  <button className="btn btn-navy btn-sm" type="button" onClick={() => void row.onApprove()}>
                    {yonetimApp.approve}
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => void row.onReject()}>
                    {yonetimApp.reject}
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
