"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { AppHeader, UiIcon } from "@ada-merkez/ui";
import { ICON_SRC } from "../Logo";
import { cityName } from "../../lib/pilot-cities";
import { LocationSheet } from "./LocationSheet";

/** Keşif başlığı — konum seçici cam kapsül, sağda bildirim ve logo. */
export function DiscoverHeader({ city = "" }: { city?: string }) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const label = cityName(city) || app.location;

  return (
    <>
      <header className="am-header am-header--blur atla-header">
        <button
          className="am-loc"
          type="button"
          aria-label={app.locationPicker}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <UiIcon name="pin" className="am-icon am-icon-sm" />
          <span>{label}</span>
          <UiIcon name="chevron" className="am-icon am-icon-sm" />
        </button>
        <div className="am-header-side">
          <Link className="am-icon-btn" href="/app/randevular#bildirimler" aria-label={app.notifications}>
            <UiIcon name="bell" />
          </Link>
          <span className="am-logo-sq">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={ICON_SRC} width={32} height={32} alt={app.title} />
          </span>
        </div>
      </header>
      <LocationSheet
        open={open}
        onClose={() => setOpen(false)}
        selected={city}
        onSelect={(next) => {
          setOpen(false);
          const params = new URLSearchParams();
          if (next) params.set("sehir", next);
          const query = params.toString();
          router.push(query ? `/app?${query}` : "/app");
        }}
      />
    </>
  );
}

/** Arama sonuç başlığı — işlevsiz süs düğmesi yok, yalnız geri ve başlık. */
export function SearchHeader() {
  return <AppHeader title={app.searchTitle} back={{ href: "/app", label: app.back }} />;
}
