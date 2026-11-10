# Ada Merkez dekor — yerleşim haritası (v3.3)

Tarih: 11 Kasım 2026 (Asia/Famagusta)

Kaynak dosyalar (tek kaynak):

| Dosya | Yol |
| --- | --- |
| CSS | `ui/landing/assets/dekor/dekor.css` |
| JS | `ui/landing/assets/dekor/dekor.js` |
| Bu harita | `ui/landing/assets/dekor/YERLESIM.md` |
| SVG | `ui/landing/assets/dekor/svg/` |
| WebP 2× / mobil 1× | `ui/landing/assets/dekor/webp/` |
| Master PNG (keskin, upscale yok) | `ui/landing/assets/dekor/png/` |

`ui/shared/dekor.css` yalnızca `@import` sarmalayıcısıdır; `ui/shared/dekor.js` kaynak dosyanın kopyasıdır (varlık yolu script konumundan çözülür). Yeni iş kaynak klasöründen yapılmalıdır.

## Dev entegrasyon

Sayfaya kaynak CSS ve JS’yi ekle; sahneyi `data-dekor` ile aç:

```html
<html lang="tr" data-dekor="app-isletme">
  <link rel="stylesheet" href="/yol/ui/landing/assets/dekor/dekor.css">
  …
  <body data-dekor="app-isletme">
    …
    <script src="/yol/ui/landing/assets/dekor/dekor.js" defer></script>
  </body>
</html>
```

Geçerli değerler (html veya body; ikisi de olur, JS eksik olanı tamamlar):

| `data-dekor` | Anlam | Tipik /app rota |
| --- | --- | --- |
| `landing` | Pazarlama landing | `/` |
| `app-giris` | Giriş, kayıt, bekleme listesi, işletme başvurusu | `/app/giris`, `/app/login`, formlar |
| `app-musteri` | Müşteri uygulaması (keşif, rezervasyon) | `/app/musteri/…` |
| `app-isletme` | İşletme paneli | `/app/isletme/…` |
| `app-yonetici` | Yönetici paneli | `/app/yonetici/…`, `/app/yonetim/…` |

`dekor.js` attribute yoksa sınıflardan / yoldan da tahmin eder (`body.landing`, `body.form-page`, URL’de `/musteri/`, `/isletme/`, `/yonetim/`). Üretimde attribute yazmak tercih edilir; tahmin yalnızca tasarım HTML’leri ve geçiş dönemi içindir.

Kurallar:

- Kullanılan PNG’ler: `palmiye`, `zeytin-dali`, `begonvil`, `yaprak-kumesi`, `tarak-kabuk`, `sarmal-kabuk`, `deniz-yildizi`, `cakil`. CSS uzun kenarı 80–180 px ve **master’ın yarısından küçük**; 2× WebP master’dan küçültülür, **upscale yok**.
- `dalga`, `kopuk-serit`, `kum-tepecigi`, `ayak-izi`, `kemer` PNG **kullanılmaz**. Yerine `svg/dalga-kenar.svg`, `svg/kopuk.svg`, `svg/kum-grain.svg`, `svg/ayak-izi.svg` (dalga çizgisi 1.5–2 px).
- Sprite ve çizgi opaklığı 0.85–1. Kum grain bir dokudur (seyrek nokta, düşük opaklık); metni kirletmemek için 0.16’da tutulur.
- Yerleşim: kenar ve bölüm geçişi. Metin, kart, düğme, Kabuki veya cihaz kuklasının arkasına konmaz.
- `pointer-events: none`, `aria-hidden="true"`, `alt=""`.
- `<picture>` + mobil `-m.webp` (1×). Hero spriteları `fetchpriority="low"`; diğerleri `loading="lazy"`. `width` / `height` verilir (CLS yok).
- Paralaks: `translate3d` + rAF, hız 0.03–0.10, sapma en fazla ±16 px. `prefers-reduced-motion: reduce` iken kapalı.
- Paneller (`app-musteri`, `app-isletme`, `app-yonetici`) daha sade: grain + alt dalga şeridi + en fazla bir küçük sprite.
- Mobil (max-width 860 px): `.am-dekor--desk-only` gizlenir; daha az eleman, biraz daha küçük CSS boyutu.

