export const MOTION_DURATION_S = {
  fast: 0.12,
  base: 0.18,
  medium: 0.24,
  slow: 0.32,
} as const;

export const MOTION_EASE = {
  out: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: [0.34, 1.56, 0.64, 1] as const,
  press: [0.3, 0, 0.7, 1] as const,
};

export const MOTION_TRANSITION_PRESS = {
  duration: MOTION_DURATION_S.fast,
  ease: MOTION_EASE.press,
} as const;

export const MOTION_TRANSITION_BASE = {
  duration: MOTION_DURATION_S.base,
  ease: MOTION_EASE.out,
} as const;

export const MOTION_TRANSITION_PAGE = {
  duration: MOTION_DURATION_S.medium,
  ease: MOTION_EASE.inOut,
} as const;

function parseCssTime(raw: string, fallbackSeconds: number): number {
  const value = raw.trim();
  if (!value) return fallbackSeconds;
  if (value.endsWith("ms")) {
    const ms = Number.parseFloat(value);
    return Number.isFinite(ms) ? ms / 1000 : fallbackSeconds;
  }
  if (value.endsWith("s")) {
    const seconds = Number.parseFloat(value);
    return Number.isFinite(seconds) ? seconds : fallbackSeconds;
  }
  return fallbackSeconds;
}

/** Reads a --motion-* CSS variable so JS stays in lockstep with the theme file. */
export function readMotionSeconds(
  token: "--motion-duration-fast" | "--motion-duration-base" | "--motion-duration-medium" | "--motion-duration-slow",
  fallbackSeconds: number,
): number {
  if (typeof window === "undefined") return fallbackSeconds;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(token);
  return parseCssTime(raw, fallbackSeconds);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
