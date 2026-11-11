"use client";

import { useCallback, useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { formatWhen } from "../../../../lib/nicosia-format";
import { fetchBookings, patchBooking, type AdminBooking } from "../../../../lib/yonetim-api";

export function RezervasyonlarView() {
  const [rows, setRows] = useState<AdminBooking[] | null>(null);
  const [truncated, setTruncated] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await fetchBookings();
      setRows(data.bookings);
      setTruncated(Boolean(data.truncated));
      setError(false);
    } catch {
      setError(true);
      setRows([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (error) return <EmptyState kind="hata" />;
  if (!rows) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.bookingsTitle}</h1>
      </div>
    );
  }

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.bookingsTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.bookingsLead}</p>
        {truncated ? <p className="t-sm t-muted">{yonetimApp.listTruncated}</p> : null}
      </div>
      {rows.length === 0 ? (
        <EmptyState
          kind="rezervasyon-yok"
          title={yonetimApp.emptyBookingsTitle}
          body={yonetimApp.emptyBookingsBody}
        />
      ) : (
        <div className="yonetim-list">
          {rows.map((row) => (
            <article key={row.id} className="yonetim-card">
              <p className="t-sm" style={{ fontWeight: 600 }}>
                {row.businessName}
              </p>
              <p className="t-xs t-muted">
                {formatWhen(row.startsAt)} ·{" "}
                {row.channel === "whatsapp" ? yonetimApp.channelWhatsapp : yonetimApp.channelApp}
              </p>
              <p className="t-xs">{row.customerName || row.status}</p>
              {row.status === "pending" ? (
                <div className="yonetim-actions" style={{ marginTop: 8 }}>
                  <button
                    className="btn btn-navy btn-sm"
                    type="button"
                    onClick={() => void patchBooking(row.id, "confirmed").then(load)}
                  >
                    {yonetimApp.approve}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => void patchBooking(row.id, "cancelled").then(load)}
                  >
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
