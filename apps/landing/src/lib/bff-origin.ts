/** BFF mutasyonları yalnızca aynı origin (Origin / Sec-Fetch-Site). */

function trustedForwardedHostEnabled(): boolean {
  return process.env.TRUST_FORWARDED_HOST === "true";
}

function headerHost(request: Request, name: "host" | "x-forwarded-host"): string {
  return request.headers.get(name)?.split(",")[0]?.trim() ?? "";
}

/** Gerçek Host önce. X-Forwarded-Host yalnız TRUST_FORWARDED_HOST=true iken yedek. */
export function requestHost(request: Request): string {
  const host = headerHost(request, "host");
  if (host) return host;
  if (!trustedForwardedHostEnabled()) return "";
  return headerHost(request, "x-forwarded-host");
}

export function isTrustedSameOrigin(request: Request): boolean {
  const site = (request.headers.get("sec-fetch-site") ?? "").trim().toLowerCase();
  if (site === "cross-site" || site === "same-site") return false;
  if (site === "same-origin" || site === "none") return true;

  const origin = request.headers.get("origin")?.trim();
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const host = requestHost(request);
  if (host && originHost === host) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
