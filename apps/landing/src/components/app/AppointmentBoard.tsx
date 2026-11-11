"use client";

import { useState, type ReactNode } from "react";
import { app } from "@ada-merkez/copy";
import { Badge } from "@ada-merkez/ui";
import { utcToNicosiaParts } from "@ada-merkez/shared";
import { CancelBookingButton } from "./CancelBookingButton";

export type AppointmentRow = {
  id: string;
  status: string;
  startsAt: string;
  businessName: string;
  sample: boolean;
  city: string | null;
  serviceName: string | null;
};

const MONTHS = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function statusBadge(status: string) {
  if (status === "pending") return <Badge tone="pending">{app.statusPending}</Badge>;
  if (status === "confirmed") return <Badge tone="confirmed">{app.statusConfirmed}</Badge>;
  if (status === "cancelled" || status === "no_show") return <Badge tone="cancelled">{app.bookingCancelled}</Badge>;
  return <Badge tone="cancelled">{status}</Badge>;
}

function AppointmentCard({ row }: { row: AppointmentRow }) {
  const parts = utcToNicosiaParts(new Date(row.startsAt));
  const time = `${String(parts.hour).padStart(2, "0")}:${String(parts.minute).padStart(2, "0")}`;
  return (
    <article className={row.status === "pending" ? "am-appt am-appt--pending" : "am-appt"}>
      <div className="am-appt-date">
        <span className="d">{parts.day}</span>
        <span className="m">{MONTHS[parts.month - 1] ?? ""}</span>
      </div>
      <div>
        <div className="am-appt-top">
          <h3>{row.businessName}</h3>
        </div>
        <p>
          {[row.serviceName, time, row.city].filter(Boolean).join(" · ")}
        </p>
        <div className="am-appt-badges">
          {statusBadge(row.status)}
          {row.sample ? <Badge tone="sample">{app.example}</Badge> : null}
        </div>
        {row.status === "pending" || row.status === "confirmed" ? (
          <CancelBookingButton bookingId={row.id} />
        ) : null}
      </div>
    </article>
  );
}

export function AppointmentBoard({
  upcoming,
  past,
  empty,
}: {
  upcoming: AppointmentRow[];
  past: AppointmentRow[];
  empty: ReactNode;
}) {
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");
  const rows = tab === "upcoming" ? upcoming : past;
  return (
    <>
      <div className="am-seg" role="tablist" aria-label={app.bookingsTitle}>
        <button type="button" role="tab" className={tab === "upcoming" ? "is-on" : undefined} aria-selected={tab === "upcoming"} onClick={() => setTab("upcoming")}>
          {app.upcoming}
        </button>
        <button type="button" role="tab" className={tab === "past" ? "is-on" : undefined} aria-selected={tab === "past"} onClick={() => setTab("past")}>
          {app.past}
        </button>
      </div>
      {rows.length ? (
        <div className="am-stack mt-4">
          {rows.map((row) => (
            <AppointmentCard key={row.id} row={row} />
          ))}
        </div>
      ) : (
        empty
      )}
    </>
  );
}
