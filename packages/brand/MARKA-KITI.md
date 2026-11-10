# Ada Merkez — Marka Kiti v1

**Tarih:** 10 Kasım 2026 (Asia/Famagusta)  
**Sahip:** KIRMIZIYÜZ Live Development Software LTD  
**Ürün:** Kuzey Kıbrıs ve Türkiye için süper uygulama (işletme keşfi, randevu/rezervasyon, WhatsApp AI rezervasyonu, QR menü, POS, bilet, öğrenci indirimi)  
**Bu belge:** Tasarım botu, v1. Dev botu jetonlar için `tokens.json` ve `tokens.css` dosyalarını kullanır.

## 1. Seçilen yön

**Ada'nın merkez noktası.** İşaret, klasik bir konum pinidir; başının içinde sadeleştirilmiş Kıbrıs adası silueti, Lefkoşa civarına düşen koyu bir nokta ise “merkez”i temsil eder. Ada Kampüs’ün “A harfinin içindeki pin + altta ada + turkuaz/sarı” dilinden ve liveDevelopment’ın yeşil “canlı nokta”sından ayrılır; aynı ailede kalır çünkü ada silueti, konum pini ve (yalnızca başarı/canlı durum rengi olarak) `#00D26A` korunur. Mercan pin + lacivert zemin, keşif/rezervasyon ürününe sıcak bir Akdeniz kimliği verir; işaret sade olduğu için uygulama ikonuna, favicon’a ve tek renk basıma iner.

Üç konsept denendi (klasik ada+pin, pin içinde ada, ada+merkez halka). **Seçilen: varyant B — pin içinde ada.** Karşılaştırma: `marka-kiti/varyantlar/karsilastirma.png`.

## 2. Yazım

- Marka adı: **Ada Merkez** (iki sözcük, baş harfler büyük).
- Kullanılmayan yazımlar: Adamerkez, AdaMerkez, ADA MERKEZ (kısa etiket/kicker dışında), Ada merkez, Ada Merkez’i çarpıtmak.
- İsteğe bağlı slogan (logo kilidine zorunlu değil): **Ada'nın merkezi.**
- Alan adı ve fiyat uydurulmaz.

## 3. Logo

### Hikâye
Pin = keşif ve konum. Ada = Kıbrıs. Nokta = Lefkoşa / “merkez”: tüm hizmetlerin toplandığı yer.

### Ana varyantlar
| Dosya (SVG + aynı adlı PNG) | Kullanım |
|---|---|
| `logo/svg/ada-merkez-sembol.svg` | Şeffaf zeminli renkli işaret |
| `logo/svg/ada-merkez-yatay-acik-zemin.svg` | Açık (kum) zemin, yatay kilit |
| `logo/svg/ada-merkez-yatay-koyu-zemin.svg` | Koyu zemin, yatay kilit |
| `logo/svg/ada-merkez-yatay-renk-seffaf-acik.svg` | Şeffaf, lacivert yazı (açık zemine) |
| `logo/svg/ada-merkez-yatay-renk-seffaf-koyu.svg` | Şeffaf, beyaz yazı (koyu zemine) |
| `logo/svg/ada-merkez-dikey-acik-zemin.svg` | Dikey kilit, kum zemin |
| `logo/svg/ada-merkez-dikey-koyu-zemin.svg` | Dikey kilit, koyu zemin |
| `logo/svg/ada-merkez-ikon.svg` | Uygulama ikonu (yuvarlatılmış kare, lacivert zemin) |
| `logo/svg/ada-merkez-ikon-kare.svg` | Kare ikon (köşe yuvarlatmasız) |
| `logo/svg/ada-merkez-ikon-seffaf.svg` | Şeffaf ikon (yalnız işaret) |
| `logo/svg/ada-merkez-sembol-tek-renk-koyu.svg` | Tek renk lacivert (ada deliklidir) |
| `logo/svg/ada-merkez-sembol-tek-renk-beyaz.svg` | Tek renk beyaz |
| `logo/svg/ada-merkez-yatay-tek-renk-koyu.svg` | Yatay, tek renk lacivert |
| `logo/svg/ada-merkez-yatay-tek-renk-beyaz.svg` | Yatay, tek renk beyaz |
| `logo/svg/ada-merkez-dikey-tek-renk-koyu.svg` | Dikey, tek renk lacivert |
| `logo/svg/ada-merkez-dikey-tek-renk-beyaz.svg` | Dikey, tek renk beyaz |
| `logo/svg/ada-merkez-favicon-512.svg` | Favicon master |
| `logo/svg/ada-merkez-favicon-32.svg` | 32 px (ada sadeleşir) |
| `logo/svg/ada-merkez-favicon-16.svg` | 16 px (yalnız pin + krem delik) |

Wordmark fontu Outfit Bold’dur; SVG’lerde yazılar path’e çevrilmiştir (font yüklemeye gerek yoktur).

### Koruma alanı
İşaretin çevresinde **pin başı yarıçapı kadar** (sembol yüksekliğinin yaklaşık %36’sı) boşluk bırakın. Yatay kilitte bu boşluk, “M” harfi yüksekliği kadarıyla da ölçülebilir. Kenar, fotoğraf veya başka logo bu alana girmesin.

