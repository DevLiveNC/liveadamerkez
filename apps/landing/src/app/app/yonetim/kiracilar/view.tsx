"use client";

import { useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { fetchBusinesses, type AdminBusiness } from "../../../../lib/yonetim-api";

function statusLabel(status: string) {
  if (status === "pending") return yonetimApp.statusPending;
  if (status === "approved") return yonetimApp.statusApproved;
  if (status === "rejected") return yonetimApp.statusRejected;
  return status;
}

export function KiracilarView() {
  const [rows, setRows] = useState<AdminBusiness[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchBusinesses()
      .then((data) => setRows(data.businesses))
      .catch(() => {
        setError(true);
        setRows([]);
      });
  }, []);

  if (error) return <EmptyState kind="hata" />;
  if (!rows) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.tenantsTitle}</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.tenantsTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.tenantsLead}</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState kind="sonuc-yok" title={yonetimApp.emptyTenantsTitle} body={yonetimApp.emptyTenantsBody} />
      ) : (
        <div className="yonetim-list">
          {rows.map((row) => (
            <article key={row.id} className="yonetim-card">
              <p className="t-sm" style={{ fontWeight: 600 }}>
                {row.name}
              </p>
              <p className="t-xs t-muted">
                {row.inTurkey ? "Türkiye" : (row.cityName ?? "—")} · {row.categoryName ?? row.sector ?? "—"}
              </p>
              <p className="t-xs" style={{ marginTop: 8 }}>
                {statusLabel(row.status)}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