Performans (kullanılan WebP, 11 Kasım 2026):

| Set | Toplam |
| --- | --- |
| Masaüstü 2× (8 sprite) | ~88 KB |
| Mobil 1× (8 dosya; sayfada 3–6 yüklenir) | ~26 KB (hepsi), tipik landing mobil ~15–20 KB |
| SVG (dalga, köpük, grain, ayak izi) | çok küçük, vektör |

Kullanılmayan eski `webp/dalga.webp`, `kemer.webp` vb. referans edilmez.

---

## Landing (`data-dekor="landing"`)

Tasarım HTML: `ui/landing/index.html`.

Arka plan: tüm sayfada `kum-grain.svg` (160×160 döşeme).

| Element | Dosya | Bölüm / anchor | Konum CSS | CSS boyutu (masaüstü) | Opaklık | Paralaks | Mobil |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Tarak kabuk | `webp/tarak-kabuk.webp` (`-m` mobil) | `section.hero` sol alt | `left:16px; bottom:12px` | 100×87 | 0.95 | 0.08 | evet, 72 px |
| Sarmal kabuk | `webp/sarmal-kabuk.webp` | `section.hero` sol alt | `left:108px; bottom:10px` | 92×82 | 0.94 | 0.06 | yok (desk-only) |
| Çakıl | `webp/cakil.webp` | `section.hero` sol alt | `left:196px; bottom:8px` | 120×77 | 0.92 | 0.05 | yok |
| Begonvil | `webp/begonvil.webp` | `section.hero` sağ alt | `right:148px; bottom:14px` | 160×96 | 0.92 | 0.07 | yok |
| Palmiye | `webp/palmiye.webp` | `section.hero` sağ alt | `right:8px; bottom:8px` | 156×152 | 0.95 | 0.10 | evet, 110 px |
| Köpük şerit | `svg/kopuk.svg` | `search-band` sonrası | şerit `height:52px`; SVG contain | 1440×64 viewBox, şerit 52 px | 0.85–1 (çizgi) | 0.04 | evet |
| Dalga kenarı | `svg/dalga-kenar.svg` | `#ornekler` sonrası | şerit 56 px | 1440×72 viewBox | 0.85–1 | 0.04 | evet |
| Ayak izi | `svg/ayak-izi.svg` | `#etkinlik` sonrası | `left:6%; top:8px; width:260px` | 260×48 | 0.90 | 0.05 | evet, 200 px |
| Deniz yıldızı | `webp/deniz-yildizi.webp` | aynı şerit, sağ | `right:8%; width:88px` | 88×82 | 0.92 | 0.08 | yok |
| Zeytin dalı | `webp/zeytin-dali.webp` | `#nasil` sol üst oluk | `left:4px; top:16px` | 80×71 | 0.92 | 0.07 | yok (desk-only; oluk yok) |
| Dalga kenarı | `svg/dalga-kenar.svg` | `#whatsapp` sonrası | şerit 56 px | 1440×72 | 0.85–1 | 0.04 | evet |
| Yaprak kümesi | `webp/yaprak-kumesi.webp` | `#araclar` sağ alt, bölüm padding’i | `right:8px; bottom:16px` | 100×77 | 0.90 | 0.06 | yok |
| Köpük şerit | `svg/kopuk.svg` | `#pilot` sonrası | şerit 52 px | 1440×64 | 0.85–1 | 0.03 | evet |

Hero alt boşluğu masaüstünde 176 px, mobilde 140 px (palmiye ve kabuklar telefon / Kabuki / CTA’nın altında, kartların dışında). Yatay taşmayı önlemek için negatif `left`/`right` yok. `kemer` ve `kum-tepecigi` PNG yoktur.

