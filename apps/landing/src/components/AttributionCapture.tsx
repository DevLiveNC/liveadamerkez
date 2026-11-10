"use client";

import { useEffect } from "react";
import { isReferralCode, type TouchPoint } from "@ada-merkez/shared";
import { apiBase } from "../lib/api";
import { captureAttribution } from "../lib/attribution-client";
import { readTrackingConsent } from "../lib/tracking-consent";

export function AttributionCapture({ injected }: { injected?: TouchPoint | null }) {
  useEffect(() => {
    const consent = readTrackingConsent();
    if (!consent.analytics) return;
    const state = captureAttribution(injected ?? null);
    const ref = state.last?.ref ?? state.first?.ref;
    const base = apiBase();
    if (ref && isReferralCode(ref) && base) {
      void fetch(`${base}/v1/referral/click`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          code: ref,
          eventId: crypto.randomUUID(),
        }),
        keepalive: true,
      }).catch(() => undefined);
    }
  }, [injected]);
  return null;
}
