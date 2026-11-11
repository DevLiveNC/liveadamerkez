import { app, search, site } from "@ada-merkez/copy";

export function greetingForNicosia(now = new Date(), timeZone = site.timezone) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone,
      hour: "numeric",
      hourCycle: "h23",
    }).format(now),
  );
  if (hour < 12) return app.greetingMorning;
  if (hour < 18) return app.greetingAfternoon;
  return app.greetingEvening;
}

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

/** Europe/Nicosia yarını; «Çarşamba, 11 Kasım» biçimi (örnek kart). */
export function sampleBoardDateLabel(now = new Date(), timeZone = site.timezone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const num = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const next = new Date(Date.UTC(num("year"), num("month") - 1, num("day") + 1, 12, 0, 0));
  const weekday = new Intl.DateTimeFormat("tr-TR", { timeZone, weekday: "long" }).format(next);
  const rest = new Intl.DateTimeFormat("tr-TR", {
    timeZone,
    day: "numeric",
    month: "long",
  }).format(next);
  const dayName = weekday.charAt(0).toLocaleUpperCase("tr-TR") + weekday.slice(1);
  return `${dayName}, ${rest}`;
}
