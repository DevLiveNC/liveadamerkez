import { afterEach, describe, expect, it, vi } from "vitest";
import { encodeConsentCookie } from "@ada-merkez/shared";
import { dispatchServerEvents, serverTrackingConsent } from "./analytics";

describe("CAPI respects consent cookie", () => {
  const prev = {
    META_PIXEL_ID: process.env.META_PIXEL_ID,
    META_CAPI_ACCESS_TOKEN: process.env.META_CAPI_ACCESS_TOKEN,
    GA4_MEASUREMENT_ID: process.env.GA4_MEASUREMENT_ID,
    GA4_API_SECRET: process.env.GA4_API_SECRET,
  };

  afterEach(() => {
    process.env.META_PIXEL_ID = prev.META_PIXEL_ID;
    process.env.META_CAPI_ACCESS_TOKEN = prev.META_CAPI_ACCESS_TOKEN;
    process.env.GA4_MEASUREMENT_ID = prev.GA4_MEASUREMENT_ID;
    process.env.GA4_API_SECRET = prev.GA4_API_SECRET;
    vi.unstubAllGlobals();
  });

  it("does not send CAPI or GA4 without the consent cookie even if body flags would have been true", async () => {
    process.env.META_PIXEL_ID = "pixel";
    process.env.META_CAPI_ACCESS_TOKEN = "token";
    process.env.GA4_MEASUREMENT_ID = "G-TEST";
    process.env.GA4_API_SECRET = "secret";
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      async (input: RequestInfo | URL) => {
        urls.push(String(input));
        return new Response("{}", { status: 200 });
      },
    );
    await dispatchServerEvents({
      eventName: "waitlist_submit",
      eventId: "11111111-1111-4111-8111-111111111111",
      params: { event_id: "11111111-1111-4111-8111-111111111111" },
      email: "a@example.com",
      phone: "+905331112233",
      request: new Request("http://api.test/v1/events", {
        method: "POST",
        headers: { "content-type": "application/json" },
      }),
    });
    expect(urls.some((url) => url.includes("graph.facebook.com"))).toBe(false);
    expect(urls.some((url) => url.includes("google-analytics.com"))).toBe(false);
  });

  it("sends CAPI only with marketing cookie and GA4 only with analytics cookie", async () => {
    process.env.META_PIXEL_ID = "pixel";
    process.env.META_CAPI_ACCESS_TOKEN = "token";
    process.env.GA4_MEASUREMENT_ID = "G-TEST";
    process.env.GA4_API_SECRET = "secret";
    const urls: string[] = [];
    vi.stubGlobal(
      "fetch",
      async (input: RequestInfo | URL) => {
        urls.push(String(input));
        return new Response("{}", { status: 200 });
      },
    );
    const request = new Request("http://api.test/v1/events", {
      method: "POST",
      headers: {
        cookie: encodeConsentCookie({ analytics: false, marketing: true, decided: true }),
      },
    });
    expect(serverTrackingConsent(request)).toEqual({
      analytics: false,
      marketing: true,
      decided: true,
    });
    await dispatchServerEvents({
      eventName: "waitlist_submit",
      eventId: "11111111-1111-4111-8111-111111111111",
      params: { event_id: "11111111-1111-4111-8111-111111111111" },
      email: "a@example.com",
      phone: "+905331112233",
      request,
    });
    expect(urls.some((url) => url.includes("graph.facebook.com"))).toBe(true);
    expect(urls.some((url) => url.includes("google-analytics.com"))).toBe(false);
  });
});
