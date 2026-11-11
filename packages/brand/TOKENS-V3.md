# Ada Merkez — Renk sistemi v3 · TOKENS-V3

Tarih: 11 Kasım 2026, Asia/Famagusta. Sürüm 3.0.0. Kaynak: `src/build_tokens.py` → `tokens.json`, `tokens.css`. Pano: `png/palet-v3.png`.

v2’nin ölçü, aralık, font ve bileşen tokenları geçerli kalır; v3 renk, gradyan, kategori rengi ve dokuyu yeniden tanımlar. Lacivert `#0F2C44` ve mercan `#E4572E` çekirdekte durur ama artık tek başına baskın değil: sayfa hellim zeminde açılır, bölümler deniz, gün batımı, begonvil, zeytin ve limon arasında dolaşır.

## Renk aileleri

| Aile | Ad | 50 | 100 | 200 | 400 (canlı) | 600 | 800 | Kullanım |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `lacivert` | Lacivert gece | #E8EEF4 | #C9D6E3 | #8FA7BF | #3C5A78 | #1C3D5A | #0F2C44 | Marka çekirdeği; metin ve koyu zemin |
| `mercan` | Kabuki mercanı | #FDEDE7 | #FBD3C4 | #F6A68A | #E4572E | #C2410C | #8A2A08 | Marka çekirdeği; Kabuki kabuğu, ana vurgu |
| `akdeniz` | Akdeniz turkuazı | #E2F7F5 | #BDEDE8 | #7EDDD5 | #22B8AF | #0E7C78 | #0A4F4D | Sığ deniz, sahil, olumlu durum |
| `derin` | Derin mavi | #E3EEFA | #BFD7F2 | #82B1E6 | #2D7DD2 | #0B5FA5 | #083E6E | Açık deniz, klinik, bilgi |
| `gunbatimi` | Gün batımı turuncusu | #FFF0E3 | #FFD9B8 | #FFB57A | #FF8A3D | #B04A0A | #7F3A0A | Restoran, akşam, sıcak vurgu |
| `hellim` | Hellim / kum sarısı | #FFFBF2 | #FBF1DA | #F4E2B8 | #E8C77E | #9A7429 | #5E4614 | Ana sayfa zemini, kart, sıcak nötr |
| `zeytin` | Zeytin yeşili | #F1F4E3 | #DDE5BC | #BCCB7E | #8DA33A | #5C6E1E | #3A4612 | Spor, doğa, başarı tonu |
| `begonvil` | Begonvil pembesi | #FDE8F2 | #F9C6DE | #F28DBB | #E03A8C | #B0196A | #700E43 | Güzellik, eğlence, öne çıkan |
| `mor` | Begonvil moru | #F2EAFA | #DDCBF1 | #B996E0 | #8A4FC6 | #6A2FA3 | #45196E | Kuaför, akşam, etkinlik ikincil |
| `limon` | Limon | #FFFBE0 | #FFF3A8 | #FBE66A | #F5D21E | #8C7600 | #574900 | Etkinlik, Yakında, neşeli vurgu |
| `harnup` | Harnup kahvesi | #F6EEE8 | #E8D5C7 | #CFAA90 | #9A6544 | #6E4227 | #4A2A16 | Kafe, sıcak koyu nötr |

Lacivert ayrıca `900 #081A2A` (gece zemini).

## Gradyanlar

