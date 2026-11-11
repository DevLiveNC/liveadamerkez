import { describe, expect, it } from "vitest";
import { cta, ctaEn, isletmeApp, later } from "./index.js";

describe("kontrol takip kopyası", () => {
  it("erken erişim CTA TR/EN", () => {
    expect(cta.customer).toBe("Erken erişim yakında");
    expect(ctaEn.customer).toBe("Early access soon");
  });

  it("işletme form hataları kopyadan gelir", () => {
    expect(isletmeApp.formError).toBe("Kayıt kaydedilemedi. Alanları kontrol edip tekrar deneyin.");
  });

  it("Ada Kampüs öğrenci indirimi metnini değiştirmez", () => {
    expect(later.campusTitle).toBe("Öğrenci indirimi");
    expect(later.campusBody).toBe("Ada Kampüs kimliğiyle indirim, abartısız sonraki adım.");
  });
});
