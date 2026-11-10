import { describe, expect, it } from "vitest";
import {
  consentFromCookieHeader,
  encodeConsentCookie,
  parseTrackingConsentJson,
} from "./consent-cookie.js";

describe("tracking consent cookie", () => {
  it("defaults to denied and requires both flags", () => {
    expect(parseTrackingConsentJson(null)).toEqual({
      analytics: false,
      marketing: false,
      decided: false,
    });
    expect(parseTrackingConsentJson("{not json")).toEqual({
      analytics: false,
      marketing: false,
      decided: false,
    });
  });

  it("reads am_consent from Cookie header", () => {
    const header = encodeConsentCookie({ analytics: true, marketing: false, decided: true });
    expect(consentFromCookieHeader(`foo=1; ${header}; bar=2`)).toEqual({
      analytics: true,
      marketing: false,
      decided: true,
    });
    expect(consentFromCookieHeader("x-forwarded-for=nope")).toEqual({
      analytics: false,
      marketing: false,
      decided: false,
    });
  });
});
