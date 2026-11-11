export function apiBase(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost") return "http://localhost:3001";
    if (host === "127.0.0.1") return "http://127.0.0.1:3001";
  }
  return "";
}
