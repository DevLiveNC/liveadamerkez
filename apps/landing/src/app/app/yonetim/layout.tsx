import type { Metadata } from "next";
import { yonetimApp } from "@ada-merkez/copy";
import { requireRole } from "../../../lib/app-auth";
import { YonetimShell } from "../../../components/yonetim/YonetimShell";
import "../../../styles/yonetim.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${yonetimApp.loginTitle} — Ada Merkez`,
  robots: { index: false, follow: false },
};

export default async function YonetimLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("admin", "/app/yonetim");
  return <YonetimShell session={session}>{children}</YonetimShell>;
}
