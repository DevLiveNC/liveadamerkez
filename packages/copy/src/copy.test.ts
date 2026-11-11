import { describe, expect, it } from "vitest";
import { cta, ctaEn, isletmeApp, later, laterEn } from "./index.js";

describe("kontrol takip kopyası", () => {
  it("erken erişim CTA TR/EN", () => {
    expect(cta.customer).toBe("Erken erişim yakında");
    expect(ctaEn.customer).toBe("Early access soon");
  });

  it("işletme form hataları kopyadan gelir", () => {
    expect(isletmeApp.formError).toBe("Kayıt kaydedilemedi. Alanları kontrol edip tekrar deneyin.");
  });

  it("Ada Kampüs öğrenci avantajları TR/EN", () => {
    expect(later.campusTitle).toBe("Öğrenci avantajları");
    expect(later.campusBody).toBe("Ada Kampüs kimliğinle öğrencilere özel fırsatlar yakında.");
    expect(later.campusBody).not.toMatch(/abartısız sonraki adım/);
    expect(laterEn.campusTitle).toBe("Student perks");
    expect(laterEn.campusBody).toBe("Exclusive offers for Ada Kampüs members, coming soon.");
  });
});
