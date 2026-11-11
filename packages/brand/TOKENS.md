# Ada Merkez — Tokenlar v2.0.0

Tarih: 11 Kasım 2026, Asia/Famagusta  
Kaynak: `tokens.json`, `tokens.css`  
Önceki sürüm: v1.4.1 (`/workspace/ada-merkez/tasarim/tokens.json`)

v2, **uygulama içi native kalite** için genişletilmiş bir settir. Marka paleti değişmez.

## Palet (korunur)

| Rol | Değer | Kullanım |
| --- | --- | --- |
| Lacivert | `#0F2C44` | Metin, birincil dolgu, onaylı durum |
| Mercan | `#E4572E` | CTA, vurgu, bekleyen şerit |
| Turkuaz | `#0E7C78` | Dolu ikincil düğme, büyük vurgu |
| Turkuaz koyu | `#0A4F4D` | Küçük metin, bağlantı, boş saat yazısı |
| Turkuaz soft | `#D8F1EF` | Boş saat, yumuşak yüzey |
| Kum zemin | `#F8F0E3` | Sayfa arka planı |
| Kart | `#FFF8F0` | Kart, yüzey |
| Yüzey raised | `#FFFFFF` | Arama, sheet, toast |

Kum altını yoktur.

## v1.4.1 → v2.0.0 değişiklikleri

1. **Semantic tokenlar** — `background`, `surface`, `surfaceRaised`, `surfaceMuted`, `surfaceOverlay`, `text*`, `border*`, `divider`, `link`, `icon`, `iconMuted`. Light ve dark eşlenikleri var (`data-theme`).
2. **Nötr skala** — v1'deki sıcak nötr 50–900 korundu; CSS'de `--am-neutral-*` olarak açıklandı.
3. **Elevation 0–5** — kart (2), tab bar (3), sheet (5), toast (4). Eski `shadow.sm/md/lg` durur, yeni işte elevation kullanılır.
4. **Radius** — xs 6, sm 8, md 12, lg 16, xl 20, 2xl 24, 3xl 32, button/input 14, card 20, sheet 24. (v1 sm 4 / md 8 biraz büyütüldü; uygulama daha yumuşak.)
5. **Motion** — süre ve easing aynı aile; `sheet: 420ms` ve `prefers-reduced-motion` (80 ms, yalnız opacity) eklendi.
6. **Dokunma ve safe-area** — min 44 px, rahat 48, CTA 52, status 47, tab 56 + `env(safe-area-inset-*)`.
7. **Tipografi** — Plus Jakarta Sans başlık, Inter gövde. Uygulama başlığı 22/28 (`--am-fs-title`). Yerel woff2; CDN yok.
8. **Uyarı metni** — `#A16207` kumda 4,35:1 (küçük metinde AA değil). Küçük yazıda yeni `warningText` `#8A5308` (5,59:1, AA).
9. **İkon** — Lucide, inline SVG, 20 px, stroke 1,75, yuvarlak uç. WhatsApp logosu yok.
10. **Kabuki kuralı** — master 1024 px üstüne büyütülmez.

Davranışı değişmeyenler: durum renkleri (onaylı / bekleyen / boş saat / iptal), i18n (TR/EN), para birimi yalnız gösterim, uydurma fiyat yasağı, Logo A.

## Kullanım kuralları (kontrast)

- Küçük metin ve bağlantıda turkuaz için `#0A4F4D`, mercan için `#C2410C`.
- Beyaz üzerine mercan dolgu yalnız **büyük CTA** (en az 16 px semibold ve 48+ px yükseklik).
- Puan, yorum sayısı, uydurma fiyat yazılmaz.

## Kontrast tablosu (WCAG 2.1, hesaplanmış)

Göreli parlaklık sRGB formülü ile hesaplandı; oranlar iki ondalıktır.

