"use client";

import { useEffect, useState } from "react";
import { site, util, waitlist } from "@ada-merkez/copy";

const CITIES = [waitlist.cities.lefkosa, waitlist.cities.girne, waitlist.cities.magusa] as const;
const CURRENCIES = ["TL", "GBP", "EUR"] as const;

function formatNicosiaTime(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: site.timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function nicosiaOffsetLabel(date: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: site.timezone,
    timeZoneName: "shortOffset",
  }).formatToParts(date);
  const raw = parts.find((part) => part.type === "timeZoneName")?.value ?? "GMT+2";
  return raw.replace("GMT", "UTC");
}

export function UtilBar() {
  const [now, setNow] = useState<Date | null>(null);
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>("TL");

  useEffect(() => {
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const stamp = now ?? new Date(0);

  return (
    <div className="util">
      <div className="wrap util-in">
        <p className="util-cities">
          {CITIES.map((city, index) => (
            <span key={city}>
              {index > 0 ? <span aria-hidden="true">·</span> : null}
              <span>{city}</span>
            </span>
          ))}
        </p>
        <div className="util-tools">
          <p className="clock">
            <span>{util.clock}</span>{" "}
            <time dateTime={now ? now.toISOString() : undefined} suppressHydrationWarning>
              {now ? formatNicosiaTime(now) : "--:--"}
            </time>
            {now ? ` · ${nicosiaOffsetLabel(stamp)}` : null}
          </p>
          <div className="seg currency" role="group" aria-label={util.currencyGroup}>
            <span className="currency-label">{util.currency}</span>
            {CURRENCIES.map((code) => (
              <button
                key={code}
                type="button"
                aria-pressed={currency === code}
                onClick={() => setCurrency(code)}
              >
                {code === "GBP" ? "£" : code === "EUR" ? "€" : "TL"}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
