import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { MOTION_DURATION_S, MOTION_EASE } from "./motion-tokens";

const landingSrc = dirname(fileURLToPath(import.meta.url));
const repoRoot = join(landingSrc, "../../../..");
const lazy = readFileSync(join(landingSrc, "../components/landing/LandingMotionLazy.tsx"), "utf8");
const scenes = readFileSync(join(landingSrc, "../components/landing/LandingScrollScenes.tsx"), "utf8");
const home = readFileSync(join(landingSrc, "../app/page.tsx"), "utf8");
const chrome = readFileSync(join(landingSrc, "../components/MarketingChrome.tsx"), "utf8");
const motionRoot = readFileSync(join(landingSrc, "../components/motion/MotionRoot.tsx"), "utf8");
const brandCss = readFileSync(join(repoRoot, "packages/brand/tokens-v3.css"), "utf8");

describe("motion infrastructure", () => {
  it("keeps JS duration tokens aligned with CSS seconds", () => {
    expect(MOTION_DURATION_S.fast).toBe(0.12);
    expect(MOTION_DURATION_S.base).toBe(0.18);
    expect(MOTION_DURATION_S.medium).toBe(0.24);
    expect(MOTION_DURATION_S.slow).toBe(0.32);
    expect(MOTION_EASE.out).toEqual([0.22, 1, 0.36, 1]);
    expect(MOTION_EASE.inOut).toEqual([0.65, 0, 0.35, 1]);
    expect(MOTION_EASE.spring).toEqual([0.34, 1.56, 0.64, 1]);
    expect(brandCss).toContain("--am3-ease-out");
    expect(brandCss).toContain("--motion-duration-base: 180ms");
  });

  it("loads GSAP only through a client dynamic import", () => {
    expect(home).not.toMatch(/LandingScrollScenes|from\s+["']gsap["']/);
    expect(home).not.toMatch(/from\s+["']@gsap\/react["']/);
    expect(chrome).toMatch(/LandingMotionLazy/);
    expect(lazy).toMatch(/next\/dynamic/);
    expect(lazy).toMatch(/ssr:\s*false/);
    expect(scenes).toMatch(/from\s+["']gsap["']/);
    expect(scenes).toMatch(/@gsap\/react/);
    expect(scenes).toMatch(/ScrollTrigger/);
    expect(scenes).toMatch(/prefers-reduced-motion/);
    expect(scenes).toMatch(/useGSAP/);
    expect(scenes).toMatch(/closest\("\.hero"\)/);
    expect(scenes).toMatch(/innerHeight/);
  });

  it("wraps the tree with LazyMotion and user reduced-motion", () => {
    expect(chrome).toMatch(/MotionRoot/);
    expect(motionRoot).toMatch(/LazyMotion/);
    expect(motionRoot).toMatch(/domAnimation/);
    expect(motionRoot).toMatch(/reducedMotion=["']user["']/);
  });
});
