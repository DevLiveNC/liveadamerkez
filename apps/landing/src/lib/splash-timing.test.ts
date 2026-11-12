import { describe, expect, it } from "vitest";
import {
  ONBOARDING_KEY,
  SPLASH_MIN_READY_MS,
  SPLASH_REDUCED_MS,
  SPLASH_SESSION_KEY,
  SPLASH_SETTLE_MS,
  isPwaLaunch,
  shouldPlaySplash,
  shouldShowOnboarding,
  splashHandoffDelay,
} from "./splash-timing";

describe("splash timing", () => {
  it("plays only on PWA launch once per session", () => {
    expect(isPwaLaunch("?source=pwa")).toBe(true);
    expect(isPwaLaunch("")).toBe(false);
    expect(shouldPlaySplash({ getItem: () => null }, "?source=pwa")).toBe(true);
    expect(shouldPlaySplash({ getItem: (k) => (k === SPLASH_SESSION_KEY ? "1" : null) }, "?source=pwa")).toBe(
      false,
    );
    expect(shouldPlaySplash({ getItem: () => null }, "")).toBe(false);
  });

  it("holds to settle unless data is ready after 1.4s, reduced-motion is 200ms", () => {
    expect(splashHandoffDelay({ reduced: true, readyAt: 0, now: 0 })).toBe(SPLASH_REDUCED_MS);
    expect(splashHandoffDelay({ reduced: false, readyAt: 0, now: 0 })).toBe(SPLASH_SETTLE_MS);
    expect(splashHandoffDelay({ reduced: false, readyAt: 0, now: SPLASH_MIN_READY_MS })).toBe(0);
    expect(shouldShowOnboarding({ getItem: () => null })).toBe(true);
    expect(shouldShowOnboarding({ getItem: (k) => (k === ONBOARDING_KEY ? "1" : null) })).toBe(false);
  });
});
