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

export function nicosiaDateKey(utc: Date, timeZone: string = getAppTimezone()): string {
  const parts = utcToNicosiaParts(utc, timeZone);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parts.year}-${pad(parts.month)}-${pad(parts.day)}`;
}

/** 0 = Pazar … 6 = Cumartesi, Europe/Nicosia. */
export function nicosiaWeekday(utc: Date, timeZone: string = getAppTimezone()): number {
  const label = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(utc);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(label);
}

export function parseNicosiaDateKey(
  key: string,
  timeZone: string = getAppTimezone(),
): { year: number; month: number; day: number } | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!year || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const probe = nicosiaWallTimeToUtc(year, month, day, 12, 0, 0, timeZone);
  const round = utcToNicosiaParts(probe, timeZone);
  if (round.year !== year || round.month !== month || round.day !== day) return null;
  return { year, month, day };
}

export function nicosiaTomorrowDateKey(now = new Date(), timeZone: string = getAppTimezone()): string {
  const today = utcToNicosiaParts(now, timeZone);
  const noon = nicosiaWallTimeToUtc(today.year, today.month, today.day, 12, 0, 0, timeZone);
  const next = new Date(noon.getTime() + 24 * 60 * 60 * 1000);
  return nicosiaDateKey(next, timeZone);
}