| Çift | Oran | Seviye |
| --- | --- | --- |
| `#0F2C44 / #F8F0E3` | 12,68 : 1 | AAA |
| `#0F2C44 / #FFF8F0` | 13,62 : 1 | AAA |
| `#0F2C44 / #FFFFFF` | 14,34 : 1 | AAA |
| `#FFF8F0 / #0F2C44` | 13,62 : 1 | AAA |
| `#FFFFFF / #0F2C44` | 14,34 : 1 | AAA |
| `#6E5E4E / #F8F0E3` | 5,5 : 1 | AA |
| `#6E5E4E / #FFF8F0` | 5,91 : 1 | AA |
| `#7A6A58 / #F8F0E3` | 4,61 : 1 | AA |
| `#7A6A58 / #FFF8F0` | 4,95 : 1 | AA |
| `#0E7C78 / #F8F0E3` | 4,45 : 1 | AA büyük yazı / UI — küçük metinde kullanma; tealDark kullan |
| `#0E7C78 / #FFF8F0` | 4,78 : 1 | AA |
| `#0E7C78 / #FFFFFF` | 5,03 : 1 | AA |
| `#0A4F4D / #F8F0E3` | 8,29 : 1 | AAA — küçük metin / bağlantı |
| `#0A4F4D / #FFF8F0` | 8,91 : 1 | AAA |
| `#FFFFFF / #0E7C78` | 5,03 : 1 | AA — turkuaz dolu düğme |
| `#E4572E / #F8F0E3` | 3,26 : 1 | AA büyük yazı / UI — yalnız büyük yazı / ikon |
| `#E4572E / #FFF8F0` | 3,5 : 1 | AA büyük yazı / UI — yalnız büyük yazı / ikon |
| `#FFFFFF / #E4572E` | 3,68 : 1 | AA büyük yazı / UI — yalnız büyük CTA (≥18 px veya 14 px bold+) |
| `#C2410C / #F8F0E3` | 4,58 : 1 | AA — küçük mercan metin |
| `#C2410C / #FCEDE8` | 4,54 : 1 | AA — bekleyen rozet küçük yazı |
| `#0F2C44 / #FCEDE8` | 12,58 : 1 | AAA |
| `#0A4F4D / #D8F1EF` | 7,93 : 1 | AAA — boş saat / serbest slot |
| `#6E5E4E / #E8DCC8` | 4,59 : 1 | AA |
| `#7EC9C3 / #0F2C44` | 7,53 : 1 | AAA |
| `#007A3D / #F8F0E3` | 4,82 : 1 | AA |
| `#007A3D / #E3F6EC` | 4,85 : 1 | AA |
| `#A16207 / #F8F0E3` | 4,35 : 1 | AA büyük yazı / UI — küçük metinde yetersiz; warningText #8A5308 kullan (5,59:1) |
| `#A16207 / #FBF3D8` | 4,43 : 1 | AA büyük yazı / UI — küçük metinde yetersiz; warningText kullan |
| `#C62828 / #F8F0E3` | 4,97 : 1 | AA |
| `#C62828 / #FDECEC` | 4,92 : 1 | AA |
| `#1E6AA6 / #F8F0E3` | 5,06 : 1 | AA |
| `#1E6AA6 / #E6F3FB` | 5,07 : 1 | AA |
| `#F8F0E3 / #0A1624` | 16,1 : 1 | AAA — dark |
| `#F8F0E3 / #0F2C44` | 12,68 : 1 | AAA — dark |
| `#B8B2A8 / #0A1624` | 8,65 : 1 | AAA — dark |
| `#7EC9C3 / #0A1624` | 9,56 : 1 | AAA — dark, küçük metin |
| `#E4572E / #0A1624` | 4,94 : 1 | AA — dark |
| `#FFFFFF / #E4572E` | 3,68 : 1 | AA büyük yazı / UI — dark — yine yalnız büyük CTA |

`warningText #8A5308 / kum #F8F0E3` = 5,59:1, AA.  
`warningText #8A5308 / warningSubtle #FBF3D8` = 5,69:1, AA.

## Dark

Dark tokenlar hazırdır (`[data-theme="dark"]`). Faz 1 ekranları light'tır; dark değerler Dev'in `prefers-color-scheme` veya ayar anahtarı için hazır durur. Dark'ta mercan dolgulu beyaz CTA kuralı aynıdır (3,68:1, yalnız büyük yazı).

## Dosyalar

- `tokens.json` — kaynak
- `tokens.css` — CSS değişkenleri
- Bu belge

Uygulama stilleri: `/workspace/ada-merkez/tasarim/ui-v2/css/`.
