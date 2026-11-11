import { describe, expect, it } from "vitest";
import { isTrustedSameOrigin } from "./bff-origin";

const url = "http://127.0.0.1:3100/app/api/oturum";

function req(headers: Record<string, string>, href = url): Request {
  return new Request(href, { method: "POST", headers });
}

describe("isTrustedSameOrigin", () => {
  it("allows same-origin fetch metadata", () => {
    expect(
      isTrustedSameOrigin(
        req({ origin: "http://127.0.0.1:3100", "sec-fetch-site": "same-origin" }),
      ),
    ).toBe(true);
  });

  it("allows sec-fetch-site none without Origin (same-origin navigation)", () => {
    expect(isTrustedSameOrigin(req({ "sec-fetch-site": "none" }))).toBe(true);
  });

  it("allows Origin that matches Host even if request.url origin differs", () => {
    expect(
      isTrustedSameOrigin(
        req(
          { origin: "http://127.0.0.1:3100", host: "127.0.0.1:3100" },
          "http://localhost:3100/app/api/oturum",
        ),
      ),
    ).toBe(true);
  });

  it("prefers Host over spoofed X-Forwarded-Host", () => {
    expect(
      isTrustedSameOrigin(
        req({
          origin: "https://evil.test",
          host: "127.0.0.1:3100",
          "x-forwarded-host": "evil.test",
        }),
      ),
    ).toBe(false);
    expect(
      isTrustedSameOrigin(
        req({
          origin: "http://127.0.0.1:3100",
          host: "127.0.0.1:3100",
          "x-forwarded-host": "evil.test",
        }),
      ),
    ).toBe(true);
  });

  it("uses X-Forwarded-Host only when TRUST_FORWARDED_HOST is true", () => {
    const prev = process.env.TRUST_FORWARDED_HOST;
    delete process.env.TRUST_FORWARDED_HOST;
    expect(
      isTrustedSameOrigin(
        req(
          { origin: "https://evil.test", "x-forwarded-host": "evil.test" },
          "http://127.0.0.1:3100/app/api/oturum",
        ),
      ),
    ).toBe(false);
    process.env.TRUST_FORWARDED_HOST = "true";
    expect(
      isTrustedSameOrigin(
        req(
          { origin: "http://app.test", "x-forwarded-host": "app.test" },
          "http://127.0.0.1:3100/app/api/oturum",
        ),
      ),
    ).toBe(true);
    if (prev === undefined) delete process.env.TRUST_FORWARDED_HOST;
    else process.env.TRUST_FORWARDED_HOST = prev;
  });

  it("rejects cross-site and mismatched Origin", () => {
    expect(
      isTrustedSameOrigin(
        req({ origin: "https://evil.test", "sec-fetch-site": "cross-site" }),
      ),
    ).toBe(false);
    expect(
      isTrustedSameOrigin(
        req({ origin: "https://evil.test", host: "127.0.0.1:3100" }),
      ),
    ).toBe(false);
    expect(isTrustedSameOrigin(req({ "sec-fetch-site": "same-site" }))).toBe(false);
  });

  it("rejects requests with neither Origin nor Sec-Fetch-Site", () => {
    expect(isTrustedSameOrigin(req({}))).toBe(false);
  });
});
