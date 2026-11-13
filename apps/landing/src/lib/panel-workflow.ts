import {
  nicosiaDateKey,
  nicosiaWallTimeToUtc,
  nicosiaWeekday,
  parseNicosiaDateKey,
  utcToNicosiaParts,
} from "@ada-merkez/shared";

export const PANEL_PAGE_SIZE = 20;
const NICOSIA = "Europe/Nicosia";

export function normalizeSearch(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function matchesSearch(
  values: (string | null | undefined)[],
  query: string,
): boolean {
  const needle = normalizeSearch(query);
  return (
    !needle ||
    normalizeSearch(values.filter(Boolean).join(" ")).includes(needle)
  );
}

export function pageSlice<T>(
  rows: readonly T[],
  page: number,
  size = PANEL_PAGE_SIZE,
): T[] {
  const safe = Math.max(0, Math.floor(page));
  return rows.slice(safe * size, (safe + 1) * size);
}

export function isApprovalPending(status: string): boolean {
  return ["pending", "received", "review"].includes(status);
}

export function nicosiaDayRange(
  key: string,
): { from: string; to: string } | null {
  const parsed = parseNicosiaDateKey(key, NICOSIA);
  if (!parsed) return null;
  const { year, month, day } = parsed;
  return {
    from: nicosiaWallTimeToUtc(
      year,
      month,
      day,
      0,
      0,
      0,
      NICOSIA,
    ).toISOString(),
    to: nicosiaWallTimeToUtc(
      year,
      month,
      day + 1,
      0,
      0,
      0,
      NICOSIA,
    ).toISOString(),
  };
}

/** Yarım açık [from,to); DST günleri 23/25 saat olabilir, 24h sabiti kullanılmaz. */
export function reportRange(
  preset: "week" | "week7" | "month",
  now = new Date(),
): { from: string; to: string } {
  const parts = utcToNicosiaParts(now, NICOSIA);
  let start = { year: parts.year, month: parts.month, day: parts.day };
  if (preset === "week") {
    const weekday = (nicosiaWeekday(now, NICOSIA) + 6) % 7;
    start = { ...start, day: parts.day - weekday };
  } else if (preset === "week7") start = { ...start, day: parts.day - 6 };
  else start = { ...start, day: 1 };
  return {
    from: nicosiaDateKey(
      nicosiaWallTimeToUtc(
        start.year,
        start.month,
        start.day,
        12,
        0,
        0,
        NICOSIA,
      ),
      NICOSIA,
    ),
    to: nicosiaDateKey(now, NICOSIA),
  };
}

export function validReportRange(from: string, to: string): boolean {
  const a = parseNicosiaDateKey(from, NICOSIA);
  const b = parseNicosiaDateKey(to, NICOSIA);
  if (!a || !b) return false;
  const start = Date.UTC(a.year, a.month - 1, a.day);
  const end = Date.UTC(b.year, b.month - 1, b.day);
  return start <= end && end - start <= 30 * 86_400_000;
}

export function nicosiaInputToUtc(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const [, y, m, d, h, min] = match;
  const year = Number(y),
    month = Number(m),
    day = Number(d),
    hour = Number(h),
    minute = Number(min);
  if (
    hour > 23 ||
    minute > 59 ||
    !parseNicosiaDateKey(`${y}-${m}-${d}`, NICOSIA)
  )
    return null;
  const utc = nicosiaWallTimeToUtc(year, month, day, hour, minute, 0, NICOSIA);
  const round = utcToNicosiaParts(utc, NICOSIA);
  if (
    round.year !== year ||
    round.month !== month ||
    round.day !== day ||
    round.hour !== hour ||
    round.minute !== minute
  )
    return null;
  return utc;
}

export function validWorkingHours(start: string, end: string): boolean {
  const time = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
  return (
    (time.test(start) || start === "24:00") &&
    (time.test(end) || end === "24:00") &&
    start < end
  );
}

export function csvCell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function dailyReportCsv(
  rows: readonly (readonly (string | number)[])[],
): string {
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(name: string, content: string): void {
  const url = URL.createObjectURL(
    new Blob([content], { type: "text/csv;charset=utf-8" }),
  );
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
