# Ada Merkez — Bileşen seti v2

Tarih: 11 Kasım 2026, Asia/Famagusta  
Kaynak: `bilesenler.html`, `../css/app.css`, `tokens-v2`.  
Pano PNG: `bilesenler-pano.png`.

Tüm ölçüler CSS px. Dokunma alanı en az 44 px. İkonlar Lucide tarzı inline SVG (24 görünüm kutusu, 20 px çizim, stroke 1,75, yuvarlak uç). WhatsApp logosu yok; mesaj için `MessageCircle`.

## Genel

| Token | Değer |
| --- | --- |
| Sayfa payı | 20 |
| Izgara | 8 pt (birim 4) |
| Kart yarıçapı | 20 |
| Düğme / alan yarıçapı | 14 |
| Çip / rozet | full (hap) |
| Gölge kart | elev-2 |
| Odak halkası | beyaz 3 + mercan 5 |

## Düğme `.am-btn`

| Özellik | Değer |
| --- | --- |
| Yükseklik | 52 (küçük: 40) |
| İç pay | 0 20 |
| Yazı | Plus Jakarta Sans 16/600 |
| Birincil | lacivert, beyaz yazı |
| Accent / CTA | mercan `#E4572E`, beyaz yazı (büyük CTA kuralı) |
| İkincil | turkuaz `#0E7C78`, beyaz |
| Hayalet | şeffaf, kenar `border` |
| Soft | `#D8F1EF` / `#0A4F4D` |
| Pasif | opacity 0,45 |
| Basılı | scale 0,98; reduced-motion’da yok |
| Blok | `.am-btn--block` genişlik 100% |

## Alan ve arama `.am-input` / `.am-search`

Yükseklik 48, yarıçap 14, zemin raised beyaz, kenar, elev-1. Odakta mercan kenar + odak halkası. Arama: sol ikon, sağ filtre/temizle 36 px.

## Çip `.am-chip`

Yükseklik 40, yatay 14 pay, hap. Varsayılan kart zemini; seçili lacivert; filtre `#D8F1EF` / `#0A4F4D`. Yatay kaydırma `.am-chips`.

## Rozet `.am-badge`

Yükseklik 20, 11 px bold, uppercase, 8 px yatay pay.

| Tür | Kullanım |
| --- | --- |
| `sample` | Örnek — zorunlu demo etiketi |
| `new` | Yeni (puan yerine) |
| `soon` | Yakında (v2 özellik) |
| `confirmed` | Onaylı (lacivert / krem) |
| `pending` | Onay bekliyor (yumuşak mercan + mercan nokta; sol şerit hapta kullanılmaz) |
| `free` | Boş saat |
| `cancelled` | İptal |

## Kartlar

**İşletme `.am-biz`:** 228 × (foto 148 + gövde). Foto üzerinde Örnek / Yeni solda, kalp sağda. Meta tek satır, ellipsis. Slot hapı turkuaz soft.

**Satır `.am-biz--row`:** foto 112×112, Örnek rozeti başlık yanında, kalp fotoğrafın sağ üstünde.

**Etkinlik `.am-event`:** 252, foto 132, Yakında gövdede.

**Randevu `.am-appt`:** 56×56 tarih karesi + metin + rozetler. Bekleyen: sol mercan inset 3 px (kart dikdörtgen).

## Alt sekme `.am-tabbar`

Yükseklik 56 + 20 home indicator. Dört sekme: Keşif, Randevu, Favori, Hesap. Aktif lacivert, 600. Zemin krem %98, blur, elev-3, üst çizgi. `position: absolute` telefon çerçevesinin altında.

## Bottom sheet `.am-sheet`

Üst yarıçap 24, max yükseklik %78, kaydırılabilir, elev-5. Handle 36×4. Overlay `rgba(15,44,68,0.44)`.

## Slot ve tarih

Tarih: 56×68, seçili lacivert. Slot: 44 yükseklik, 4 sütun. Boş: turkuaz soft / `#0A4F4D`. Seçili: lacivert. Kapalı: muted, üstü çizili.

## Segment `.am-seg`

Yükseklik 44, hap kutu, seçili beyaz yüzey + elev-1.

## İskelet `.am-skel`

Shimmer 1,4 s. `prefers-reduced-motion` ile durur.

## Boş durum `.am-empty`

Kabuki 160 px (kaynak 512). Başlık 20/28 bold, gövde 14 muted, CTA birincil.

## Toast `.am-toast`

Lacivert zemin, krem yazı, yarıçap 14, elev-4, tab bar üstünde.

## Liste satırı ve avatar

Satır min 56, alt çizgi divider. Avatar 44 (büyük 72), lacivert daire, baş harf.

## Header

Yükseklik 56, sticky. Geri / ikon düğmesi 44 daire. Konum satırı Plus Jakarta 18/700.
