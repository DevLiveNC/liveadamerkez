import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const cssDir = path.resolve(fileURLToPath(new URL("../styles/", import.meta.url)));
const landingV2 = readFileSync(path.join(cssDir, "landing-v2.css"), "utf8");
const panelV2 = readFileSync(path.join(cssDir, "panel-v2.css"), "utf8");

describe("landing-v2 panel sızıntısı", () => {
  it(".am-btn, .am-kicker, .am-icon yalnız body.landing altında", () => {
    const selectors = [...landingV2.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim());
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      if (selector.includes(".am-btn") || selector.includes(".am-kicker") || selector.includes(".am-icon")) {
        expect(selector).toContain("body.landing");
      }
    }
  });

  it("panel-v2 kendi .am-btn / .am-kicker / .am-icon kurallarını tutar", () => {
    expect(panelV2).toMatch(/(^|\n)\.am-btn\s*\{/);
    expect(panelV2).toMatch(/(^|\n)\.am-kicker\s*\{/);
    expect(panelV2).toMatch(/(^|\n)\.am-icon\s*\{/);
  });
});