| Token | Ad | CSS |
| --- | --- | --- |
| `--am3-grad-gunbatimi` | Gün batımı | `linear-gradient(135deg, #FFB57A 0%, #FF8A3D 30%, #E4572E 62%, #E03A8C 100%)` |
| `--am3-grad-akdeniz` | Akdeniz | `linear-gradient(160deg, #7EDDD5 0%, #22B8AF 40%, #0B5FA5 100%)` |
| `--am3-grad-begonvil` | Begonvil | `linear-gradient(135deg, #F28DBB 0%, #E03A8C 45%, #8A4FC6 100%)` |
| `--am3-grad-limonluk` | Limonluk | `linear-gradient(135deg, #FFF3A8 0%, #F5D21E 45%, #8DA33A 100%)` |
| `--am3-grad-hellim` | Hellim sabahı | `linear-gradient(180deg, #FFFBF2 0%, #FBF1DA 55%, #F4E2B8 100%)` |
| `--am3-grad-gece` | Ada gecesi | `linear-gradient(180deg, #081A2A 0%, #0F2C44 45%, #083E6E 100%)` |
| `--am3-grad-metin` | Metin gradyanı (büyük başlık) | `linear-gradient(100deg, #C2410C 0%, #B0196A 55%, #6A2FA3 100%)` |
| `--am3-grad-ufuk` | Ufuk | `linear-gradient(180deg, #FFD9B8 0%, #FBF1DA 38%, #BDEDE8 100%)` |

Kural: gradyan üstünde metin, gradyanın **en kötü** durağına göre seçilir (tabloda «Gradyan» grubu). Akdeniz ve limonluk gradyanının orta bölgesine küçük beyaz metin konmaz.

## Kategori renkleri

| Kategori | Aile | Kart zemini | Çip | Vurgu | Koyu dolgu | Mürekkep |
| --- | --- | --- | --- | --- | --- | --- |
| Kuaför (`kuafor`) | mor | #F2EAFA | #DDCBF1 | #8A4FC6 | #6A2FA3 | #45196E |
| Güzellik (`guzellik`) | begonvil | #FDE8F2 | #F9C6DE | #E03A8C | #B0196A | #700E43 |
| Klinik (`klinik`) | derin | #E3EEFA | #BFD7F2 | #2D7DD2 | #0B5FA5 | #083E6E |
| Restoran (`restoran`) | gunbatimi | #FFF0E3 | #FFD9B8 | #FF8A3D | #B04A0A | #7F3A0A |
| Kafe (`kafe`) | harnup | #F6EEE8 | #E8D5C7 | #9A6544 | #6E4227 | #4A2A16 |
| Etkinlik (`etkinlik`) | limon | #FFFBE0 | #FFF3A8 | #F5D21E | #8C7600 | #574900 |
| Spor (`spor`) | zeytin | #F1F4E3 | #DDE5BC | #8DA33A | #5C6E1E | #3A4612 |
| Sahil (`sahil`) | akdeniz | #E2F7F5 | #BDEDE8 | #22B8AF | #0E7C78 | #0A4F4D |

Klinik derin mavi ile sakin tutulur; güzellik ve kuaför begonvil ailesini paylaşır (pembe / mor). Etkinlik limon + «Yakında».

## Anlamsal

| Token | Değer |
| --- | --- |
| `--am3-bg` | #FFFBF2 |
| `--am3-bgAlt` | #FBF1DA |
| `--am3-surface` | #FFFFFF |
| `--am3-surfaceWarm` | #FFFBF2 |
| `--am3-text` | #0F2C44 |
| `--am3-textMuted` | #4E5A66 |
| `--am3-textOnDark` | #FFFBF2 |
| `--am3-textOnDarkMuted` | #C9D6E3 |
| `--am3-border` | #F4E2B8 |
| `--am3-focus` | #0B5FA5 |
| `--am3-brand` | #0F2C44 |
| `--am3-accent` | #E4572E |
| `--am3-accentText` | #C2410C |
| `--am3-confirmed` | #0F2C44 |
| `--am3-pending` | #E4572E |
| `--am3-pendingBg` | #FDEDE7 |
| `--am3-free` | #0E7C78 |
| `--am3-freeBg` | #E2F7F5 |
| `--am3-success` | #5C6E1E |
| `--am3-warning` | #B04A0A |
| `--am3-danger` | #B42318 |
| `--am3-info` | #0B5FA5 |

Durum renkleri v2 ile aynı anlamı taşır: onaylı lacivert, bekleyen mercan + `mercan.50`, boş saat turkuaz `akdeniz.600` + `akdeniz.50`.

## Dokular (SVG)

`desen/` içinde, tekrarlanabilir veya tek parça:

