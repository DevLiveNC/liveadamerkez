"use client";

import { useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { SampleBadge } from "../../../../components/panel/SampleBadge";
import { fetchHealth, type AdminHealth } from "../../../../lib/yonetim-api";

export function SistemView() {
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data.health))
      .catch(() => setError(true));
  }, []);

  if (error) return <EmptyState kind="hata" />;
  if (!health) return null;

  const waitlistClosed = !health.waitlistOpen;
  const apiOk = health.api === "ok";
  const dbOk = health.db === "connected";

  return (
    <section className="am-panel-card">
      <h2>{yonetimApp.healthTitle}</h2>
      <p className="am-chart-caption" style={{ marginBottom: 12 }}>
        {yonetimApp.healthLead}
      </p>
      <div className="am-entity">
        <div className="am-entity-body">
          <h3>{yonetimApp.statWaitlist}</h3>
          <p>{yonetimApp.healthWaitlistBody}</p>
        </div>
        <strong>{waitlistClosed ? yonetimApp.waitlistClosed : yonetimApp.waitlistOpenLabel}</strong>
      </div>
      <div className="am-entity">
        <div className="am-entity-body">
          <h3>{yonetimApp.healthApi}</h3>
          <p>{yonetimApp.healthApiBody}</p>
        </div>
        <strong>{apiOk ? yonetimApp.healthOk : yonetimApp.healthError}</strong>
      </div>
      <div className="am-entity">
        <div className="am-entity-body">
          <h3>{yonetimApp.healthDb}</h3>
          <p>{yonetimApp.healthDbBody}</p>
        </div>
        <strong>{dbOk ? yonetimApp.healthOk : yonetimApp.healthOff}</strong>
      </div>
      <div className="am-entity">
        <div className="am-entity-body">
          <h3>{yonetimApp.healthPwa}</h3>
          <p>{yonetimApp.healthPwaBody}</p>
        </div>
        <strong>{yonetimApp.healthPwaValue}</strong>
        <SampleBadge />
      </div>
    </section>
  );
}