Master → CSS tavanı (yarı): palmiye 520 → max 260 (kullanılan 156); begonvil 677 → 338 (160); diğerleri de tavanın altında. 2× WebP, örn. palmiye 312×304 < 520.

---

## /app giriş (`data-dekor="app-giris"`)

Kapsam: giriş, kayıt, bekleme listesi, işletme başvurusu.

Tasarım HTML (önizleme): `ui/formlar/bekleme-listesi.html`, `ui/formlar/isletme-basvuru.html`.

/app tarafında: kök layout veya giriş sayfasına `data-dekor="app-giris"` + `dekor.css` / `dekor.js`.

Bu sahne sade tutulur (form metni ve kartlar önde).

| Element | Dosya | Bölüm / anchor | Konum CSS | CSS boyutu | Opaklık | Paralaks | Mobil |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Kum grain | `svg/kum-grain.svg` | sayfa zemini | `background-repeat:repeat; 160px` | döşeme | doku 0.16 | — | evet |
| Tarak kabuk | `webp/tarak-kabuk.webp` | `body` sol alt (sabit katman) | `left:16px; bottom:16px` | 88 px | 0.90 | 0.05 | yok |
| Palmiye | `webp/palmiye.webp` | `body` sağ alt | `right:16px; bottom:16px` | 132 px (mobil 110) | 0.90 | 0.07 | evet |
| Dalga kenarı | `svg/dalga-kenar.svg` | `main` sonu | şerit, `margin-top:24px` | 56 px yükseklik | 0.85–1 | 0 | evet |

JS, `header.nav` ve `main .wrap` z-index’ini içeriğin üstte kalması için yükseltir. Sprite’lar form kolonunun ve CTA’nın arkasına gelmemelidir; çakışma olursa `bottom` artırılır veya spritelar küçültülür.

---

## /app müşteri (`data-dekor="app-musteri"`)

Kapsam: keşif, işletme profili, rezervasyon akışı.

Tasarım HTML: `ui/musteri/kesif-masaustu.html`, `kesif-mobil.html`, `rezervasyon-masaustu.html`, `rezervasyon-mobil.html`.

/app: müşteri kabuğuna `data-dekor="app-musteri"`.

Panel dilinde sade.

| Element | Dosya | Bölüm / anchor | Konum CSS | CSS boyutu | Opaklık | Paralaks | Mobil |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Kum grain | `svg/kum-grain.svg` | sayfa zemini | döşeme 160 px | — | doku 0.16 | — | evet |
| Dalga kenarı | `svg/dalga-kenar.svg` | `body` alt kenarı | `left/right:0; bottom:0; height:40px` (mobil 32) | şerit | 0.85 | 0 | evet |
| Sarmal kabuk | `webp/sarmal-kabuk.webp` | sağ alt, iş alanının dışında / köşe | `right:16px; bottom:16px` | 80 px | 0.88 | 0.04 | yok |

`.work` ve kartlar `z-index:1`. Sprite metin veya takvim hücresinin üstüne binerse kaldırılır (desk-only zaten mobil sade).

---

## /app işletme (`data-dekor="app-isletme"`)

Kapsam: takvim, boş saatler, gelen istekler, işletme paneli kabuğu.

Tasarım HTML: `ui/isletme/takvim.html`, `takvim-mobil.html`, `bos-saatler.html`, `whatsapp-gelen.html`.

/app: işletme kabuğuna `data-dekor="app-isletme"`.

| Element | Dosya | Bölüm / anchor | Konum CSS | CSS boyutu | Opaklık | Paralaks | Mobil |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Kum grain | `svg/kum-grain.svg` | sayfa zemini | döşeme 160 px | — | doku 0.16 | — | evet |
| Dalga kenarı | `svg/dalga-kenar.svg` | `body` alt kenarı | `bottom:0; height:40px` (mobil 32) | şerit | 0.85 | 0 | evet |
| Yaprak kümesi | `webp/yaprak-kumesi.webp` | `.side-nav` altı (`.am-dekor-nav-corner`, menü öğelerinin altında) | `left:16px; bottom:20px` | 88 px | 0.88 | 0.04 | yok |

