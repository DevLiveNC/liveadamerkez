import type { SessionRole } from "./roles.js";

export const APP_HOME = "/app";
export const APP_LOGIN = "/app/giris";
export const SESSION_COOKIE = "am_session";

export function isAppPath(pathname: string): boolean {
  return pathname === APP_HOME || pathname.startsWith(`${APP_HOME}/`);
}

const ROLE_QUERY: Record<SessionRole, string> = {
  customer: "musteri",
  business: "isletme",
  admin: "yonetici",
};

export function parseAppRoleParam(value: string | null | undefined): SessionRole {
  const raw = value?.trim().toLowerCase();
  if (raw === "isletme" || raw === "business") return "business";
  if (raw === "yonetici" || raw === "admin") return "admin";
  return "customer";
}

export type AuthMode = "login" | "register";

/** `mod=kayit` veya geriye dönük `kayit=1`. */
export function parseAuthModeParam(
  mod?: string | null,
  kayit?: string | null,
): AuthMode {
  const raw = mod?.trim().toLowerCase();
  if (raw === "kayit" || raw === "register" || kayit === "1") return "register";
  return "login";
}

export function authPageUrl(options: {
  role: SessionRole;
  mode?: AuthMode;
  next?: string | null;
}): string {
  const params = new URLSearchParams();
  if (options.role !== "customer") params.set("rol", roleToQuery(options.role));
  const mode = options.mode ?? "login";
  if (mode === "register") {
    params.set("mod", "kayit");
    if (options.role !== "admin") params.set("kayit", "1");
  } else if (options.role !== "customer") {
    params.set("mod", "giris");
  }
  const next = options.next ? safeAppPath(options.next) : APP_HOME;
  if (next !== APP_HOME) params.set("next", next);
  const query = params.toString();
  return query ? `${APP_LOGIN}?${query}` : APP_LOGIN;
}

export function roleToQuery(role: SessionRole): string {
  return ROLE_QUERY[role];
}

/**
 * Open-redirect koruması: yalnızca aynı-origin `/app` ve `/app/...` yolları.
 * `/apple`, `//evil`, `https://...` ve backslash kabul edilmez.
 */
export function safeAppPath(raw: unknown, fallback = APP_HOME): string {
  if (typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("://")) return fallback;
  if (trimmed.startsWith("//")) return fallback;
  if (/[\u0000-\u001f\u007f]/.test(trimmed)) return fallback;
  try {
    const url = new URL(trimmed, "https://ada.invalid");
    if (url.origin !== "https://ada.invalid") return fallback;
    if (url.username || url.password) return fallback;
    const path = url.pathname;
    if (path !== APP_HOME && !path.startsWith(`${APP_HOME}/`)) return fallback;
    return `${path}${url.search}`;
  } catch {
    return fallback;
  }
}

/** `next` query her okumada `safeAppPath` ile süzülür. */
export function readNextParam(
  search: { get(name: string): string | null } | null | undefined,
  fallback = APP_HOME,
): string {
  return safeAppPath(search?.get("next"), safeAppPath(fallback));
}

export function loginUrl(options?: {
  next?: string | null;
  role?: SessionRole;
  register?: boolean;
}): string {
  const params = new URLSearchParams();
  if (options?.role && options.role !== "customer") {
    params.set("rol", roleToQuery(options.role));
  }
  if (options?.register && options.role !== "admin") {
    params.set("kayit", "1");
  }
  const next = options?.next ? safeAppPath(options.next) : APP_HOME;
  if (next !== APP_HOME) params.set("next", next);
  const query = params.toString();
  return query ? `${APP_LOGIN}?${query}` : APP_LOGIN;
}
