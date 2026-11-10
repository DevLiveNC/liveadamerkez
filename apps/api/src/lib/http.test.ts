import { describe, expect, it } from "vitest";
import { clientIp, corsHeaders, parseOriginList } from "./http";

describe("CORS deny-by-default", () => {
  it("parses origin list", () => {
    expect(parseOriginList(" https://a.test,https://b.test ")).toEqual([
      "https://a.test",
      "https://b.test",
    ]);
    expect(parseOriginList("")).toEqual([]);
    expect(parseOriginList(undefined)).toEqual([]);
  });

  it("does not reflect origin when CORS_ORIGINS is empty", () => {
    const prev = process.env.CORS_ORIGINS;
    process.env.CORS_ORIGINS = "";
    const headers = corsHeaders(
      new Request("http://api.test/health", { headers: { origin: "https://evil.test" } }),
    );
    expect(headers["Access-Control-Allow-Origin"]).toBeUndefined();
    process.env.CORS_ORIGINS = prev;
  });

  it("allows only listed origins", () => {
    const prev = process.env.CORS_ORIGINS;
    process.env.CORS_ORIGINS = "https://ada.test";
    const ok = corsHeaders(
      new Request("http://api.test/health", { headers: { origin: "https://ada.test" } }),
    );
    expect(ok["Access-Control-Allow-Origin"]).toBe("https://ada.test");
    expect(ok["Access-Control-Allow-Credentials"]).toBe("true");
    const denied = corsHeaders(
      new Request("http://api.test/health", { headers: { origin: "https://evil.test" } }),
    );
    expect(denied["Access-Control-Allow-Origin"]).toBeUndefined();
    process.env.CORS_ORIGINS = prev;
  });
});

describe("trusted client IP", () => {
  it("uses x-real-ip and ignores x-forwarded-for", () => {
    const spoofed = new Request("http://api.test/health", {
      headers: {
        "x-forwarded-for": "1.2.3.4, 10.0.0.1",
        "x-real-ip": "198.51.100.9",
      },
    });
    expect(clientIp(spoofed)).toBe("198.51.100.9");

    const onlyForwarded = new Request("http://api.test/health", {
      headers: { "x-forwarded-for": "1.2.3.4" },
    });
    expect(clientIp(onlyForwarded)).toBe("0.0.0.0");
  });
});
