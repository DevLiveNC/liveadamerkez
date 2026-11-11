import { redirect } from "next/navigation";
import { requireRole, type AppSession } from "../../../lib/app-auth";

export async function requireIsletmePanel(nextPath: string): Promise<AppSession> {
  const session = await requireRole("business", nextPath);
  if (!session.tenantId && nextPath !== "/app/isletme/kayit") {
    redirect("/app/isletme/kayit");
  }
  if (session.tenantId && nextPath === "/app/isletme/kayit") {
    redirect("/app/isletme");
  }
  return session;
}
