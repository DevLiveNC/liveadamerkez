# Ada Merkez — Bileşen spesifikasyonları

Tarih: 10 Kasım 2026 (Asia/Famagusta)  
Kaynak jetonlar: `tokens.json`, `tokens.css` (v1.1, geriye uyumlu hareket/ızgara eklentisi)  
Görsel örnekler: `/workspace/ada-merkez/tasarim/ui/`  
Logo: önerilen v2, varyant B — `logo-v2/onerilen/`  
Yazı: başlık **Plus Jakarta Sans** 600–700, gövde **Inter** 400–600.

Bu belge Dev botu içindir. Ölçüler pikseldir; 4 px aralık birimine oturur. Renk adları `tokens.json` yollarıyladır (`color.light.*` / `color.dark.*`).

## Ortak hareket

| Jeton | Süre | Easing |
|---|---|---|
| `--am-motion-fast` | 120 ms | `--am-ease-press` (basış), `--am-ease-out` (renk) |
| `--am-motion-base` | 180 ms | `--am-ease-out` cubic-bezier(0.16, 1, 0.3, 1) |
| `--am-motion-medium` | 240 ms | `--am-ease-out` veya `--am-ease-in-out` |
| `--am-motion-slow` | 320 ms | `--am-ease-out` |

Basış: `scale(0.98)` + `translateY(1px)`, 120 ms press easing, bırakınca 180 ms out.  
Odak halkası: `--am-focus-ring` (beyaz 3 px + mercan 5 px). Klavye odağında her zaman görünür; yalnızca `:focus-visible`.  
`prefers-reduced-motion: reduce` iken süre 0.01 ms, ölçek yok.

## 1. Buton (`.btn`)

| Boyut | Yükseklik | Yatay dolgu | Yazı |
|---|---|---|---|
| sm | 36 | 14 | Plus Jakarta Sans 600 / 13 |
| md (varsayılan) | 44 | 20 | 600 / 15, letter-spacing −0.01em |
| lg | 52 | 28 | 600 / 16 |
| block | genişlik %100 | — | — |

Köşe: `radius.full`. İkon + metin boşluğu 8 px.

| Tür | Dolgu | Metin | Kenar | Gölge | Hover |
|---|---|---|---|---|---|
| coral (birincil CTA) | `accent` `#E4572E` | `#fff` (lg yazı; 14 px altı için lacivert tercih) | yok | `shadow.pin` | `accentHover` `#C2410C` |
| navy | `primary` `#0F2C44` | `onPrimary` | yok | yok | `primaryHover` |
| ghost | şeffaf | `text` | `border` | yok | zemin `#fff`, kenar navy |
| ghost on-dark | şeffaf | sand | sand %28 | yok | sand %8 dolgu |

Durumlar: default, hover, active (basış), focus-visible, disabled (opaklık 0.4, `pointer-events: none`).  
Erişilebilirlik: gerçek `<button>` veya `a` ile anlamlı ad; yalnızca ikon ise `aria-label`. Kontrast: mercan üzerine küçük yazı kullanma (MARKA-KITI).

## 2. Input / arama

Yükseklik 40–44 px, köşe 12 px (arama çubuğunda tam kapsül `radius.full`).  
Kenar `border`, zemin `surface` veya sand, iç yazı `text`, yer tutucu `textMuted`.  
Etiket: Inter 600 / 11, letter-spacing 0.06em, büyük harf.  
Odak: kenar navy veya mercan halka, 120 ms. Hata: kenar `danger`, yardım metni 12 px `danger`.  
Disabled: zemin `surfaceMuted`.  
Erişilebilirlik: görünür `<label>`, hata `aria-describedby` + `aria-invalid`.

Landing arama şeridi (masaüstü): 12 kolon, dört hücre (şehir / ne / ne zaman / CTA), yükseklik 76 px, gölge `md`.

## 3. Kart (`.card`)

Zemin `surface`, kenar `border`, köşe `radius.xl` (16), gölge `sm`.  
Hover (tıklanabilirse): 180 ms, gölge `md`, `translateY(-2px)`.  
İç boşluk 16–24 px.

