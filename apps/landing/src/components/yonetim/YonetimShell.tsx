"use client";

import { site, yonetimApp } from "@ada-merkez/copy";
import type { AppSession } from "../../lib/app-auth";
import { PanelShell, type PanelLink } from "../panel/PanelShell";
import {
  IconApprove,
  IconCalendar,
  IconInbox,
  IconOverview,
  IconReports,
  IconServices,
  IconSystem,
  IconUsers,
} from "../panel/icons";

const LINKS: PanelLink[] = [
  {
    href: "/app/yonetim",
    label: yonetimApp.navOverview,
    short: yonetimApp.navOverviewShort,
    icon: <IconOverview />,
  },
  {
    href: "/app/yonetim/onaylar",
    label: yonetimApp.navApprovalsLong,
    short: yonetimApp.navApprovals,
    icon: <IconApprove />,
  },
  {
    href: "/app/yonetim/rezervasyonlar",
    label: yonetimApp.navBookings,
    short: yonetimApp.navBookings,
    icon: <IconCalendar />,
  },
  {
    href: "/app/yonetim/raporlar",
    label: yonetimApp.navReports,
    short: yonetimApp.navReports,
    icon: <IconReports />,
  },
  {
    href: "/app/yonetim/kiracilar",
    label: yonetimApp.navTenants,
    short: yonetimApp.navTenants,
    icon: <IconServices />,
  },
  {
    href: "/app/yonetim/kullanicilar",
    label: yonetimApp.navUsers,
    short: yonetimApp.navUsers,
    icon: <IconUsers />,
  },
  {
    href: "/app/yonetim/icerik",
    label: yonetimApp.navContent,
    short: yonetimApp.navContent,
    icon: <IconInbox />,
  },
  {
    href: "/app/yonetim/denetim",
    label: yonetimApp.navAudit,
    short: yonetimApp.navAudit,
    icon: <IconInbox />,
  },
  {
    href: "/app/yonetim/sistem",
    label: yonetimApp.navHealth,
    short: yonetimApp.navHealth,
    icon: <IconSystem />,
  },
];
const PRIMARY = [
  "/app/yonetim",
  "/app/yonetim/onaylar",
  "/app/yonetim/rezervasyonlar",
  "/app/yonetim/raporlar",
];

export function YonetimShell({
  session,
  children,
}: {
  session: AppSession;
  children: React.ReactNode;
}) {
  return (
    <PanelShell
      kind="yonetim"
      root="/app/yonetim"
      name={session.name || site.name}
      roleLabel={yonetimApp.panelName}
      links={LINKS}
      primary={PRIMARY}
    >
      {children}
    </PanelShell>
  );
}
