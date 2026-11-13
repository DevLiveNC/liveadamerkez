import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const appDir = path.resolve(
  fileURLToPath(new URL("../app/app/isletme/", import.meta.url)),
);

describe("işletme form hata davranışı", () => {
  it("hizmetler ham hata göstermez; ortak, yakalanan mutasyon kullanır", () => {
    const src = readFileSync(path.join(appDir, "hizmetler/view.tsx"), "utf8");
    expect(src).not.toMatch(/err\.message/);
    expect(src).toContain("usePanelMutation");
    expect(src).toContain("mutation.run");
    expect(src).toContain("PanelFeedback error={mutation.error}");
    expect(src).toContain("disabled={mutation.busy || !online}");
  });

  it("profil saat hatalarını ortak mutasyonla görünür durumda tutar", () => {
    const src = readFileSync(path.join(appDir, "profil/view.tsx"), "utf8");
    expect(src).toMatch(
      /async function onHours[\s\S]*hoursMutation\.run[\s\S]*createAvailability/,
    );
    expect(src).not.toMatch(/err\.message/);
    expect(src).toContain("error={hoursError || hoursMutation.error}");
    expect(src).toContain("validWorkingHours");
    expect(src).toContain("field.value = saved?.");
  });
});
