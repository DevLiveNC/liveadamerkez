import { describe, expect, it } from "vitest";
import { cta, ctaEn, isletmeApp, later, laterEn } from "./index.js";

describe("kontrol takip kopyası", () => {
  it("ana CTA Uygulamayı aç / Kendi işletmeni ekle", () => {
    expect(cta.openApp).toBe("Uygulamayı aç");
    expect(cta.business).toBe("Kendi işletmeni ekle");
    expect(ctaEn.openApp).toBe("Open the app");
    expect(ctaEn.business).toBe("Add your business");
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
