import {
  nicosiaDateKey,
  nicosiaWallTimeToUtc,
  utcToNicosiaParts,
} from "@ada-merkez/shared";

export type NicosiaDay = {
  key: string;
  dow: string;
  num: string;
};

export function nicosiaDayStrip(count = 7, now = new Date()): NicosiaDay[] {
  const today = utcToNicosiaParts(now);
  let noon = nicosiaWallTimeToUtc(today.year, today.month, today.day, 12, 0, 0);
  const days: NicosiaDay[] = [];
  for (let i = 0; i < count; i += 1) {
    const parts = utcToNicosiaParts(noon);
    days.push({
      key: nicosiaDateKey(noon),
      dow: new Intl.DateTimeFormat("tr-TR", {
        weekday: "short",
        timeZone: "Europe/Nicosia",
      })
        .format(noon)
        .replace(".", ""),
      num: String(parts.day),
    });
    noon = new Date(noon.getTime() + 24 * 60 * 60 * 1000);
  }
  return days;
}
