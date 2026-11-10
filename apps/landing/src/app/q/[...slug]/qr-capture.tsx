"use client";

import { useEffect } from "react";
import { channelFromTouch, type TouchPoint } from "@ada-merkez/shared";
import { AttributionCapture } from "../../../components/AttributionCapture";
import { trackBrowserEvent } from "../../../lib/browser-analytics";

export function QrCapture({ injected }: { injected: TouchPoint }) {
  useEffect(() => {
    trackBrowserEvent("qr_landing", {
      event_id: crypto.randomUUID(),
      channel: channelFromTouch(injected),
      business_id: injected.businessId,
      content: injected.content,
    });
  }, [injected]);
  return <AttributionCapture injected={injected} />;
}
