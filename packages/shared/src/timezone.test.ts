import { describe, expect, it } from "vitest";
import {
  formatInNicosia,
  nicosiaWallTimeToUtc,
  utcToNicosiaParts,
} from "./timezone.js";

describe("Europe/Nicosia timezone helpers", () => {
  it("converts winter UTC (EET, UTC+2) to Nicosia wall clock", () => {
    const utc = new Date("2026-01-15T10:00:00.000Z");
    const parts = utcToNicosiaParts(utc);
    expect(parts).toMatchObject({
      year: 2026,
      month: 1,
      day: 15,
      hour: 12,
      minute: 0,
    });
  });

  it("converts summer UTC (EEST, UTC+3) to Nicosia wall clock", () => {
    const utc = new Date("2026-07-15T10:00:00.000Z");
    const parts = utcToNicosiaParts(utc);
    expect(parts).toMatchObject({
      year: 2026,
      month: 7,
      day: 15,
      hour: 13,
      minute: 0,
    });
  });

  it("round-trips a Nicosia wall time through UTC storage", () => {
    const utc = nicosiaWallTimeToUtc(2026, 7, 15, 13, 30);
    expect(utc.toISOString()).toBe("2026-07-15T10:30:00.000Z");
    const parts = utcToNicosiaParts(utc);
    expect(parts.hour).toBe(13);
    expect(parts.minute).toBe(30);
  });

  it("formats in Turkish locale without inventing offsets", () => {
    const text = formatInNicosia(new Date("2026-01-15T10:00:00.000Z"));
    expect(text).toMatch(/15/);
    expect(text).toMatch(/12/);
  });
});
