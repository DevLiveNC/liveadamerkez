export const SPLASH_MIN_READY_MS = 1400;
export const SPLASH_SETTLE_MS = 2200;
export const SPLASH_HANDOFF_MS = 400;
export const SPLASH_MAX_MS = 6000;
export const SPLASH_REDUCED_MS = 200;
export const SPLASH_SESSION_KEY = "am_splash_v3";
export const ONBOARDING_KEY = "am_onboarding_v3";

export function isPwaLaunch(search = typeof window === "undefined" ? "" : window.location.search): boolean {
  if (search.includes("source=pwa")) return true;
  if (typeof window === "undefined") return false;
  if (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }
  return "standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function shouldPlaySplash(storage: Pick<Storage, "getItem"> | null, search?: string): boolean {
  if (!storage) return false;
  if (storage.getItem(SPLASH_SESSION_KEY)) return false;
  return isPwaLaunch(search);
}

export function shouldShowOnboarding(storage: Pick<Storage, "getItem"> | null): boolean {
  if (!storage) return false;
  return !storage.getItem(ONBOARDING_KEY);
}

export function splashHandoffDelay(opts: { reduced: boolean; readyAt: number; now: number }): number {
  if (opts.reduced) return SPLASH_REDUCED_MS;
  const elapsed = Math.max(0, opts.now - opts.readyAt);
  if (elapsed >= SPLASH_MAX_MS) return 0;
  const minHold = elapsed >= SPLASH_MIN_READY_MS ? SPLASH_MIN_READY_MS : SPLASH_SETTLE_MS;
  return Math.max(0, minHold - elapsed);
}
