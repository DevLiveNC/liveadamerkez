import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(fileURLToPath(new URL("../app/app/isletme/", import.meta.url)));

describe("işletme form hata metni", () => {
  it("hizmetler err.message göstermez", () => {
    const src = readFileSync(path.join(appDir, "hizmetler/view.tsx"), "utf8");
    expect(src).not.toMatch(/err\.message/);
    expect(src).toContain("isletmeApp.formError");
  });

  it("profil onHours hataları yakalar", () => {
    const src = readFileSync(path.join(appDir, "profil/view.tsx"), "utf8");
    expect(src).toMatch(/async function onHours[\s\S]*try \{[\s\S]*createAvailability[\s\S]*catch \{/);
    expect(src).toContain("isletmeApp.formError");
    expect(src).toContain("hoursError");
  });
});
