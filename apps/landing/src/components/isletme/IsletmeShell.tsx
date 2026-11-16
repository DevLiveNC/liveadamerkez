"use client";

import { useCallback } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { fetchMe } from "../../lib/isletme-api";
import { usePanelData } from "../panel/use-panel-data";
import { PanelShell, type PanelLink } from "../panel/PanelShell";
import {
  IconCalendar,
  IconClock,
  IconInbox,
  IconOverview,
  IconServices,
  IconSettings,
} from "../panel/icons";

const LINKS: PanelLink[] = [
  {
    href: "/app/isletme",
    label: isletmeApp.navOverview,
    short: isletmeApp.navOverviewShort,
    icon: <IconOverview />,
  },
  {
    href: "/app/isletme/takvim",
    label: isletmeApp.navCalendar,
    short: isletmeApp.navCalendar,
    icon: <IconCalendar />,
  },
  {
    href: "/app/isletme/talepler",
    label: isletmeApp.navInboxLong,
    short: isletmeApp.navInbox,
    icon: <IconInbox />,
  },
  {
    href: "/app/isletme/hizmetler",
    label: isletmeApp.navServices,
    short: isletmeApp.navServices,
    icon: <IconServices />,
  },
  {
    href: "/app/isletme/profil",
    label: isletmeApp.navSettings,
    short: isletmeApp.navSettings,
    icon: <IconSettings />,
  },
  {
    href: "/app/isletme/bos-saatler",
    label: isletmeApp.navHours,
    short: isletmeApp.navSlots,
    icon: <IconClock />,
  },
];
const PRIMARY = [
  "/app/isletme",
  "/app/isletme/takvim",
  "/app/isletme/talepler",
  "/app/isletme/hizmetler",
];

export function IsletmeShell({
  session,
  children,
}: {
  session: { name: string | null };
  children: React.ReactNode;
}) {
  const loader = useCallback(() => fetchMe(), []);
  const { data } = usePanelData(loader, "business-shell");
  const business = data?.me.business;
  const banner =
    business?.status === "pending" || business?.status === "rejected" ? (
      <div className="am-banner" role="status">
        <strong>
          {business.status === "pending"
            ? isletmeApp.pendingBadge
            : isletmeApp.rejectedBadge}
        </strong>
        <p>
          {business.status === "pending"
            ? isletmeApp.pendingBody
            : isletmeApp.rejectedBody}
        </p>
      </div>
    ) : null;
  return (
    <PanelShell
      kind="isletme"
      root="/app/isletme"
      name={business?.name || session.name || isletmeApp.loginTitle}
      roleLabel={isletmeApp.loginTitle}
      links={LINKS}
      primary={PRIMARY}
      banner={banner}
    >
      {children}
    </PanelShell>
  );
}