## 4. İşletme kartı (`.biz`)

Izgara: 48 px avatar + içerik + slot hapı. Dikey dolgu 12, alt kenar çizgisi `border`.  
Avatar: 48×48, köşe 14, Plus Jakarta Sans 700 / 16, açık renk harf (gerçek fotoğraf yok; baş harf).  
Başlık: display 600 / 14. Alt satır: Inter 12, `textMuted`.  
Slot hapı (`.slot-pill`): 11 / 600, beyaz zemin, kapsül, `border`. Metin örn. `Uygun 11:00` — “ilk/tek” iddiası yok.  
Yasak: uydurma puan, yorum sayısı, işletme sayısı. İşletme adı örnekse “Örnek …” ve “tasarım önizlemesi” notu.

## 5. Saat seçici (`.slots`, `.date`)

Tarih şeridi: eşit sütunlar, 8 px dolgu, köşe 12, kenar `border`. Seçili: navy zemin, beyaz yazı, 120 ms.  
Saat ızgarası: 3 kolon (mobil), boşluk 8. Hücre yüksekliği 40, köşe 10, yazı 13 / 600, `tabular-nums`.  

| Durum | Görünüm |
|---|---|
| boş | beyaz, kenar `border`; hover kenar navy |
| seçili (`.on`) | navy zemin, beyaz |
| dolu (`.off`) | `surfaceMuted`, `textSubtle`, üstü çizili, `disabled` |

Saat dilimi her zaman Europe/Nicosia. Mikro: seçim 120 ms out; basış 0.98 ölçek.

## 6. Rozet (`.badge`, `.chip`)

Chip yükseklik 28, yatay 10, kapsül, 13 / 500.  
Rozet yükseklik 22, yatay 8, 12 / 600.

| Ad | Zemin | Yazı | Kullanım |
|---|---|---|---|
| chip-navy | navy | beyaz | seçili filtre / durum |
| chip-coral / badge-soon | `accentSoft` | `coralDark` | **Yakında** (yalnız v2 özellik: QR menü, POS, bilet, öğrenci indirimi) |
| chip-live / badge-ok | `successSubtle` | `success` | onay, canlı (nokta `live` `#00D26A`, açık zeminde yazı `#007A3D`) |
| badge-wait | `warningSubtle` | `warning` | onay bekliyor |
| badge-info | `infoSubtle` | `info` | incelemede |
| badge-muted | `surfaceMuted` | `textMuted` | ikincil |

## 7. Sekme (`.app-tabbar`, `.m-tabs`)

Mobil alt bar: yükseklik 64–72, 4 eşit sütun, beyaz zemin, üst kenar `border`.  
İkon 22, etiket 10 / 500; seçili 600 navy.  
Masaüstü yan menü: 240 px, zemin `navyDeep`, satır 10×12, köşe 10, seçili zemin sand %8.  
Geçiş: renk 180 ms. `aria-current="page"` veya `aria-label` ile gezinme adı.

## 8. Tablo (`.table`)

Beyaz zemin, dış kenar, köşe 16, hücre 12×16, gövde 14.  
Başlık: 11 / 600, uppercase, letter-spacing 0.06em, `textMuted`, zemin sand.  
Satır ayırıcı `border`. Hover (isteğe bağlı): sand %60.  
Erişilebilirlik: `<table>`, `<th scope="col">`, satır eylemleri düğme adıyla.

## 9. Modal

Katman `--am-z-modal` (70), perde `--am-z-overlay` (60), renk navyDeep %48.  
Perde: 240 ms opacity. İçerik: 240 ms out, `scale(0.98)→1`, köşe 24, gölge `lg`, max genişlik 480, iç 24–32.  
Kapat: kaçış, perde tıklaması, görünür kapat düğmesi. Odak tuzağı; açılınca ilk alana, kapanınca tetikleyiciye dönüş.  
`role="dialog"` + `aria-modal="true"` + başlık `aria-labelledby`.

## 10. Toast