### En küçük boyut
- Sembol: 24 px yükseklik (dijital)
- Yatay kilit: 28 px yükseklik
- Favicon: 16 px’te sadeleştirilmiş çizim kullanılır; renkli tam adayı 16 px’e küçültmeyin
- Baskı: sembol en az 8 mm yükseklik

### Yanlış kullanımlar
- Logoyu esnetmek, döndürmek, eğmek, 3B gölge veya kontur eklemek
- Pin, ada ve nokta renklerini değiştirmek (onaylı tek renk versiyonlar hariç)
- Ada siluetini başka bir ada/ülke haritasıyla değiştirmek
- Noktayı kaldırmak veya pin’in dışına taşımak
- Outfit dışında bir fontla wordmark’ı yeniden yazmak
- Düşük kontrastlı zemine yerleştirmek (ör. mercan pin’i kırmızı/turuncu fotoğrafın üstüne koymak)
- LiveDev yeşilini (`#00D26A`) işaretin veya wordmark’ın rengi yapmak
- Ada Kampüs turkuazı / güneş sarısını Ada Merkez logosuna katmak
- Eski veya “eğlenceli sticker” stilinde gölgeli ada çizmek

## 4. Renk paleti

### Birincil ve vurgu
| Ad | Hex | Rol |
|---|---|---|
| Ada Laciverti | `#0F2C44` | Birincil, metin, ikon zemini |
| Gece Laciverti | `#0A1624` | Koyu mod zemin |
| Akdeniz Mavisi | `#1F6A8F` | İkincil, bağlantı, harita |
| Merkez Mercanı | `#E4572E` | Vurgu, pin, birincil CTA biçimi |
| Mercan koyu | `#C2410C` | Açık zeminde mercan metin (AA) |
| Mercan açık | `#F07A52` | Koyu zeminde hover / vurgu |
| Mercan yumuşak | `#F4D6C8` | Açık zeminde yumuşak dolgu |
| Kum | `#F7F4EF` | Açık zemin |
| Kum koyu | `#EDE8E0` | İkincil yüzey |
| Krem | `#FFF8F3` | Ada silueti (işaretin içinde) |

### Nötrler
`#F7F4EF` 50 · `#EDE8E0` 100 · `#D6D0C6` 200 · `#B8B2A8` 300 · `#8C877E` 400 · `#6B665E` 500 · `#4A463F` 600 · `#2F2C28` 700 · `#1C1A17` 800 · `#12110F` 900

### Anlamlı renkler (açık / koyu)
| Rol | Açık zemin (metin/dolgu) | Koyu zemin |
|---|---|---|
| Başarı / canlı | `#007A3D` | `#00D26A` (liveDevelopment yeşili) |
| Uyarı | `#A16207` | `#E8A317` |
| Hata | `#C62828` | `#FF8A80` |
| Bilgi | `#1E6AA6` | `#7EC4F0` |

`#00D26A` aile işaretidir: onaylı rezervasyon, “canlı” durum, başarı dolgusu (koyu zemin). Açık zeminde küçük yazı olarak kullanılmaz; bunun yerine `#007A3D` yazılır.

### WCAG kontrast notları
Ölçümler normal metin için 4,5:1 (AA), büyük yazı / UI için 3:1.

| Çift | Oran | Not |
|---|---|---|
| `#0F2C44` üzerinde `#FFFFFF` / `#F7F4EF` | 14,34 / 13,07 | AAA |
| `#1F6A8F` üzerinde `#FFFFFF` | 5,97 | AA |
| `#E4572E` üzerinde `#FFFFFF` | 3,68 | Yalnız büyük yazı / büyük CTA; küçük yazıda `#C2410C` |
| `#FFFFFF` üzerinde `#E4572E` | 3,68 | Aynı kural; mercan dolguda yazı mümkünse lacivert veya büyük punto beyaz |
| `#007A3D` üzerinde `#FFFFFF` | 5,45 | AA (açık zemin başarı yazısı) |
| `#00D26A` üzerinde `#FFFFFF` | 2,01 | Yetersiz — açık zeminde başarı yazısı olarak kullanma |
| `#00D26A` üzerinde `#0F2C44` / `#0A1624` | 7,12 / 9,04 | AA / AAA |
| `#C62828` üzerinde `#FFFFFF` | 5,62 | AA |
| `#FF8A80` üzerinde `#0A1624` | 7,98 | AA |
| `#A16207` üzerinde `#FFFFFF` | 4,92 | AA |
| `#E8A317` üzerinde `#0A1624` | 8,40 | AA (koyu zemin uyarı) |
| `#E8A317` üzerinde `#FFFFFF` | 2,17 | Yetersiz |
| `#1E6AA6` üzerinde `#FFFFFF` | 5,73 | AA |
| `#7EC4F0` üzerinde `#0A1624` | 9,57 | AA |
| `#6B665E` üzerinde `#F7F4EF` | 5,19 | AA (ikincil metin) |
| `#E4572E` üzerinde `#0A1624` | 4,94 | AA (koyu zeminde mercan yazı/ikon) |