| Dosya | Motif | Not |
| --- | --- | --- |
| `dalga.svg` | Akdeniz dalgası | Tekrarlı şerit; bölüm ayırıcı, hero deniz katmanı |
| `kum.svg` | Kum taneleri | Düşük opaklık nokta dokusu; hellim zeminde |
| `lefkara.svg` | Lefkara dantel deseni | Geometrik baklava, zikzak (potamos) ve delik işi; kart kenarı, splash |
| `kayik.svg` | Balıkçı kayığı | Tek obje; hero ve boş durum dekoru |
| `harnup.svg` | Harnup (keçiboynuzu) dalı | Kafe ve sıcak bölümler |
| `zeytin-dali.svg` | Zeytin dalı | Spor/doğa, köşe dekoru |
| `begonvil.svg` | Begonvil kümesi | Hero köşesi, kutlama anları |

Desenler elle çizilmiş SVG’dir; stok veya üretilmiş görsel değildir.

## WCAG 2.1 kontrast tablosu

Eşikler: AA normal metin 4.5:1, AA büyük metin (≥24 px veya ≥18.66 px kalın) ve arayüz ögesi 3:1, AAA 7:1. «Yok» = metin için kullanılmaz, yalnız dekor.

| Grup | Metin | Zemin | Oran | Sonuç | Kullanım |
| --- | --- | --- | --- | --- | --- |
| Temel | `lacivert.800` #0F2C44 | `hellim.50` #FFFBF2 | 13.89 | AAA | Gövde ve başlık |
| Temel | `#4E5A66` #4E5A66 | `hellim.50` #FFFBF2 | 6.83 | AA | İkincil metin |
| Temel | `mercan.600` #C2410C | `hellim.50` #FFFBF2 | 5.01 | AA | Mercan küçük metin / bağlantı |
| Temel | `akdeniz.800` #0A4F4D | `hellim.50` #FFFBF2 | 9.08 | AAA | Turkuaz küçük metin |
| Temel | `mercan.400` #E4572E | `hellim.50` #FFFBF2 | 3.57 | AA büyük | Mercan yalnız büyük başlık / ikon |
| Temel | `lacivert.800` #0F2C44 | `hellim.100` #FBF1DA | 12.77 | AAA | Gövde ve başlık |
| Temel | `#4E5A66` #4E5A66 | `hellim.100` #FBF1DA | 6.28 | AA | İkincil metin |
| Temel | `mercan.600` #C2410C | `hellim.100` #FBF1DA | 4.61 | AA | Mercan küçük metin / bağlantı |
| Temel | `akdeniz.800` #0A4F4D | `hellim.100` #FBF1DA | 8.35 | AAA | Turkuaz küçük metin |
| Temel | `mercan.400` #E4572E | `hellim.100` #FBF1DA | 3.28 | AA büyük | Mercan yalnız büyük başlık / ikon |
| Temel | `lacivert.800` #0F2C44 | `#FFFFFF` #FFFFFF | 14.34 | AAA | Gövde ve başlık |
| Temel | `#4E5A66` #4E5A66 | `#FFFFFF` #FFFFFF | 7.05 | AAA | İkincil metin |
| Temel | `mercan.600` #C2410C | `#FFFFFF` #FFFFFF | 5.18 | AA | Mercan küçük metin / bağlantı |
| Temel | `akdeniz.800` #0A4F4D | `#FFFFFF` #FFFFFF | 9.38 | AAA | Turkuaz küçük metin |
| Temel | `mercan.400` #E4572E | `#FFFFFF` #FFFFFF | 3.68 | AA büyük | Mercan yalnız büyük başlık / ikon |
| Koyu | `#FFFBF2` #FFFBF2 | `lacivert.800` #0F2C44 | 13.89 | AAA | Lacivert zemin metni |
| Koyu | `lacivert.100` #C9D6E3 | `lacivert.800` #0F2C44 | 9.71 | AAA | Lacivert zemin ikincil |
| Koyu | `limon.200` #FBE66A | `lacivert.800` #0F2C44 | 11.36 | AAA | Lacivert üstü limon vurgu |
| Koyu | `akdeniz.200` #7EDDD5 | `lacivert.800` #0F2C44 | 9.01 | AAA | Lacivert üstü turkuaz vurgu |
| Koyu | `begonvil.200` #F28DBB | `lacivert.800` #0F2C44 | 6.35 | AA | Lacivert üstü begonvil vurgu |
| Koyu | `gunbatimi.200` #FFB57A | `lacivert.800` #0F2C44 | 8.29 | AAA | Lacivert üstü turuncu vurgu |
| Koyu | `#FFFBF2` #FFFBF2 | `derin.800` #083E6E | 10.57 | AAA | Derin mavi zemin metni |
| Dolgu | `#FFFFFF` #FFFFFF | `mercan.400` #E4572E | 3.68 | AA büyük | Mercan CTA (≥18 px kalın) |
| Dolgu | `lacivert.800` #0F2C44 | `mercan.400` #E4572E | 3.89 | AA büyük | Mercan CTA lacivert yazı |
| Dolgu | `#FFFFFF` #FFFFFF | `mercan.600` #C2410C | 5.18 | AA | Koyu mercan düğme, küçük yazı |
| Dolgu | `lacivert.800` #0F2C44 | `limon.400` #F5D21E | 9.64 | AAA | Limon etiket / sticker |
| Dolgu | `lacivert.800` #0F2C44 | `akdeniz.400` #22B8AF | 5.84 | AA | Turkuaz sticker |
| Dolgu | `#FFFFFF` #FFFFFF | `akdeniz.600` #0E7C78 | 5.03 | AA | Turkuaz düğme |
| Dolgu | `#FFFFFF` #FFFFFF | `begonvil.600` #B0196A | 6.58 | AA | Begonvil düğme |
| Dolgu | `#FFFFFF` #FFFFFF | `begonvil.400` #E03A8C | 4.08 | AA büyük | Begonvil sticker, büyük yazı |
| Dolgu | `lacivert.800` #0F2C44 | `gunbatimi.400` #FF8A3D | 6.12 | AA | Turuncu sticker |
| Dolgu | `#FFFFFF` #FFFFFF | `mor.600` #6A2FA3 | 8.24 | AAA | Mor düğme |
| Dolgu | `#FFFFFF` #FFFFFF | `derin.600` #0B5FA5 | 6.57 | AA | Derin mavi düğme |
| Dolgu | `#FFFFFF` #FFFFFF | `zeytin.600` #5C6E1E | 5.67 | AA | Zeytin düğme |
| Dolgu | `lacivert.800` #0F2C44 | `hellim.400` #E8C77E | 8.81 | AAA | Hellim sticker |
| Kategori · Kuaför | `mor.800` #45196E | `mor.50` #F2EAFA | 11.08 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Kuaför | `mor.800` #45196E | `mor.100` #DDCBF1 | 8.59 | AAA | Rozet / çip |
| Kategori · Kuaför | `lacivert.800` #0F2C44 | `mor.100` #DDCBF1 | 9.49 | AAA | Rozet lacivert yazı |
| Kategori · Kuaför | `#FFFFFF` #FFFFFF | `mor.600` #6A2FA3 | 8.24 | AAA | Koyu dolgu üstü metin |
| Kategori · Güzellik | `begonvil.800` #700E43 | `begonvil.50` #FDE8F2 | 9.82 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Güzellik | `begonvil.800` #700E43 | `begonvil.100` #F9C6DE | 7.73 | AAA | Rozet / çip |
| Kategori · Güzellik | `lacivert.800` #0F2C44 | `begonvil.100` #F9C6DE | 9.67 | AAA | Rozet lacivert yazı |
| Kategori · Güzellik | `#FFFFFF` #FFFFFF | `begonvil.600` #B0196A | 6.58 | AA | Koyu dolgu üstü metin |
| Kategori · Klinik | `derin.800` #083E6E | `derin.50` #E3EEFA | 9.29 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Klinik | `derin.800` #083E6E | `derin.100` #BFD7F2 | 7.39 | AAA | Rozet / çip |
| Kategori · Klinik | `lacivert.800` #0F2C44 | `derin.100` #BFD7F2 | 9.71 | AAA | Rozet lacivert yazı |
| Kategori · Klinik | `#FFFFFF` #FFFFFF | `derin.600` #0B5FA5 | 6.57 | AA | Koyu dolgu üstü metin |
| Kategori · Restoran | `gunbatimi.800` #7F3A0A | `gunbatimi.50` #FFF0E3 | 7.49 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Restoran | `gunbatimi.800` #7F3A0A | `gunbatimi.100` #FFD9B8 | 6.32 | AA | Rozet / çip |
| Kategori · Restoran | `lacivert.800` #0F2C44 | `gunbatimi.100` #FFD9B8 | 10.84 | AAA | Rozet lacivert yazı |
| Kategori · Restoran | `#FFFFFF` #FFFFFF | `gunbatimi.600` #B04A0A | 5.48 | AA | Koyu dolgu üstü metin |
| Kategori · Kafe | `harnup.800` #4A2A16 | `harnup.50` #F6EEE8 | 11.21 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Kafe | `harnup.800` #4A2A16 | `harnup.100` #E8D5C7 | 9.04 | AAA | Rozet / çip |
| Kategori · Kafe | `lacivert.800` #0F2C44 | `harnup.100` #E8D5C7 | 10.09 | AAA | Rozet lacivert yazı |
| Kategori · Kafe | `#FFFFFF` #FFFFFF | `harnup.600` #6E4227 | 8.50 | AAA | Koyu dolgu üstü metin |
| Kategori · Etkinlik | `limon.800` #574900 | `limon.50` #FFFBE0 | 8.53 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Etkinlik | `limon.800` #574900 | `limon.100` #FFF3A8 | 7.90 | AAA | Rozet / çip |
| Kategori · Etkinlik | `lacivert.800` #0F2C44 | `limon.100` #FFF3A8 | 12.73 | AAA | Rozet lacivert yazı |
| Kategori · Etkinlik | `lacivert.800` #0F2C44 | `limon.400` #F5D21E | 9.64 | AAA | Canlı dolgu üstü lacivert metin |
| Kategori · Spor | `zeytin.800` #3A4612 | `zeytin.50` #F1F4E3 | 9.10 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Spor | `zeytin.800` #3A4612 | `zeytin.100` #DDE5BC | 7.75 | AAA | Rozet / çip |
| Kategori · Spor | `lacivert.800` #0F2C44 | `zeytin.100` #DDE5BC | 10.93 | AAA | Rozet lacivert yazı |
| Kategori · Spor | `#FFFFFF` #FFFFFF | `zeytin.600` #5C6E1E | 5.67 | AA | Koyu dolgu üstü metin |
| Kategori · Sahil | `akdeniz.800` #0A4F4D | `akdeniz.50` #E2F7F5 | 8.42 | AAA | Kart zemini üstü başlık/metin |
| Kategori · Sahil | `akdeniz.800` #0A4F4D | `akdeniz.100` #BDEDE8 | 7.35 | AAA | Rozet / çip |
| Kategori · Sahil | `lacivert.800` #0F2C44 | `akdeniz.100` #BDEDE8 | 11.23 | AAA | Rozet lacivert yazı |
| Kategori · Sahil | `#FFFFFF` #FFFFFF | `akdeniz.600` #0E7C78 | 5.03 | AA | Koyu dolgu üstü metin |
| Gradyan | `lacivert.800` #0F2C44 | `#FFB57A` #FFB57A | 8.29 | AAA | Gün batımı açık ucu, lacivert metin |
| Gradyan | `#FFFFFF` #FFFFFF | `#E03A8C` #E03A8C | 4.08 | AA büyük | Gün batımı koyu ucu, beyaz büyük metin |
| Gradyan | `#FFFFFF` #FFFFFF | `#22B8AF` #22B8AF | 2.46 | Yok | Akdeniz açık orta, beyaz metin (kaçın) |
| Gradyan | `#FFFFFF` #FFFFFF | `#0B5FA5` #0B5FA5 | 6.57 | AA | Akdeniz koyu ucu, beyaz metin |
| Gradyan | `lacivert.800` #0F2C44 | `#7EDDD5` #7EDDD5 | 9.01 | AAA | Akdeniz açık ucu, lacivert metin |
| Gradyan | `lacivert.800` #0F2C44 | `#FFF3A8` #FFF3A8 | 12.73 | AAA | Limonluk açık ucu |
| Gradyan | `lacivert.800` #0F2C44 | `#8DA33A` #8DA33A | 5.08 | AA | Limonluk koyu ucu, lacivert (kaçın) |
| Gradyan | `#FFFFFF` #FFFFFF | `#8A4FC6` #8A4FC6 | 5.23 | AA | Begonvil koyu ucu, beyaz |
| Gradyan | `lacivert.800` #0F2C44 | `#FFD9B8` #FFD9B8 | 10.84 | AAA | Ufuk gökyüzü üstü |
| Gradyan | `lacivert.800` #0F2C44 | `#BDEDE8` #BDEDE8 | 11.23 | AAA | Ufuk alt ucu |
| Gradyan | `#C2410C` #C2410C | `#FFD9B8` #FFD9B8 | 3.91 | AA büyük | Metin gradyanı açık ucu, gökyüzü üstünde |
| Gradyan | `#6A2FA3` #6A2FA3 | `#FBF1DA` #FBF1DA | 7.34 | AAA | Metin gradyanı koyu ucu, hellim üstünde |
| Gradyan | `#B0196A` #B0196A | `#FFD9B8` #FFD9B8 | 4.97 | AA | Metin gradyanı orta, gökyüzü üstünde |

