import { describe, expect, it } from "vitest";
import {
  APP_MANIFEST_SCOPE,
  APP_START_URL,
  APP_SW_SCOPE,
  PWA_STANDALONE_REDIRECT_SCRIPT,
  manifestScopeCoversPath,
} from "./pwa";

describe("manifestScopeCoversPath", () => {
  it("documents that scope /app/ does not cover the /app root", () => {
    expect(manifestScopeCoversPath("/app/", "/app")).toBe(false);
    expect(manifestScopeCoversPath("/app/", "/app/")).toBe(true);
    expect(manifestScopeCoversPath("/app/", "/app/randevular")).toBe(true);
  });

  it("covers /app root, trailing slash, and nested routes when scope is /app", () => {
    expect(manifestScopeCoversPath(APP_MANIFEST_SCOPE, "/app")).toBe(true);
    expect(manifestScopeCoversPath(APP_MANIFEST_SCOPE, "/app/")).toBe(true);
    expect(manifestScopeCoversPath(APP_MANIFEST_SCOPE, "/app/randevular")).toBe(true);
    expect(manifestScopeCoversPath(APP_MANIFEST_SCOPE, "/apple")).toBe(false);
    expect(manifestScopeCoversPath(APP_MANIFEST_SCOPE, "/")).toBe(false);
  });

  it("keeps start_url inside scope (query ignored)", () => {
    const startPath = APP_START_URL.split("?")[0];
    expect(startPath).toBe("/app");
    expect(manifestScopeCoversPath(APP_MANIFEST_SCOPE, startPath)).toBe(true);
    expect(APP_SW_SCOPE).toBe(APP_MANIFEST_SCOPE);
  });
});

describe("PWA_STANDALONE_REDIRECT_SCRIPT", () => {
  it("redirects standalone launches to /app before paint", () => {
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain('display-mode: standalone');
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain("navigator.standalone===true");
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain('location.replace("/app")');
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain("visibility");
  });
});
