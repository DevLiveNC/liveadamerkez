import type { Metadata } from "next";
import { isletmeApp } from "@ada-merkez/copy";
import { requireRole } from "../../../lib/app-auth";
import { IsletmeShell } from "../../../components/isletme/IsletmeShell";
import "../../../styles/tokens-v2-local.css";
import "../../../styles/panel-v2.css";
import "../../../styles/isletme.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${isletmeApp.loginTitle} — Ada Merkez`,
  robots: { index: false, follow: false },
};

export default async function IsletmeLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("business", "/app/isletme");
  return <IsletmeShell session={session}>{children}</IsletmeShell>;
}
