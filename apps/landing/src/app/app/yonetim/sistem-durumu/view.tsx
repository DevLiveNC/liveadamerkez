"use client";

import { useEffect, useState } from "react";
import { yonetimApp } from "@ada-merkez/copy";
import { EmptyState } from "../../../../components/app/EmptyState";
import { fetchHealth, type AdminHealth } from "../../../../lib/yonetim-api";

function labelFor(kind: "api" | "db" | "wa" | "queue", health: AdminHealth) {
  if (kind === "api") return health.api === "ok" ? yonetimApp.healthOk : yonetimApp.healthError;
  if (kind === "db") return health.db === "connected" ? yonetimApp.healthOk : yonetimApp.healthOff;
  if (kind === "wa") return yonetimApp.healthOff;
  return yonetimApp.healthClosed;
}

function dotFor(kind: "api" | "db" | "wa" | "queue", health: AdminHealth) {
  if (kind === "api") return health.api === "ok" ? "ok" : "off";
  if (kind === "db") return health.db === "connected" ? "ok" : "off";
  return "off";
}

export function SistemDurumuView() {
  const [health, setHealth] = useState<AdminHealth | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchHealth()
      .then((data) => setHealth(data.health))
      .catch(() => setError(true));
  }, []);

  if (error) return <EmptyState kind="hata" />;
  if (!health) {
    return (
      <div className="yonetim-head">
        <h1>{yonetimApp.healthTitle}</h1>
      </div>
    );
  }

  const cards = [
    { kind: "api" as const, title: yonetimApp.healthApi, body: yonetimApp.healthApiBody },
    { kind: "db" as const, title: yonetimApp.healthDb, body: yonetimApp.healthDbBody },
    { kind: "wa" as const, title: yonetimApp.healthWa, body: yonetimApp.healthWaBody },
    { kind: "queue" as const, title: yonetimApp.healthQueue, body: yonetimApp.healthQueueBody },
  ];

  return (
    <div>
      <div className="yonetim-head">
        <p className="t-label">{yonetimApp.who}</p>
        <h1>{yonetimApp.healthTitle}</h1>
        <p className="t-sm t-muted">{yonetimApp.healthLead}</p>
      </div>
      <div className="status-grid">
        {cards.map((card) => (
          <article key={card.kind} className="status-card">
            <h3>
              <span className={`status-dot ${dotFor(card.kind, health)}`} />
              {card.title}
            </h3>
            <p className="t-sm t-muted">{card.body}</p>
            <p className="t-xs t-subtle" style={{ marginTop: 8 }}>
              {labelFor(card.kind, health)}
              {card.kind === "api" ? ` · ${health.timezone}` : null}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
