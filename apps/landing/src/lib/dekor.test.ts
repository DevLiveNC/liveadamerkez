import { describe, expect, it } from "vitest";
import { dekorForPath } from "./dekor";

describe("dekorForPath", () => {
  it("keeps marketing and form pages on landing", () => {
    expect(dekorForPath("/")).toBe("landing");
    expect(dekorForPath("/basvuru")).toBe("landing");
    expect(dekorForPath("/bekleme-listesi")).toBe("landing");
    expect(dekorForPath("/apple")).toBe("landing");
  });

  it("maps /app scenes without confusing isletme and isletmeler", () => {
    expect(dekorForPath("/app/giris")).toBe("app-giris");
    expect(dekorForPath("/app")).toBe("app-musteri");
    expect(dekorForPath("/app/randevular")).toBe("app-musteri");
    expect(dekorForPath("/app/isletmeler/1")).toBe("app-musteri");
    expect(dekorForPath("/app/isletme")).toBe("app-isletme");
    expect(dekorForPath("/app/yonetim")).toBe("app-yonetici");
  });
});
