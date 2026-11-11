import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const dir = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(dir, "tokens-v3.css"), "utf8");
const json = JSON.parse(readFileSync(join(dir, "tokens-v3.json"), "utf8")) as {
  $meta?: { surum?: string };
  anlam?: Record<string, string>;
  renk?: { lacivert?: { "800"?: string }; mercan?: { "400"?: string }; hellim?: { "50"?: string } };
};

describe("tokens-v3 palette source", () => {
  it("keeps official am3 palette, semantic, and v2 names", () => {
    const required = [
      "--am3-bg",
      "--am3-surface",
      "--am3-brand",
      "--am3-accent",
      "--am3-hellim-50",
      "--am3-lacivert-800",
      "--am3-mercan-400",
      "--am3-ease-out",
      "--am3-ease-spring",
      "--am3-ease-inout",
      "--color-brand",
      "--color-surface",
      "--color-background",
      "--color-accent-coral",
      "--color-accent-teal",
      "--color-accent-aegean",
      "--color-accent-sand",
      "--color-accent-live",
      "--motion-duration-fast",
      "--motion-duration-base",
      "--motion-duration-medium",
      "--motion-duration-slow",
      "--motion-ease-out",
      "--motion-ease-in-out",
      "--motion-ease-press",
    ];
    for (const token of required) {
      expect(css).toContain(`${token}:`);
    }
  });

  it("bridges existing --am-* tokens to the semantic layer", () => {
    expect(css).toContain("--am-color-surface: var(--color-surface)");
    expect(css).toContain("--am-color-background: var(--color-background)");
    expect(css).toContain("--am-color-primary: var(--color-brand)");
    expect(css).toContain("--am-color-accent: var(--color-accent-coral)");
    expect(css).toContain("--am-brand-sand: var(--am3-hellim-50)");
    expect(css).toContain("--am-motion-fast: var(--motion-duration-fast)");
    expect(css).toContain("--am-ease-out: var(--motion-ease-out)");
    expect(css).toContain("--am-dur-fast: var(--motion-duration-fast)");
  });

  it("collapses motion durations when reduced motion is preferred", () => {
    expect(css).toMatch(/prefers-reduced-motion:\s*reduce/);
    expect(css).toContain("--motion-duration-fast: 0.01ms");
  });

  it("matches Faz A tokens.json semantic values", () => {
    expect(json.$meta?.surum).toBe("3.0.0");
    expect(json.anlam?.bg).toMatch(/^#FFFBF2$/i);
    expect(json.anlam?.surface).toMatch(/^#FFFFFF$/i);
    expect(json.anlam?.brand).toMatch(/^#0F2C44$/i);
    expect(json.anlam?.accent).toMatch(/^#E4572E$/i);
    expect(json.renk?.lacivert?.["800"]).toMatch(/^#0F2C44$/i);
    expect(json.renk?.hellim?.["50"]).toMatch(/^#FFFBF2$/i);
    expect(css).toContain("--am3-bg: #FFFBF2");
    expect(css).toContain("url(\"/v3/desen/dalga.svg\")");
  });
});
