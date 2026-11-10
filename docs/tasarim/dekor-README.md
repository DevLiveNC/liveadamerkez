# Ada Merkez — dekor

Tek kaynak: `packages/ui/dekor/` (Tasarım `ada-dekor3` QA: `dekor.css`, `dekor.js`, `YERLESIM.md`, `svg/`, `webp/`). Landing kopyası: `apps/landing/public/assets/dekor/`. Sözleşme: `docs/APP-SOZLESME.md`. Harita: `packages/ui/dekor/YERLESIM.md`.

Dalga, kum ve köpük **bitmap değil**: `svg/dalga-kenar.svg`, `svg/kopuk.svg`, `svg/kum-grain.svg`, `svg/ayak-izi.svg`. `dalga`, `kopuk-serit`, `kum-tepecigi`, `ayak-izi`, `kemer` WebP **kullanılmaz**.

Yeşillik ve kabuklar küçük, 2× keskin (`renderedWidth * DPR ≤ naturalWidth`). CSS uzun kenarı 80–180 px ve master’ın yarısından küçük.

**Opaklık:** sprite ve çizgi 0.85–1. Kum grain bir dokudur (0.16); eski 0.12–0.35 öneri tablosu geçersizdir. Metnin, kartın, düğmenin, Kabuki veya cihaz kuklasının arkasına konmaz.

## Etkinleştirme

```html
<html lang="tr" data-dekor="landing">
  <link rel="stylesheet" href="/assets/dekor/dekor.css">
  <body data-dekor="landing">
    <script src="/assets/dekor/dekor.js" defer></script>
  </body>
</html>
```

Geçerli sahneler: `landing`, `app-giris`, `app-musteri`, `app-isletme`, `app-yonetici`. Landing şu an `data-dekor="landing"`. /app sahneleri panel PR’larında bağlanır.

`dekor.js` yerleşimi çalışma anında enjekte eder.

## Kullanılan WebP (11 Kasım 2026)

`palmiye`, `zeytin-dali`, `begonvil`, `yaprak-kumesi`, `tarak-kabuk`, `sarmal-kabuk`, `deniz-yildizi`, `cakil` — masaüstü 2×, `-m.webp` mobil 1×.

| Set | Toplam |
| --- | --- |
| Masaüstü 2× (8 sprite) | ~88 KB |
| Mobil 1× (8 dosya; sayfada 3–6 yüklenir) | ~26 KB |
| SVG | vektör, çok küçük |

## Paralaks ve mobil

- Hız 0.03–0.10, sapma ±16 px. `prefers-reduced-motion: reduce` kapalı.
- `will-change: transform` yalnızca kaydırma sırasında.
- Mobil (max-width 860 px): `.am-dekor--desk-only` gizlenir; zeytin de gizlenir; daha az eleman.
- Landing hero alt boşluğu masaüstü 176 px, mobil 140 px (sprite telefon/Kabuki/CTA altında). Negatif `left`/`right` yok.

## 1× / 2×

`dekorDisplaySize` (`@ada-merkez/ui`) CSS genişliğini `floor(width2x / 2)` ile sınırlar. Mobil `<source>` `1x` (`-m.webp`) ve `2x` (masaüstü WebP) sunar; masaüstü kaynağı 2× dosyadır.
