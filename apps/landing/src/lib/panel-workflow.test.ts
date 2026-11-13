import { describe, expect, it } from "vitest";
import {
  csvCell,
  dailyReportCsv,
  isApprovalPending,
  matchesSearch,
  nicosiaDayRange,
  nicosiaInputToUtc,
  pageSlice,
  reportRange,
  validReportRange,
  validWorkingHours,
} from "./panel-workflow";

describe("panel arama ve sayfalama", () => {
  it("Türkçe harfleri ve boşlukları tolere eder", () => {
    expect(matchesSearch(["Işıl Kuaför", "Lefkoşa"], "ışıl")).toBe(true);
    expect(matchesSearch(["İşletme Çiçek"], "isletme cicek")).toBe(true);
    expect(matchesSearch([null, "Randevu"], "  ")).toBe(true);
    expect(matchesSearch(["Başka"], "yok")).toBe(false);
  });
  it("sayfa sınırlarını korur", () => {
    expect(pageSlice([1, 2, 3, 4], 1, 2)).toEqual([3, 4]);
    expect(pageSlice([1, 2], -1, 2)).toEqual([1, 2]);
    expect(pageSlice([1, 2], 8, 2)).toEqual([]);
  });
  it("received ve review onay kuyruğunu kaybetmez", () => {
    for (const status of ["pending", "received", "review"])
      expect(isApprovalPending(status)).toBe(true);
    expect(isApprovalPending("approved")).toBe(false);
  });
});

describe("Europe/Nicosia tarih sözleşmesi", () => {
  it("kış ve yaz gününü cihazdan bağımsız UTC'ye çevirir", () => {
    expect(nicosiaDayRange("2026-01-15")).toEqual({
      from: "2026-01-14T22:00:00.000Z",
      to: "2026-01-15T22:00:00.000Z",
    });
    expect(nicosiaDayRange("2026-07-15")).toEqual({
      from: "2026-07-14T21:00:00.000Z",
      to: "2026-07-15T21:00:00.000Z",
    });
  });
  it("DST geçişinde 23 saatlik gün üretir", () => {
    const range = nicosiaDayRange("2026-03-29")!;
    expect(Date.parse(range.to) - Date.parse(range.from)).toBe(23 * 3_600_000);
  });
  it("datetime-local girişini Nicosia olarak yorumlar, geçersiz saati reddeder", () => {
    expect(nicosiaInputToUtc("2026-07-15T10:30")?.toISOString()).toBe(
      "2026-07-15T07:30:00.000Z",
    );
    expect(nicosiaInputToUtc("2026-03-29T03:30")).toBeNull();
    expect(nicosiaInputToUtc("2026-02-30T10:00")).toBeNull();
  });
  it("hafta Pazartesi başlar; özel aralık en fazla 31 gündür", () => {
    expect(reportRange("week", new Date("2026-11-13T12:00:00Z"))).toEqual({
      from: "2026-11-09",
      to: "2026-11-13",
    });
    expect(validReportRange("2026-01-01", "2026-01-31")).toBe(true);
    expect(validReportRange("2026-01-01", "2026-02-01")).toBe(false);
    expect(validReportRange("2026-02-01", "2026-01-01")).toBe(false);
  });
});

describe("form ve CSV güvenliği", () => {
  it("geçersiz çalışma aralığını engeller", () => {
    expect(validWorkingHours("09:00", "18:00")).toBe(true);
    expect(validWorkingHours("18:00", "09:00")).toBe(false);
    expect(validWorkingHours("09:00", "09:00")).toBe(false);
    expect(validWorkingHours("25:00", "26:00")).toBe(false);
  });
  it("CSV formül hücrelerini etkisizleştirir ve tırnakları kaçırır", () => {
    expect(csvCell('=HYPERLINK("x")')).toBe('"\'=HYPERLINK(""x"")"');
    expect(
      dailyReportCsv([
        ["Gün", "Toplam"],
        ["2026-11-13", 0],
      ]),
    ).toBe("\uFEFFGün,Toplam\r\n2026-11-13,0");
  });
});
