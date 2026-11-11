"use client";

import { useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { fetchUsers, type AdminUser } from "../../../../lib/yonetim-api";

export function KullanicilarView() {
  const [rows, setRows] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchUsers()
      .then((data) => setRows(data.users))
      .catch(() => {
        setError(true);
        setRows([]);
      });
  }, []);

  if (error) return <EmptyState kind="hata" />;
  if (!rows) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.usersTitle}</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.usersTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.usersLead}</p>
      </div>
      {rows.length === 0 ? (
        <EmptyState kind="sonuc-yok" title={yonetimApp.emptyUsersTitle} body={yonetimApp.emptyUsersBody} />
      ) : (
        <div className="yonetim-list">
          {rows.map((row) => (
            <article key={row.id} className="yonetim-card">
              <p className="t-sm" style={{ fontWeight: 600 }}>
                {row.displayName || row.phone}
              </p>
              <p className="t-xs t-muted">{row.phone}</p>
              <p className="t-xs" style={{ marginTop: 6 }}>
                {row.role}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
