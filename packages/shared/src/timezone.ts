import { APP_TIMEZONE } from "./constants.js";

const NICOSIA = APP_TIMEZONE;

export function getAppTimezone(): string {
  return process.env.APP_TIMEZONE?.trim() || NICOSIA;
}

/** UTC anını Europe/Nicosia duvar saati parçalarına çevirir. */
export function utcToNicosiaParts(
  utc: Date,
  timeZone: string = getAppTimezone(),
): {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
} {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = Object.fromEntries(
    fmt.formatToParts(utc).map((p) => [p.type, p.value]),
  );
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function formatInNicosia(
  utc: Date,
  locale = "tr-TR",
  timeZone: string = getAppTimezone(),
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    dateStyle: "short",
    timeStyle: "short",
  }).format(utc);
}

/**
 * Europe/Nicosia duvar saatini UTC Date'e çevirir.
 * DST (EET/EEST) Intl ile çözülür.
 */
export function nicosiaWallTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second = 0,
  timeZone: string = getAppTimezone(),
): Date {
  const guess = Date.UTC(year, month - 1, day, hour, minute, second);
  const asTz = utcToNicosiaParts(new Date(guess), timeZone);
  const tzAsUtc = Date.UTC(
    asTz.year,
    asTz.month - 1,
    asTz.day,
    asTz.hour,
    asTz.minute,
    asTz.second,
  );
  const offsetMs = tzAsUtc - guess;
  return new Date(guess - offsetMs);
}

export function assertSlotStoredAsUtc(date: Date): void {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error("Slot zamanı geçerli bir UTC Date olmalıdır.");
  }
}
