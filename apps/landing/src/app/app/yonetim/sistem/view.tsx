"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import {
  DataToolbar,
  PanelError,
  PanelIntro,
  PanelLoading,
} from "../../../../components/panel/PanelKit";
import {
  useOnline,
  usePanelData,
} from "../../../../components/panel/use-panel-data";
import { isStandalone } from "../../../../lib/panel-api";
import { fetchHealth } from "../../../../lib/yonetim-api";

export function SistemView() {
  const loader = useCallback(() => fetchHealth(), []);
  const query = usePanelData(loader, "admin-health");
  const online = useOnline();
  const [installed, setInstalled] = useState(false);
  useEffect(() => {
    setInstalled(isStandalone());
  }, []);
  const health = query.data?.health;
  const rows = health
    ? [
        {
          title: yonetimApp.healthApi,
          body: yonetimApp.healthApiBody,
          value:
            health.api === "ok" ? yonetimApp.healthOk : yonetimApp.healthError,
        },
        {
          title: yonetimApp.healthDb,
          body: yonetimApp.healthDbBody,
          value:
            health.db === "connected"
              ? yonetimApp.healthOk
              : yonetimApp.healthOff,
        },
        {
          title: yonetimApp.statWaitlist,
          body: yonetimApp.healthWaitlistBody,
          value: health.waitlistOpen
            ? yonetimApp.waitlistOpenLabel
            : yonetimApp.waitlistClosed,
        },
        {
          title: yonetimApp.healthWa,
          body: yonetimApp.healthWaBody,
          value:
            health.whatsapp === "not_connected"
              ? yonetimApp.healthOff
              : health.whatsapp,
        },
        {
          title: yonetimApp.healthQueue,
          body: yonetimApp.healthQueueBody,
          value:
            health.queue === "closed" ? yonetimApp.healthClosed : health.queue,
        },
        {
          title: panel.timezone,
          body: panel.timezoneBody,
          value: health.timezone,
        },
      ]
    : [];
  return (
    <>
      <PanelIntro eyebrow={yonetimApp.panelName} title={yonetimApp.healthTitle}>
        {yonetimApp.healthLead}
      </PanelIntro>
      {query.loading ? (
        <PanelLoading />
      ) : !health ? (
        <PanelError
          message={query.error ?? ""}
          retry={() => {
            void query.refresh();
          }}
        />
      ) : (
        <div className="pn-columns">
          <section className="pn-card">
            <h3>{panel.services}</h3>
            <DataToolbar
              updated={query.updatedAt}
              refreshing={query.refreshing}
            />
            {query.error ? <PanelError compact message={query.error} /> : null}
            {rows.map((row) => (
              <div className="pn-health-row" key={row.title}>
                <div>
                  <h3>{row.title}</h3>
                  <p>{row.body}</p>
                </div>
                <strong>{row.value}</strong>
              </div>
            ))}
          </section>
          <div className="pn-stack">
            <section className="pn-card">
              <h3>{panel.deviceTitle}</h3>
              <div className="pn-health-row">
                <h3>{panel.connection}</h3>
                <strong>{online ? panel.online : panel.offlineShort}</strong>
              </div>
              <div className="pn-health-row">
                <h3>{panel.displayMode}</h3>
                <strong>{installed ? panel.installed : panel.browser}</strong>
              </div>
              <button
                type="button"
                className="am-btn am-btn--ghost am-btn--block mt-3"
                onClick={() =>
                  window.dispatchEvent(new Event("am:install-request"))
                }
              >
                {panel.install}
              </button>
            </section>
            <section className="pn-card">
              <h3>{panel.quickActions}</h3>
              <div className="pn-quick-links">
                <Link href="/app/yonetim/kiracilar">
                  {yonetimApp.navTenants}
                </Link>
                <Link href="/app/yonetim/denetim">{yonetimApp.navAudit}</Link>
                <Link href="/app/yonetim/rezervasyonlar">
                  {yonetimApp.navBookings}
                </Link>
                <Link href="/app/yonetim/icerik">{yonetimApp.navContent}</Link>
              </div>
            </section>
          </div>
        </div>
      )}
    </>
  );
}
