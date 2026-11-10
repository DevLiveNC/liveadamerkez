"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import { ga4Id, pixelId, trackBrowserEvent } from "../lib/browser-analytics";
import { readAttribution } from "../lib/attribution-client";
import { readTrackingConsent, type TrackingConsent } from "../lib/tracking-consent";
import { channelFromTouch } from "@ada-merkez/shared";

export function Analytics() {
  const pixel = pixelId();
  const ga = ga4Id();
  const [consent, setConsent] = useState<TrackingConsent>(() =>
    typeof window === "undefined"
      ? { analytics: false, marketing: false, decided: false }
      : readTrackingConsent(),
  );

  useEffect(() => {
    const sync = () => setConsent(readTrackingConsent());
    sync();
    window.addEventListener("am-consent", sync);
    return () => window.removeEventListener("am-consent", sync);
  }, []);

  useEffect(() => {
    if (!consent.analytics && !consent.marketing) return;
    const eventId = crypto.randomUUID();
    const attr = readAttribution();
    trackBrowserEvent("page_view", {
      event_id: eventId,
      channel: channelFromTouch(attr.last ?? attr.first),
      ref: attr.last?.ref ?? attr.first?.ref ?? null,
      business_id: attr.last?.businessId ?? attr.first?.businessId ?? null,
    });
  }, [consent.analytics, consent.marketing]);

  return (
    <>
      {consent.marketing && pixel ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixel}');`}
        </Script>
      ) : null}
      {consent.analytics && ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());
gtag('consent','update',{ad_storage:'denied',analytics_storage:'granted',ad_user_data:'denied',ad_personalization:'denied'});
gtag('config','${ga}',{send_page_view:true});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
