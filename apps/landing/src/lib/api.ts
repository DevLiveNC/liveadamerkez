export function apiBase(): string {
  if (typeof window === "undefined" && process.env.API_URL) {
    return process.env.API_URL.replace(/\/$/, "");
  }
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    /* Preview/browser aynı origin kullanır; Next rewrite API_URL’e sunucuda iletir. */
    return window.location.origin;
  }
  return "";
}