## 5. Tipografi

Google Fonts, Türkçe karakterler (ğ, ü, ş, ı, i, ö, ç ve büyükleri) doğrulandı.

| Rol | Font | Ağırlık | Not |
|---|---|---|---|
| Başlık / wordmark / buton | **Outfit** | 600–700 | `/workspace/ld-canva/fonts`, `/workspace/fonts` dışındaki kopya: `marka-kiti/sunum/fonts` |
| Gövde / arayüz / form | **Inter** | 400–600 | `/workspace/fonts/inter319` |

Ölçek (px): 12 / 14 / 16 / 18 / 20 / 24 / 32 / 40 / 48 / 64. Gövde satır yüksekliği 1,5; başlık 1,1–1,2. Harf aralığı başlıkta hafif negatif (−0,02em).

Ada Kampüs’ün Baloo 2 ve Kaushan Script fontları Ada Merkez’de kullanılmaz.

## 6. Aralık, köşe, gölge

- Aralık birimi: **4 px**. Ölçek: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96.
- Köşe: sm 4, md 8, lg 12, xl 16, 2xl 24, full 9999. Uygulama ikonu köşesi: **%22**.
- Gölge: `sm` / `md` / `lg` (lacivert tint) ve CTA için `pin` (mercan tint). Değerler `tokens.json` ve `tokens.css` içinde.

## 7. Komşu markalar (çakışmama)

| Marka | Palet / işaret | Ada Merkez’de |
|---|---|---|
| liveDevelopment | `#00D26A`, siyah/beyaz, “canlı nokta” | Yeşil yalnız başarı/canlı durum |
| Ada Kampüs | `#004D40`, `#1B9E91`, `#FFC629`, Baloo 2 / Kaushan, ada+pin (A’nın içinde) | Turkuaz, sarı ve o fontlar yok; pin/ada motifi ters çevrildi (ada pin’in içinde) |
| CyQRMenu, live-chat-bot | Bu kutuda marka kiti bulunamadı | Çakışma denetimi yapılamadı; palet bilinçli olarak lacivert+mercan tutuldu |

## 8. Dev botu için dosyalar

- `/workspace/ada-merkez/tasarim/tokens.json` — renk (açık/koyu), tipografi, aralık, köşe, gölge
- `/workspace/ada-merkez/tasarim/tokens.css` — CSS değişkenleri (`--am-*`), `[data-theme="light"|"dark"]`
- Bu belge: kullanım kuralları

Saat dilimi jetonu: `Europe/Nicosia` (PLAN.md ile uyumlu).

## 9. Dosya listesi

```
/workspace/ada-merkez/tasarim/
  MARKA-KITI.md
  tokens.json
  tokens.css
  marka-kiti/
    kaynak/build.py
    kaynak/island.json
    logo/svg/*.svg
    logo/png/*.png
    varyantlar/          (A/B/C konseptleri + karsilastirma.png)
    sunum/ada-merkez-marka-kiti-1920x1080.png
    sunum/ada-merkez-marka-kiti.html
    canva/               (içe aktarım HTML’leri)
```

Logolar SVG olarak kodlandı; PNG’ye `cairosvg` ile çevrildi. GPT/AI görsel üretimi kullanılmadı. Ada silueti Natural Earth 10m (`cyprus.geojson`) kaynağından sadeleştirildi.

## 10. Canva

Klasör: **Ada Merkez** — https://www.canva.com/folder/FAHaiS-mJdY (`FAHaiS-mJdY`)

HTML (Google Fonts Outfit + Inter, gerçek metin + işaret PNG’leri) yerelde sunulup `import-design-from-url` ile katmanlı içe aktarıldı. Kimlikler: `marka-kiti/canva/canva_ids.json`.

| Tasarım | Boyut | Düzenle | Görüntüle |
|---|---|---|---|
| Ada Merkez — Marka Kiti v1 | 1920×1080 (presentation) | https://www.canva.com/d/cUSUjbeVzsfLgl7 | https://www.canva.com/d/qxOxtp6tkyyzgEl |
| Ada Merkez — Yatay logo (açık zemin) | 1024×1024 | https://www.canva.com/d/AVUEBBUQuCbwPVv | https://www.canva.com/d/vRP2IVwXIEqJLRt |
| Ada Merkez — Yatay logo (koyu zemin) | 1024×1024 | https://www.canva.com/d/XY004_eXGV3Rm9a | https://www.canva.com/d/t5VmhQXA7cBvvvG |
| Ada Merkez — Uygulama ikonu | 1024×1024 | https://www.canva.com/d/IDVbCn4Dkktbg2E | https://www.canva.com/d/8WAxlx3dnZ3G3cQ |

`get-design-content` ile metinler düzenlenebilir göründü; Türkçe karakterler sağlam. Kart etiketlerindeki büyük İ kaybı (ZEMIN/IKONU/LACIVERT) 10 Kasım 2026’da yerinde düzeltildi: ZEMİN, İKONU, LACİVERT.
