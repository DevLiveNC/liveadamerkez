import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { ICON_SRC } from "../Logo";
import { UiIcon } from "@ada-merkez/ui";

export function DiscoverHeader() {
  return (
    <header className="am-header">
      <button className="am-loc" type="button" aria-label={app.locationPicker}>
        <UiIcon name="pin" />
        <span>{app.location}</span>
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
  );
}

export function SearchHeader() {
  return (
    <header className="am-header am-header--blur">
      <Link className="am-icon-btn" href="/app" aria-label={app.back}>
        <UiIcon name="back" />
      </Link>
      <h1 className="am-header-title">{app.searchTitle}</h1>
      <span className="am-icon-btn" aria-hidden="true">
        <UiIcon name="filter" />
      </span>
    </header>
  );
}
