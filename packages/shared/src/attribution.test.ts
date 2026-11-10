import { describe, expect, it } from "vitest";
import {
  ATTRIBUTION_WINDOW_DAYS,
  mergeAttribution,
  sanitizeAttrValue,
  touchFromSearchParams,
} from "./attribution.js";

describe("attribution sanitization and first/last touch", () => {
  it("normalizes to lowercase ascii underscore and drops junk", () => {
    expect(sanitizeAttrValue("Instagram")).toBe("instagram");
    expect(sanitizeAttrValue("evre-a teaser!")).toBe("evre_a_teaser");
    expect(sanitizeAttrValue("   ")).toBeNull();
    expect(sanitizeAttrValue("🙂")).toBeNull();
  });

  it("reads UTM and ref from search params", () => {
    const touch = touchFromSearchParams(
      new URLSearchParams(
        "utm_source=instagram&utm_medium=organic&utm_campaign=evre_a_teaser&utm_content=gun1_duyuru&ref=AMX123",
      ),
    );
    expect(touch).toMatchObject({
      source: "instagram",
      medium: "organic",
      campaign: "evre_a_teaser",
      content: "gun1_duyuru",
      ref: "amx123",
    });
  });

  it("keeps first touch and updates last touch on a new UTM visit", () => {
    const t0 = new Date("2026-11-01T10:00:00.000Z");
    const first = touchFromSearchParams(new URLSearchParams("utm_source=instagram"), t0);
    const afterFirst = mergeAttribution(null, first, t0);
    const t1 = new Date("2026-11-10T10:00:00.000Z");
    const second = touchFromSearchParams(new URLSearchParams("utm_source=google"), t1);
    const merged = mergeAttribution(afterFirst, second, t1);
    expect(merged.first?.source).toBe("instagram");
    expect(merged.last?.source).toBe("google");
  });

  it("does not forget first touch on a parameter-less visit inside the window", () => {
    const t0 = new Date("2026-11-01T10:00:00.000Z");
    const first = touchFromSearchParams(new URLSearchParams("utm_source=qr"), t0);
    const stored = mergeAttribution(null, first, t0);
    const later = mergeAttribution(stored, null, new Date("2026-11-15T10:00:00.000Z"));
    expect(later.first?.source).toBe("qr");
    expect(ATTRIBUTION_WINDOW_DAYS).toBe(30);
  });

  it("resets first touch after the window expires when a new UTM arrives", () => {
    const t0 = new Date("2026-10-01T10:00:00.000Z");
    const first = touchFromSearchParams(new URLSearchParams("utm_source=tiktok"), t0);
    const stored = mergeAttribution(null, first, t0);
    const t1 = new Date("2026-11-10T10:00:00.000Z");
    const next = touchFromSearchParams(new URLSearchParams("utm_source=whatsapp"), t1);
    const merged = mergeAttribution(stored, next, t1);
    expect(merged.first?.source).toBe("whatsapp");
    expect(merged.last?.source).toBe("whatsapp");
  });
});
