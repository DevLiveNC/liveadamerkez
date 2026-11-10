"use client";

import { useEffect, useState } from "react";
import { trackingConsent } from "@ada-merkez/copy";
import {
  acceptTrackingConsent,
  readTrackingConsent,
  rejectTrackingConsent,
} from "../lib/tracking-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(!readTrackingConsent().decided);
  }, []);

  if (!visible) return null;

  return (
    <div className="consent-banner" role="dialog" aria-label={trackingConsent.title}>
      <p>
        <strong>{trackingConsent.title}</strong>
      </p>
      <p>{trackingConsent.body}</p>
      <div className="consent-banner-actions">
        <button
          type="button"
          className="btn btn-coral"
          onClick={() => {
            acceptTrackingConsent();
            setVisible(false);
          }}
        >
          {trackingConsent.accept}
        </button>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            rejectTrackingConsent();
            setVisible(false);
          }}
        >
          {trackingConsent.reject}
        </button>
      </div>
    </div>
  );
}
