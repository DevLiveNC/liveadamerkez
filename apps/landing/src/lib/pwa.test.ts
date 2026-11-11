import { describe, expect, it, vi } from "vitest";
import {
  APP_MANIFEST_SCOPE,
  APP_START_URL,
  APP_SW_SCOPE,
  PWA_REDIRECT_VISIBILITY_MS,
  PWA_STANDALONE_REDIRECT_SCRIPT,
  isLegacyAppServiceWorkerScope,
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

describe("isLegacyAppServiceWorkerScope", () => {
  it("matches only the trailing-slash /app/ registration", () => {
    expect(isLegacyAppServiceWorkerScope("https://ada.example/app/")).toBe(true);
    expect(isLegacyAppServiceWorkerScope("https://ada.example/app")).toBe(false);
    expect(isLegacyAppServiceWorkerScope("https://ada.example/")).toBe(false);
    expect(isLegacyAppServiceWorkerScope("not a url")).toBe(false);
  });
});

function runStandaloneScript(env: {
  pathname: string;
  standalone: boolean;
  replace: () => void;
}): { visibility: string; timeoutMs: number | null } {
  const documentElement = { style: { visibility: "" } };
  let timeoutMs: number | null = null;
  const setTimeoutMock = ((fn: () => void, ms?: number) => {
    timeoutMs = ms ?? 0;
    return 0;
  }) as unknown as typeof setTimeout;
  const run = new Function(
    "window",
    "document",
    "location",
    "navigator",
    "setTimeout",
    PWA_STANDALONE_REDIRECT_SCRIPT,
  );
  run(
    { matchMedia: () => ({ matches: env.standalone }) },
    { documentElement },
    { pathname: env.pathname, replace: env.replace },
    { standalone: env.standalone },
    setTimeoutMock,
  );
  return { visibility: documentElement.style.visibility, timeoutMs };
}

describe("PWA_STANDALONE_REDIRECT_SCRIPT", () => {
  it("redirects standalone home launches to /app before paint", () => {
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain('display-mode: standalone');
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain("navigator.standalone===true");
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain('location.replace("/app")');
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain('p!=="/"');
    expect(PWA_STANDALONE_REDIRECT_SCRIPT).toContain(String(PWA_REDIRECT_VISIBILITY_MS));
    const replace = vi.fn();
    const result = runStandaloneScript({ pathname: "/", standalone: true, replace });
    expect(replace).toHaveBeenCalledWith("/app");
    expect(result.timeoutMs).toBe(PWA_REDIRECT_VISIBILITY_MS);
    expect(result.visibility).toBe("hidden");
  });

  it("does not redirect legal or other non-home paths", () => {
    const replace = vi.fn();
    for (const pathname of ["/yasal/gizlilik", "/yasal/kvkk", "/yasal/aydinlatma", "/q/afis"]) {
      const result = runStandaloneScript({ pathname, standalone: true, replace });
      expect(result.visibility).toBe("");
    }
    expect(replace).not.toHaveBeenCalled();
  });

  it("restores visibility if location.replace throws", () => {
    const replace = () => {
      throw new Error("replace-blocked");
    };
    const result = runStandaloneScript({ pathname: "/", standalone: true, replace });
    expect(result.visibility).toBe("");
  });
});
