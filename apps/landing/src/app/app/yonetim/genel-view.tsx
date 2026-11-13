"use client";

import Link from "next/link";
import { useCallback } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import {
  DataToolbar,
  PanelEmpty,
  PanelError,
  PanelIntro,
  PanelLoading,
  StatusBadge,
} from "../../../components/panel/PanelKit";
import { usePanelData } from "../../../components/panel/use-panel-data";
import {
  IconApprove,
  IconCalendar,
  IconServices,
  IconUsers,
} from "../../../components/panel/icons";
import {
  fetchApplications,
  fetchBusinesses,
  fetchHealth,
  fetchReports,
} from "../../../lib/yonetim-api";
import { isApprovalPending } from "../../../lib/panel-workflow";
import { formatWhen } from "../../../lib/nicosia-format";

export function GenelView() {
  const loader = useCallback(async () => {
    const [reports, health, businesses, applications] = await Promise.all([
      fetchReports(),
      fetchHealth(),
      fetchBusinesses(),
      fetchApplications(),
    ]);
    const queue = [
      ...businesses.businesses
        .filter((row) => isApprovalPending(row.status))
        .map((row) => ({
          id: `b-${row.id}`,
          name: row.name,
          meta: `${row.inTurkey ? panel.turkey : (row.cityName ?? "—")} · ${row.categoryName ?? row.sector ?? "—"}`,
          source: panel.businessRecord,
          createdAt: row.createdAt,
          status: row.status,
        })),
      ...applications.applications
        .filter((row) => isApprovalPending(row.status))
        .map((row) => ({
          id: `a-${row.id}`,
          name: row.businessName,
          meta: `${row.inTurkey ? panel.turkey : (row.city ?? "—")} · ${row.sector}`,
          source: panel.applicationRecord,
          createdAt: row.createdAt,
          status: row.status,
        })),
    ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return { reports: reports.reports, health: health.health, queue };
  }, []);
  const query = usePanelData(loader, "admin-overview");
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
  const { reports, health, queue } = query.data;
  const kpis = [
    {
      label: yonetimApp.statPendingBiz,
      value: queue.length,
      hint: yonetimApp.statPendingHint,
      href: "/app/yonetim/onaylar",
      icon: <IconApprove />,
    },
    {
      label: yonetimApp.statApprovedBiz,
      value: reports.businessesApproved,
      hint: yonetimApp.navTenants,
      href: "/app/yonetim/kiracilar",
      icon: <IconServices />,
    },
    {
      label: yonetimApp.statUsers,
      value: reports.usersTotal,
      hint: yonetimApp.statUsersHint,
      href: "/app/yonetim/kullanicilar",
      icon: <IconUsers />,
    },
    {
      label: yonetimApp.statTodayBookings,
      value: reports.bookingsToday,
      hint: panel.today,
      href: "/app/yonetim/rezervasyonlar",
      icon: <IconCalendar />,
    },
  ];
  return (
    <>
      <PanelIntro
        eyebrow={yonetimApp.panelName}
        title={panel.operationTitle}
        action={
          <Link className="am-btn am-btn--primary" href="/app/yonetim/onaylar">
            {yonetimApp.goApprovals}
          </Link>
        }
      >
        {panel.operationLead}
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
              {kpi.icon}
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
        <section className="pn-card">
          <div className="pn-card-head">
            <h3>{panel.pendingQueue}</h3>
            <Link href="/app/yonetim/onaylar">{panel.viewAll} →</Link>
          </div>
          <p className="pn-lead">{panel.oldestFirst}</p>
          {!queue.length ? (
            <PanelEmpty title={panel.queueEmpty} body={panel.queueEmptyBody} />
          ) : (
            <div className="pn-agenda">
              {queue.slice(0, 6).map((row) => (
                <Link
                  href="/app/yonetim/onaylar"
                  className="pn-entity"
                  key={row.id}
                >
                  <div className="pn-entity-body">
                    <h4>{row.name}</h4>
                    <p>
                      {row.meta} · {row.source}
                    </p>
                    <p>{formatWhen(row.createdAt)}</p>
                  </div>
                  <StatusBadge status={row.status} />
                </Link>
              ))}
            </div>
          )}
        </section>
        <div className="pn-stack">
          <section className="pn-card">
            <h3>{yonetimApp.healthTitle}</h3>
            <div className="pn-health-row">
              <div>
                <h3>
                  {yonetimApp.healthApi} / {yonetimApp.healthDb}
                </h3>
                <p>{yonetimApp.healthDbBody}</p>
              </div>
              <strong>
                {health.db === "connected"
                  ? yonetimApp.healthOk
                  : yonetimApp.healthOff}
              </strong>
            </div>
            <div className="pn-health-row">
              <div>
                <h3>{yonetimApp.healthWa}</h3>
                <p>{yonetimApp.healthWaBody}</p>
              </div>
              <strong>
                {health.whatsapp === "not_connected"
                  ? yonetimApp.healthOff
                  : health.whatsapp}
              </strong>
            </div>
            <Link
              className="am-btn am-btn--ghost am-btn--block mt-3"
              href="/app/yonetim/sistem"
            >
              {yonetimApp.navHealth}
            </Link>
          </section>
          <section className="pn-card">
            <h3>{panel.quickActions}</h3>
            <div className="pn-quick-links">
              <Link href="/app/yonetim/kiracilar">
                <IconServices />
                {yonetimApp.navTenants}
              </Link>
              <Link href="/app/yonetim/kullanicilar">
                <IconUsers />
                {yonetimApp.navUsers}
              </Link>
              <Link href="/app/yonetim/icerik">
                <IconApprove />
                {yonetimApp.navContent}
              </Link>
              <Link href="/app/yonetim/denetim">
                <IconCalendar />
                {yonetimApp.navAudit}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
