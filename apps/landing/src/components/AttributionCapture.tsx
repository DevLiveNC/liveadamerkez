"use client";

import { useEffect } from "react";
import { type TouchPoint } from "@ada-merkez/shared";
import { apiBase } from "../lib/api";
import { captureAttribution } from "../lib/attribution-client";

export function AttributionCapture({ injected }: { injected?: TouchPoint | null }) {
  useEffect(() => {
    const state = captureAttribution(injected ?? null);
    const ref = state.last?.ref ?? state.first?.ref;
    const base = apiBase();
    if (ref && base) {
      void fetch(`${base}/v1/referral/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref, eventId: crypto.randomUUID() }),
        keepalive: true,
      }).catch(() => undefined);
    }
  }, [injected]);
  return null;
}
