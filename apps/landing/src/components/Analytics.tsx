"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ga4Id, pixelId, trackBrowserEvent } from "../lib/browser-analytics";
import { readAttribution } from "../lib/attribution-client";
import { channelFromTouch } from "@ada-merkez/shared";

export function Analytics() {
  const pixel = pixelId();
  const ga = ga4Id();

  useEffect(() => {
    const eventId = crypto.randomUUID();
    const attr = readAttribution();
    trackBrowserEvent("page_view", {
      event_id: eventId,
      channel: channelFromTouch(attr.last ?? attr.first),
      ref: attr.last?.ref ?? attr.first?.ref ?? null,
      business_id: attr.last?.businessId ?? attr.first?.businessId ?? null,
    });
  }, []);

  return (
    <>
      {pixel ? (
        <>
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${pixel}');`}
          </Script>
          <noscript>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${pixel}&ev=PageView&noscript=1`}
            />
          </noscript>
        </>
      ) : null}
      {ga ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('js',new Date());gtag('config','${ga}',{send_page_view:true});`}
          </Script>
        </>
      ) : null}
    </>
  );
}
