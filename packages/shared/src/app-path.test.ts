import { describe, expect, it } from "vitest";
import {
  authPageUrl,
  isAppPath,
  loginUrl,
  parseAppRoleParam,
  parseAuthModeParam,
  readNextParam,
  safeAppPath,
} from "./app-path.js";

describe("safeAppPath", () => {
  it("allows /app and nested app paths", () => {
    expect(safeAppPath("/app")).toBe("/app");
    expect(safeAppPath("/app/randevular")).toBe("/app/randevular");
    expect(safeAppPath("/app/isletmeler/abc?gun=1")).toBe("/app/isletmeler/abc?gun=1");
  });

  it("rejects open redirects and lookalikes", () => {
    expect(safeAppPath("https://evil.test/app")).toBe("/app");
    expect(safeAppPath("//evil.test")).toBe("/app");
    expect(safeAppPath("/apple")).toBe("/app");
    expect(safeAppPath("/app/../etc")).toBe("/app");
    expect(safeAppPath("\\app")).toBe("/app");
    expect(safeAppPath("/app\\n")).toBe("/app");
    expect(safeAppPath("")).toBe("/app");
    expect(safeAppPath(null)).toBe("/app");
  });
});

describe("isAppPath", () => {
  it("matches /app and nested paths, not lookalikes", () => {
    expect(isAppPath("/app")).toBe(true);
    expect(isAppPath("/app/giris")).toBe(true);
    expect(isAppPath("/apple")).toBe(false);
    expect(isAppPath("/")).toBe(false);
  });
});

describe("readNextParam", () => {
  it("re-filters next on every read", () => {
    expect(readNextParam(new URLSearchParams("next=/app/hesap"))).toBe("/app/hesap");
    expect(readNextParam(new URLSearchParams("next=https://evil.test/app"))).toBe("/app");
    expect(readNextParam(new URLSearchParams("next=/apple"), "/app/randevular")).toBe("/app/randevular");
    expect(readNextParam(null)).toBe("/app");
  });
});

describe("loginUrl", () => {
  it("maps roles and register flag", () => {
    expect(loginUrl({ role: "business", register: true })).toBe("/app/giris?rol=isletme&kayit=1");
    expect(loginUrl({ role: "admin", register: true })).toBe("/app/giris?rol=yonetici");
    expect(loginUrl({ next: "https://evil.test", role: "customer" })).toBe("/app/giris");
    expect(loginUrl({ next: "/app/favoriler" })).toBe("/app/giris?next=%2Fapp%2Ffavoriler");
  });

  it("parses rol query", () => {
    expect(parseAppRoleParam("isletme")).toBe("business");
    expect(parseAppRoleParam("yonetici")).toBe("admin");
    expect(parseAppRoleParam("musteri")).toBe("customer");
    expect(parseAppRoleParam("nope")).toBe("customer");
  });

  it("parses mod and kayit, keeps next on auth URLs", () => {
    expect(parseAuthModeParam("kayit")).toBe("register");
    expect(parseAuthModeParam("giris", "1")).toBe("register");
    expect(parseAuthModeParam("giris")).toBe("login");
    expect(authPageUrl({ role: "admin", mode: "register", next: "/app/yonetim" })).toBe(
      "/app/giris?rol=yonetici&mod=kayit&next=%2Fapp%2Fyonetim",
    );
    expect(authPageUrl({ role: "business", mode: "register", next: "/app/isletme" })).toBe(
      "/app/giris?rol=isletme&mod=kayit&kayit=1&next=%2Fapp%2Fisletme",
    );
    expect(authPageUrl({ role: "customer", next: "https://evil.test" })).toBe("/app/giris");
  });
});
