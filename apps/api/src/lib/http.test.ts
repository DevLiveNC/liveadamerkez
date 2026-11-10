import { describe, expect, it } from "vitest";
import { corsHeaders, parseOriginList } from "./http";

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
    const denied = corsHeaders(
      new Request("http://api.test/health", { headers: { origin: "https://evil.test" } }),
    );
    expect(denied["Access-Control-Allow-Origin"]).toBeUndefined();
    process.env.CORS_ORIGINS = prev;
  });
});
