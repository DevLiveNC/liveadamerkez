"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import {
  nicosiaDateKey,
  nicosiaWallTimeToUtc,
  utcToNicosiaParts,
} from "@ada-merkez/shared";
import { BottomSheet } from "@ada-merkez/ui";
import {
  DataToolbar,
  PanelEmpty,
  PanelError,
  PanelIntro,
  PanelLoading,
  StatusBadge,
} from "../../../../components/panel/PanelKit";
import { usePanelData } from "../../../../components/panel/use-panel-data";
import {
  fetchBookings,
  fetchServices,
  fetchStaff,
  formatNicosiaDate,
  type BookingRow,
} from "../../../../lib/isletme-api";
import { nicosiaDayRange } from "../../../../lib/panel-workflow";

const WEEK = [
  panel.weekdaysShort.monday,
  panel.weekdaysShort.tuesday,
  panel.weekdaysShort.wednesday,
  panel.weekdaysShort.thursday,
  panel.weekdaysShort.friday,
  panel.weekdaysShort.saturday,
  panel.weekdaysShort.sunday,
];
function shift(key: string, days: number) {
  const parts = utcToNicosiaParts(new Date(nicosiaDayRange(key)!.from));
  return nicosiaDateKey(
    nicosiaWallTimeToUtc(parts.year, parts.month, parts.day + days, 12, 0),
  );
}
function clock(iso: string) {
  return formatNicosiaDate(iso, { hour: "2-digit", minute: "2-digit" });
}

export function TakvimView() {
  const [day, setDay] = useState(() => nicosiaDateKey(new Date()));
  const [staffId, setStaffId] = useState("");
  const [detail, setDetail] = useState<BookingRow | null>(null);
  const loader = useCallback(async () => {
    const range = nicosiaDayRange(day)!;
    const [bookings, services, staff] = await Promise.all([
      fetchBookings(range),
      fetchServices(),
      fetchStaff(),
    ]);
    return {
      bookings: bookings.bookings,
      services: services.services,
      staff: staff.staff,
    };
  }, [day]);
  const query = usePanelData(loader, `business-calendar:${day}`);
  const today = nicosiaDateKey(new Date());
  const monday = shift(
    day,
    -((new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7),
  );
  const rows = (query.data?.bookings ?? [])
    .filter((row) => !staffId || row.staffId === staffId)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const serviceName = (row: BookingRow) =>
    query.data?.services.find((service) => service.id === row.serviceId)
      ?.name ??
    (row.kind === "table" ? panel.tableReservation : panel.appointment);
  const staffName = (id: string | null) =>
    query.data?.staff.find((row) => row.id === id)?.name ?? panel.allStaff;
  return (
    <>
      <PanelIntro
        eyebrow={isletmeApp.loginTitle}
        title={isletmeApp.navCalendar}
        action={
          <Link
            href="/app/isletme/bos-saatler"
            className="am-btn am-btn--ghost"
          >
            {isletmeApp.navHours}
          </Link>
        }
      >
        {panel.calendarLead}
      </PanelIntro>
      <div className="pn-calendar-controls">
        <div className="pn-chips">
          <button
            type="button"
            className="am-btn am-btn--ghost"
            aria-label={isletmeApp.prevDay}
            onClick={() => setDay(shift(day, -1))}
          >
            ←
          </button>
          <button
            type="button"
            className="am-btn am-btn--ghost"
            aria-pressed={day === today}
            onClick={() => setDay(today)}
          >
            {panel.today}
          </button>
          <button
            type="button"
            className="am-btn am-btn--ghost"
            aria-label={isletmeApp.nextDay}
            onClick={() => setDay(shift(day, 1))}
          >
            →
          </button>
        </div>
        <div className="pn-field">
          <label htmlFor="calendar-day">{panel.date}</label>
          <input
            id="calendar-day"
            type="date"
            value={day}
            onChange={(event) => {
              if (nicosiaDayRange(event.target.value))
                setDay(event.target.value);
            }}
            required
          />
        </div>
        <div className="pn-field">
          <label htmlFor="calendar-staff">{isletmeApp.staffTitle}</label>
          <select
            id="calendar-staff"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
          >
            <option value="">{panel.allStaff}</option>
            {query.data?.staff.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div
        className="pn-week-strip"
        role="group"
        aria-label={panel.reportRange}
      >
        {WEEK.map((label, index) => {
          const key = shift(monday, index);
          return (
            <button
              type="button"
              key={key}
              className={key === day ? "is-on" : ""}
              aria-pressed={key === day}
              aria-label={formatNicosiaDate(nicosiaDayRange(key)!.from, {
                dateStyle: "full",
              })}
              onClick={() => setDay(key)}
            >
              <span>{label}</span>
              <strong>{Number(key.slice(8))}</strong>
              {key === today ? <i aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>
      {query.loading ? (
        <PanelLoading />
      ) : !query.data ? (
        <PanelError
          message={query.error ?? ""}
          retry={() => {
            void query.refresh();
          }}
        />
      ) : (
        <section className="pn-card">
          <div className="pn-card-head">
            <h3>
              {formatNicosiaDate(nicosiaDayRange(day)!.from, {
                day: "numeric",
                month: "long",
                weekday: "long",
              })}
            </h3>
            <span className="pn-setup-count">
              {rows.length} {panel.records}
            </span>
          </div>
          <DataToolbar
            updated={query.updatedAt}
            refreshing={query.refreshing}
          />
          {query.error ? <PanelError compact message={query.error} /> : null}
          {!rows.length ? (
            <PanelEmpty
              title={panel.calendarEmpty}
              body={panel.calendarEmptyBody}
              href="/app/isletme/talepler"
              action={panel.openInbox}
            />
          ) : (
            <div className="pn-calendar-agenda">
              {rows.map((row) => (
                <button
                  type="button"
                  className="pn-calendar-item"
                  key={row.id}
                  onClick={() => setDetail(row)}
                >
                  <span className="pn-agenda-time">
                    {clock(row.startsAt)}
                    <small>{clock(row.endsAt)}</small>
                  </span>
                  <span className="pn-entity-body">
                    <strong>{row.customerName ?? panel.customer}</strong>
                    <span>
                      {serviceName(row)} · {staffName(row.staffId)}
                    </span>
                  </span>
                  <StatusBadge status={row.status} />
                </button>
              ))}
            </div>
          )}
        </section>
      )}
      <BottomSheet
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={panel.bookingDetails}
        closeLabel={panel.close}
        className="pn-confirm-sheet"
      >
        {detail ? (
          <>
            <dl className="pn-record-details">
              <div>
                <dt>{panel.customer}</dt>
                <dd>{detail.customerName ?? "—"}</dd>
              </div>
              <div>
                <dt>{panel.status}</dt>
                <dd>
                  <StatusBadge status={detail.status} />
                </dd>
              </div>
              <div>
                <dt>{panel.service}</dt>
                <dd>{serviceName(detail)}</dd>
              </div>
              <div>
                <dt>{isletmeApp.staffTitle}</dt>
                <dd>{staffName(detail.staffId)}</dd>
              </div>
              <div>
                <dt>{panel.from}</dt>
                <dd>{clock(detail.startsAt)}</dd>
              </div>
              <div>
                <dt>{panel.to}</dt>
                <dd>{clock(detail.endsAt)}</dd>
              </div>
            </dl>
            <p className="pn-lead">{detail.notes || panel.noNotes}</p>
            <Link
              className="am-btn am-btn--primary am-btn--block"
              href="/app/isletme/talepler"
              onClick={() => setDetail(null)}
            >
              {panel.openInbox}
            </Link>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}
