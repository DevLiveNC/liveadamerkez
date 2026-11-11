import type { ReactNode } from "react";

/** Lucide’den türetilmiş yollar (ISC). Lisans: /THIRD_PARTY.md */

type IconName =
  | "home"
  | "calendar"
  | "heart"
  | "user"
  | "inbox"
  | "search"
  | "building"
  | "chart"
  | "shield"
  | "server"
  | "message"
  | "pin"
  | "bell"
  | "filter"
  | "clock"
  | "chevron"
  | "back"
  | "close"
  | "compass";

const PATHS: Record<IconName, ReactNode> = {
  home: (
    <>
      <path d="M3 11.5 12 4l9 7.5" />
      <path d="M6 10.5V20h12v-9.5" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M4 10h16" />
    </>
  ),
  heart: <path d="M12 19s-7-4.4-7-9a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 4.6-7 9-7 9z" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M5 19c1.5-3 4-4.5 7-4.5S17.5 16 19 19" />
    </>
  ),
  inbox: <path d="M5 18 4 21l3.2-1.2A9 9 0 1 0 5 18z" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" />
      <path d="m16 16 4 4" />
    </>
  ),
  building: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h6" />
    </>
  ),
  chart: <path d="M5 19V9M10 19V5M15 19v-7M20 19V8" />,
  shield: <path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z" />,
  server: (
    <>
      <rect x="4" y="5" width="16" height="5" rx="1.5" />
      <rect x="4" y="14" width="16" height="5" rx="1.5" />
      <path d="M8 7.5h.01M8 16.5h.01" />
    </>
  ),
  message: (
    <>
      <path d="M5 18 4 21l3.2-1.2A9 9 0 1 0 5 18z" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11z" />
      <circle cx="12" cy="10" r="2.2" />
    </>
  ),
  bell: (
    <>
      <path d="M6 8a6 6 0 1 1 12 0c0 7 3 7 3 9H3s3-2 3-9" />
      <path d="M10 21a2 2 0 0 0 4 0" />
    </>
  ),
  filter: <path d="M4 8h16M4 16h16M10 6v4M14 14v4" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4.5l3 2" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
  back: <path d="m15 18-6-6 6-6" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m16 8-2.5 6.5L7 17l2.5-6.5z" />
    </>
  ),
};

export function UiIcon({ name, title, className }: { name: IconName; title?: string; className?: string }) {
  return (
    <svg
      className={className ?? "am-icon"}
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      {PATHS[name]}
    </svg>
  );
}

export type { IconName };
