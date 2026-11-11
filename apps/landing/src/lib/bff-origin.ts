/** BFF mutasyonları yalnızca aynı origin (Origin / Sec-Fetch-Site). */
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
  const hostHeader = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "";
  const host = hostHeader.split(",")[0]?.trim() ?? "";
  if (host && originHost === host) return true;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}
