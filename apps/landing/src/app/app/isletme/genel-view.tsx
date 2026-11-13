"use client";

import Link from "next/link";
import { useCallback } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import { nicosiaDateKey } from "@ada-merkez/shared";
import { usePanelData } from "../../../components/panel/use-panel-data";
import {
  DataToolbar,
  PanelEmpty,
  PanelError,
  PanelIntro,
  PanelLoading,
  StatusBadge,
} from "../../../components/panel/PanelKit";
import { WeekChart } from "../../../components/panel/WeekChart";
import {
  IconCalendar,
  IconClock,
  IconServices,
  IconSettings,
} from "../../../components/panel/icons";
import {
  fetchAvailability,
  fetchBookings,
  fetchMe,
  fetchServices,
  fetchStaff,
  fetchStats,
  formatNicosiaDate,
  initials,
} from "../../../lib/isletme-api";
import { reportRange, nicosiaDayRange } from "../../../lib/panel-workflow";

export function GenelView() {
  const loader = useCallback(async () => {
    const range = reportRange("week");
    const start = nicosiaDayRange(range.from)!;
    const end = nicosiaDayRange(range.to)!;
    const [stats, bookings, services, staff, hours, me] = await Promise.all([
      fetchStats(),
      fetchBookings({ from: start.from, to: end.to }),
      fetchServices(),
      fetchStaff(),
      fetchAvailability(),
      fetchMe(),
    ]);
    return {
      stats: stats.stats,
      bookings: bookings.bookings,
      services: services.services,
      staff: staff.staff,
      hours: hours.rules,
      me: me.me,
      todayKey: nicosiaDateKey(new Date()),
    };
  }, []);
  const query = usePanelData(loader, "business-overview");
  if (query.loading) return <PanelLoading />;
  if (!query.data)
    return (
      <PanelError
        message={query.error ?? ""}
        retry={() => {
          void query.refresh();
        }}
      />
    );
  const { stats, bookings, services, staff, hours, me, todayKey } = query.data;
  const activeServices = services.filter((row) => row.active);
  const activeStaff = staff.filter((row) => row.active);
  const steps = [
    {
      label: panel.setupProfile,
      done: Boolean(me.business?.phone && me.business?.address),
      href: "/app/isletme/profil",
    },
    {
      label: panel.setupService,
      done: activeServices.length > 0,
      href: "/app/isletme/hizmetler",
    },
    {
      label: panel.setupStaff,
      done: activeStaff.length > 0,
      href: "/app/isletme/hizmetler",
    },
    {
      label: panel.setupHours,
      done: hours.length > 0,
      href: "/app/isletme/profil#calisma-saatleri",
    },
  ];
  const completed = steps.filter((step) => step.done).length;
  const today = bookings
    .filter(
      (row) =>
        nicosiaDateKey(new Date(row.startsAt)) === todayKey &&
        ["pending", "confirmed"].includes(row.status),
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const week = [0, 0, 0, 0, 0, 0, 0];
  const range = reportRange("week");
  for (const row of bookings) {
    if (!["pending", "confirmed"].includes(row.status)) continue;
    const key = nicosiaDateKey(new Date(row.startsAt));
    const day = Math.round(
      (Date.parse(`${key}T12:00:00Z`) - Date.parse(`${range.from}T12:00:00Z`)) /
        86_400_000,
    );
    if (day >= 0 && day < 7) week[day] = (week[day] ?? 0) + 1;
  }
  const kpis = [
    {
      label: isletmeApp.statTodayConfirmed,
      value: stats.todayConfirmed,
      hint: isletmeApp.today,
      href: "/app/isletme/takvim",
    },
    {
      label: isletmeApp.statTodayPending,
      value: stats.todayPending,
      hint: panel.today,
      href: "/app/isletme/talepler",
    },
    {
      label: isletmeApp.statWeekConfirmed,
      value: stats.weekConfirmed,
      hint: panel.thisWeek,
      href: "/app/isletme/takvim",
    },
    {
      label: isletmeApp.statPending,
      value: stats.pendingIncoming,
      hint: panel.viewAll,
      href: "/app/isletme/talepler",
    },
  ];
  return (
    <>
      <PanelIntro
        eyebrow={isletmeApp.loginTitle}
        title={me.business?.name ?? isletmeApp.loginTitle}
        action={
          <Link href="/app/isletme/talepler" className="am-btn am-btn--primary">
            {isletmeApp.navInboxLong}
          </Link>
        }
      >
        {panel.weekNote}
      </PanelIntro>
      <DataToolbar updated={query.updatedAt} refreshing={query.refreshing} />
      {query.error ? <PanelError compact message={query.error} /> : null}
      <div className="pn-kpis">
        {kpis.map((kpi, index) => (
          <article
            key={kpi.label}
            className={`pn-kpi${index === 0 ? " pn-kpi--accent" : ""}`}
          >
            <div className="pn-kpi-top">
              <span className="pn-kpi-label">{kpi.label}</span>
              <IconCalendar />
            </div>
            <strong>{kpi.value}</strong>
            <small>{kpi.hint}</small>
            <Link className="pn-kpi-link" href={kpi.href}>
              {panel.viewAll} →
            </Link>
          </article>
        ))}
      </div>
      <div className="pn-columns">
        <div className="pn-stack">
          <section className="pn-card">
            <div className="pn-card-head">
              <h3>{panel.todayAgenda}</h3>
              <Link href="/app/isletme/takvim">{panel.viewAll} →</Link>
            </div>
            {today.length ? (
              <div className="pn-agenda">
                {today.map((row) => (
                  <div className="pn-agenda-row" key={row.id}>
                    <time className="pn-agenda-time" dateTime={row.startsAt}>
                      {formatNicosiaDate(row.startsAt, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </time>
                    <div>
                      <h4>
                        {services.find(
                          (service) => service.id === row.serviceId,
                        )?.name ??
                          (row.kind === "table"
                            ? panel.tableReservation
                            : panel.appointment)}
                      </h4>
                      <p>
                        {initials(row.customerName)} ·{" "}
                        {row.channel === "whatsapp"
                          ? isletmeApp.sourceWa
                          : isletmeApp.sourceApp}
                      </p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                ))}
              </div>
            ) : (
              <PanelEmpty title={panel.noAgenda} body={panel.noAgendaBody} />
            )}
          </section>
          <section className="pn-card">
            <h3>{panel.weekRequests}</h3>
            <WeekChart values={week} label={panel.weekRequests} />
            <p className="pn-lead">
              {week.some((value) => value > 0)
                ? panel.weekNote
                : panel.noChartData}
            </p>
          </section>
        </div>
        <div className="pn-stack">
          <section className="pn-card">
            <h3>
              {completed === steps.length ? panel.setupDone : panel.setupTitle}
            </h3>
            <p className="pn-lead">{panel.setupLead}</p>
            <div
              className="pn-setup-progress"
              role="progressbar"
              aria-label={panel.setupTitle}
              aria-valuenow={completed}
              aria-valuemin={0}
              aria-valuemax={steps.length}
            >
              <span style={{ width: `${(completed / steps.length) * 100}%` }} />
            </div>
            <p className="pn-setup-count">
              {completed}/{steps.length} {panel.setupCount}
            </p>
            <div className="pn-checklist">
              {steps.map((step) => (
                <Link key={step.label} href={step.href}>
                  <span
                    className={`pn-check${step.done ? " is-done" : ""}`}
                    aria-hidden="true"
                  >
                    {step.done ? "✓" : "·"}
                  </span>
                  {step.label}
                  <small>{step.done ? panel.done : panel.complete}</small>
                </Link>
              ))}
            </div>
          </section>
          <section className="pn-card">
            <h3>{panel.quickActions}</h3>
            <div className="pn-quick-links">
              <Link href="/app/isletme/hizmetler">
                <IconServices />
                {isletmeApp.addService}
              </Link>
              <Link href="/app/isletme/profil#calisma-saatleri">
                <IconClock />
                {isletmeApp.addHours}
              </Link>
              <Link href="/app/isletme/bos-saatler">
                <IconCalendar />
                {isletmeApp.navHours}
              </Link>
              <Link href="/app/isletme/profil">
                <IconSettings />
                {isletmeApp.navSettings}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
