import { search, site } from "@ada-merkez/copy";

/** Europe/Nicosia takvim gününe 1 gün ekler; «Yarın, 11 Kasım» biçimi. */
export function tomorrowWhenLabel(now = new Date(), timeZone = site.timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const num = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const next = new Date(Date.UTC(num("year"), num("month") - 1, num("day") + 1, 12, 0, 0));
  const date = new Intl.DateTimeFormat("tr-TR", {
    timeZone,
    day: "numeric",
    month: "long",
  }).format(next);
  return `${search.whenPrefix} ${date}`;
}
