"use client";

import { useEffect, useState } from "react";
import { trackingConsent } from "@ada-merkez/copy";
import {
  acceptTrackingConsent,
  readTrackingConsent,
  rejectTrackingConsent,
  saveTrackingPreferences,
} from "../lib/tracking-consent";

export function ConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const current = readTrackingConsent();
    setVisible(!current.decided);
    setAnalytics(current.analytics);
    setMarketing(current.marketing);
  }, []);

  if (!visible) return null;

  return (
    <div className="consent-banner" role="dialog" aria-label={trackingConsent.title}>
      <p>
        <strong>{trackingConsent.title}</strong>
      </p>
      <p>{settings ? trackingConsent.settingsBody : trackingConsent.body}</p>
      {settings ? (
        <div className="consent-banner-settings">
          <label>
            <input
              type="checkbox"
              checked={analytics}
              onChange={(event) => setAnalytics(event.target.checked)}
            />
            {trackingConsent.analyticsLabel}
          </label>
          <label>
            <input
              type="checkbox"
              checked={marketing}
              onChange={(event) => setMarketing(event.target.checked)}
            />
            {trackingConsent.marketingLabel}
          </label>
        </div>
      ) : null}
      <div className="consent-banner-actions">
        {settings ? (
          <button
            type="button"
            className="btn btn-coral"
            onClick={() => {
              saveTrackingPreferences({ analytics, marketing });
              setVisible(false);
            }}
          >
            {trackingConsent.save}
          </button>
        ) : (
          <>
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
            <button type="button" className="btn btn-ghost" onClick={() => setSettings(true)}>
              {trackingConsent.settings}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