## Kurallar (tablodan)

1. Küçük metin her zaman `lacivert.800`, `#4E5A66`, ya da ailenin `800` tonu. Canlı `400` tonları metin değil, dolgu ve dekordur.
2. Mercan `#E4572E` üstüne beyaz yalnız büyük ve kalın (CTA ≥18 px bold); küçük metinli mercan düğmede `mercan.600` veya lacivert yazı.
3. Limon, turkuaz `400`, turuncu `400` ve hellim `400` dolgularda yazı lacivert.
4. Lacivert zeminde vurgu için `200` tonları (limon, turkuaz, begonvil, turuncu) AA geçer.
5. Gradyan üstü metin en kötü durakla ölçülür; hero gökyüzü (ufuk) lacivert metinle AAA.

Sınırda veya geçmeyen çiftler (yalnız belirtilen biçimde kullanılır):

- Temel: `mercan.400` / `hellim.50` = 3.57 (AA büyük) — Mercan yalnız büyük başlık / ikon
- Temel: `mercan.400` / `hellim.100` = 3.28 (AA büyük) — Mercan yalnız büyük başlık / ikon
- Temel: `mercan.400` / `#FFFFFF` = 3.68 (AA büyük) — Mercan yalnız büyük başlık / ikon
- Dolgu: `#FFFFFF` / `mercan.400` = 3.68 (AA büyük) — Mercan CTA (≥18 px kalın)
- Dolgu: `lacivert.800` / `mercan.400` = 3.89 (AA büyük) — Mercan CTA lacivert yazı
- Dolgu: `#FFFFFF` / `begonvil.400` = 4.08 (AA büyük) — Begonvil sticker, büyük yazı
- Gradyan: `#FFFFFF` / `#E03A8C` = 4.08 (AA büyük) — Gün batımı koyu ucu, beyaz büyük metin
- Gradyan: `#FFFFFF` / `#22B8AF` = 2.46 (Yok) — Akdeniz açık orta, beyaz metin (kaçın)
- Gradyan: `#C2410C` / `#FFD9B8` = 3.91 (AA büyük) — Metin gradyanı açık ucu, gökyüzü üstünde
