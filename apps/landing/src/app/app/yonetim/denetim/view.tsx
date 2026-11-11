"use client";

import { useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { formatWhen } from "../../../../lib/nicosia-format";
import { fetchAudit, type AuditRow } from "../../../../lib/yonetim-api";

export function DenetimView() {
  const [rows, setRows] = useState<AuditRow[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAudit()
      .then((data) => setRows(data.audit))
      .catch(() => {
        setError(true);
        setRows([]);
      });
  }, []);

  if (error) return <EmptyState kind="hata" />;
  if (!rows) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.auditTitle}</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.auditTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.auditLead}</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState kind="sonuc-yok" title={yonetimApp.emptyAuditTitle} body={yonetimApp.emptyAuditBody} />
      ) : (
        <div className="yonetim-list">
          {rows.map((row) => (
            <article key={row.id} className="yonetim-card">
              <p className="t-sm" style={{ fontWeight: 600 }}>
                {row.action}
              </p>
              <p className="t-xs t-muted">
                {row.entityKind}
                {row.actorName || row.actorPhone ? ` · ${row.actorName ?? row.actorPhone}` : ""}
              </p>
              <p className="t-xs t-subtle">{formatWhen(row.createdAt)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