Yan menü linklerinin ve `.work` içeriğinin arkasına konmaz; köşe, menü öğelerinin altında boş alana oturur.

---

## /app yönetici (`data-dekor="app-yonetici"`)

Kapsam: onaylar, sistem durumu, yönetici kabuğu.

Tasarım HTML: `ui/yonetim/onaylar.html`, `ui/yonetim/sistem-durumu.html`.

/app: yönetici kabuğuna `data-dekor="app-yonetici"` (rota `/app/yonetici` veya `/app/yonetim` olabilir; JS her ikisini de tanır).

Yerleşim işletme paneli ile aynı sadeliktedir (ayrı attribute, aynı görsel dil).

| Element | Dosya | Bölüm / anchor | Konum CSS | CSS boyutu | Opaklık | Paralaks | Mobil |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Kum grain | `svg/kum-grain.svg` | sayfa zemini | döşeme 160 px | — | doku 0.16 | — | evet |
| Dalga kenarı | `svg/dalga-kenar.svg` | `body` alt kenarı | `bottom:0; height:40px` (mobil 32) | şerit | 0.85 | 0 | evet |
| Yaprak kümesi | `webp/yaprak-kumesi.webp` | `.side-nav` altı (`.am-dekor-nav-corner`) | `left:16px; bottom:20px` | 88 px | 0.88 | 0.04 | yok |

---

## Sınıf ve dosya sözlüğü (Dev)

| Sınıf / attribute | Görev |
| --- | --- |
| `data-dekor="…"` | Sahne seçici (html/body) |
| `.am-dekor-layer` | Mutlak katman, `pointer-events:none` |
| `.am-dekor-item` | PNG sprite sarmalayıcı |
| `.am-dekor-svg` | SVG sarmalayıcı |
| `.am-dekor-band`, `--wave`, `--foam`, `--tracks` | Bölüm geçiş şeritleri |
| `.am-dekor--palmiye` vb. | Konum sınıfları |
| `.am-dekor--desk-only` | 860 px altında gizlenir |
| `[data-parallax]` | Paralaks hız faktörü |
| `.am-dekor-nav-corner` | Panelde menü altı sprite yuvası |

`dekor.js` yerleşimi çalışma anında enjekte eder; statik HTML’e sprite kopyalamaya gerek yoktur. Çakışma denetimi: dekor bbox × metin/kart/düğme bbox + `scrollWidth > clientWidth`. Sapma varsa konum veya `desk-only` ile düzeltilir, sahne tablosu güncellenir.


---

## QA (11 Kasım 2026, Asia/Famagusta)

Playwright taraması: landing + formlar + işletme + müşteri + yönetim, 1440 ve 390.

- Çakışma (dekor bbox × metin/kart/düğme/Kabuki/cihaz, alan > 12 px): **yok** (düzeltmelerden sonra).
- Yatay scroll: landing ve formlarda **yok**. `body.shot-1440` taslakları 390 genişlikte +1050 taşma gösterir; bu dekor değil, sabit 1440 px artboard genişliğidir. Kendi genişliklerinde (`1440` veya `shot-390` sayfalarında 390) taşma yok.
- Font: `document.fonts.check` Plus Jakarta Sans 700/600 ve Inter 400/500 **geçti**; başlık ailesi Plus Jakarta Sans (Times/serif yok).
- Netlik: PNG spritelar 2× (masaüstü) / 1× (mobil), CSS ≤ master/2, upscale yok. SVG dalga/köpük/ayak izi vektördür; kökte `width`/`height` vardır, şeritte yalnızca dalga/köpük %100 genişler (ayak izi 260 px kalır).