Katman 80. Köşe 12, gölge `md`, min yükseklik 48, iç 12×16.  
Başarı: `successSubtle` / `success`. Hata: `dangerSubtle` / `danger`. Bilgi: `infoSubtle`.  
Giriş: 320 ms out, `translateY(8px)→0`. Kalış önerisi 4 sn; hata otomatik kapanmaz.  
`role="status"` (bilgi/başarı) veya `role="alert"` (hata).

## 11. Navigasyon

Landing: yapışkan 72 px (mobil 60), zemin sand %88 + `blur(16px)`, alt kenar, katman 40. Logo yüksekliği 32 (min 28).  
Bölge ifadesi tam olarak **Kuzey Kıbrıs ve Türkiye için**.  
Müşteri PWA üst bar 64 px. İşletme / yönetim: 240 + içerik 12 kolon ızgara.  
Atla bağlantısı: `.skip`, odaklanınca görünür.

## 12. Boş / yükleniyor / hata (`.state`)

Ortak: ortalanmış, dolgu 48×24, başlık display 600 / 18, gövde `textMuted` 14.

| Durum | İçerik | Eylem |
|---|---|---|
| Boş | Kısa açıklama, süs ikon (CSS/SVG, fotoğraf yok) | İsteğe bağlı CTA (ghost veya coral) |
| Yükleniyor | 20 px mercan/navy halka, 800 ms dönüş; `prefers-reduced-motion` ise statik “Yükleniyor” | `aria-busy="true"` |
| Hata | `danger` başlık, ne olduğu, “Yeniden dene” | Odak deneme düğmesine |

İskelet (opsiyonel): `surfaceMuted` çubuklar, 1.2 sn shimmer; azaltılmış harekette sabit zemin.

## 13. Stilize sohbet (WhatsApp yolu)

Resmi WhatsApp arayüzü veya logosu kopyalanmaz.  
Başlık: navy, “Ada Merkez asistanı”, alt satır “Stilize akış · resmi arayüz değil”.  
Gelen balon: beyaz, sola, köşe 16 (sol alt 4). Giden: navy, sağa. Yazı 13.  
Giriş: 180 ms out. Bu bir pazarlama/ürün önizlemesidir, kanal ID’si değildir.

## 14. Ana ekrana ekle (PWA sayfası)

Alt sayfa (sheet), katman 75, 320 ms out, `translateY(100%)→0`.  
İkon 56×56, köşe %22. Birincil “Ekle”, ikincil “Şimdi değil”.  
Bir kez, kullanıcı hareketinden sonra. Mağaza rozeti yok (v1 PWA).

## Metin kuralları (tüm arayüz)

- Yasaklı bölge kısaltması yazılmaz; ülke/bölge: **Kuzey Kıbrıs**. Bölge cümlesi: **Kuzey Kıbrıs ve Türkiye için**.
- Pilot: Lefkoşa, Girne ve Mağusa’da.
- Sosyal etiket: `#KuzeyKıbrıs`.
- Üstünlük iddiası yok. (UI’da “uygun saat” denir.)
- v2 özellikler (QR menü, POS, etkinlik bileti, öğrenci indirimi) **Yakında** rozetiyle.
- Onaylanmamış fiyat, paket, kampanya, alan adı, tarih yazılmaz; gerekirse `[doğrulanacak]`.
- Uydurma puan, yorum, işletme sayısı, uptime yüzdesi yok.

## Referans dosyalar

- `ui/shared/am.css`, `ui/shared/screens.css`, `ui/shared/fonts.css`
- Landing: `ui/landing/index.html`
- Ekranlar: `ui/musteri/`, `ui/isletme/`, `ui/yonetim/`, `ui/pwa/`


## 15. Pazarlama formları (E1)

Alan listesi, doğrulama ve durumlar: [`ui/formlar/SPEC.md`](ui/formlar/SPEC.md).  
Logo bu ekranlarda tek varlık (`formlar/assets/logo.svg`); **kesin değil, yer tutucu**. `tokens.json` `logo.status` silinmez.
