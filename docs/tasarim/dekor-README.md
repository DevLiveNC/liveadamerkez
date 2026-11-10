# Ada Merkez — dekor

Tek kaynak: `packages/ui/dekor/`. Runtime: React `Dekor` (`@ada-merkez/ui`). `dekor.js` sayfaya yüklenmez. CSS Next import: `@ada-merkez/ui/dekor.css`. Sözleşme: `docs/APP-SOZLESME.md`. Harita: `packages/ui/dekor/YERLESIM.md`.

Dalga, kum ve köpük **bitmap değil**: `svg/dalga-kenar.svg`, `svg/kopuk.svg`, `svg/kum-grain.svg`, `svg/ayak-izi.svg`. `dalga`, `kopuk-serit`, `kum-tepecigi`, `ayak-izi`, `kemer` WebP **kullanılmaz**.

Yeşillik ve kabuklar küçük, 2× keskin (`renderedWidth * DPR ≤ naturalWidth`). CSS uzun kenarı 80–180 px ve master’ın yarısından küçük.

**Opaklık:** sprite ve çizgi 0.85–1. Kum grain bir dokudur (0.16); eski 0.12–0.35 öneri tablosu geçersizdir. Metnin, kartın, düğmenin, Kabuki veya cihaz kuklasının arkasına konmaz.

## Etkinleştirme

```tsx
import { Dekor } from "@ada-merkez/ui";
import "@ada-merkez/ui/dekor.css";

<html data-dekor="landing">
  <body data-dekor="landing">
    <Dekor scene="landing" slot="hero" />
```

Geçerli sahneler: `landing`, `app-giris`, `app-musteri`, `app-isletme`, `app-yonetici`.

## Kullanılan WebP

`palmiye`, `zeytin-dali`, `begonvil`, `yaprak-kumesi`, `tarak-kabuk`, `sarmal-kabuk`, `deniz-yildizi`, `cakil` — masaüstü 2× + `-1x.webp` (1×), `-m.webp` mobil 1×.

## Paralaks ve mobil

- Hız 0.03–0.10, sapma ±16 px. `prefers-reduced-motion: reduce` kapalı.
- `will-change: transform` yalnızca kaydırma sırasında.
- Mobil: desk-only sprite DOM’a girmez (`matchMedia`); CSS gizleme yok.
- Landing hero alt boşluğu masaüstü 176 px, mobil 140 px.

## 1× / 2×

`dekorDisplaySize` CSS genişliğini `floor(width2x / 2)` ile sınırlar. Masaüstü `srcset`: `-1x.webp 1x, .webp 2x`. Mobil: `-m.webp 1x, .webp 2x`. `img src` 1× dosyadır.
