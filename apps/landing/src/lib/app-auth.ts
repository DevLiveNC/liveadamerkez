import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  loginUrl,
  safeAppPath,
  SESSION_COOKIE,
  type SessionRole,
} from "@ada-merkez/shared";
import { apiBase } from "./api";

export type AppSession = {
  id: string;
  role: SessionRole;
  name: string | null;
  phone: string;
  tenantId: string | null;
};

export async function getSession(): Promise<AppSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value?.trim();
  if (!token) return null;
  const base = apiBase();
  if (!base) return null;
  try {
    const res = await fetch(`${base}/v1/auth/me`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const body = (await res.json()) as { ok?: boolean; user?: AppSession };
    if (!body.ok || !body.user?.id) return null;
    return body.user;
  } catch {
    return null;
  }
}

export async function requireSession(nextPath: string): Promise<AppSession> {
  const session = await getSession();
  if (!session) {
    redirect(loginUrl({ next: safeAppPath(nextPath) }));
  }
  return session;
}

export async function requireRole(
  role: SessionRole | SessionRole[],
  nextPath: string,
): Promise<AppSession> {
  const session = await requireSession(nextPath);
  const allowed = Array.isArray(role) ? role : [role];
  if (!allowed.includes(session.role)) {
    redirect("/app/yetki");
  }
  return session;
}
