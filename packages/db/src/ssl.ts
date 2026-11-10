export function pgSslOption(
  url: string,
): { rejectUnauthorized: true } | undefined {
  if (/sslmode=disable/i.test(url)) return undefined;
  if (
    url.includes("neon.tech") ||
    /sslmode=(require|verify-ca|verify-full)/i.test(url)
  ) {
    return { rejectUnauthorized: true };
  }
  return undefined;
}
