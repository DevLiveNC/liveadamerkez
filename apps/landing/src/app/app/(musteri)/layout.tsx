import { headers } from "next/headers";
import { requireRole } from "../../../lib/app-auth";

export const dynamic = "force-dynamic";

export default async function MusteriLayout({ children }: { children: React.ReactNode }) {
  const path = (await headers()).get("x-ada-path") || "/app";
  await requireRole("customer", path);
  return children;
}
