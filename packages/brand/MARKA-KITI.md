> **Logo (10 Kasım 2026):** Logo A (wordmark) **kesinleşti**. Kaynak: `logo-v3/final/`. Dev kılavuzu: `logo-v3/final/LOGO-DEV.md`. Renk paleti henüz seçilmedi (iki seçenek: `palet/`); mevcut renk jetonları geçerlidir, landing palete çekilmedi.

# Ada Merkez — Marka Kiti

**Tarih:** 10 Kasım 2026 (Asia/Famagusta)  
**Sahip:** KIRMIZIYÜZ Live Development Software LTD  
**Ürün:** Kuzey Kıbrıs ve Türkiye için süper uygulama (işletme keşfi, randevu/rezervasyon, WhatsApp AI rezervasyonu, QR menü, POS, bilet, öğrenci indirimi)  
**Bu belge:** Tasarım botu, Logo A kesin. Dev botu jetonlar için `tokens.json` ve `tokens.css`, logo için `logo-v3/final/` dosyalarını kullanır.

## 1. Seçilen yön

**Logo A — wordmark (kesin, 10 Kasım 2026).** «ADA MERKEZ» tek satır, Barlow Condensed 700. İlk A’nın enine çubuğunda, çubuğa oturan mercan kare (`#E4572E`). Yazı lacivert (`#0F2C44`); koyu zeminde yazı krem (`#F7F4EF`), kare mercan kalır. Yazılar SVG’de path’tir.

Favicon ve uygulama ikonu wordmark’ın ilk A harfidir: mercan kare zemin, lacivert A, çubuktaki işaret krem (mercan zeminde görünsün diye). Koyu ikon: gece laciverti zemin, krem A, mercan işaret.

Önceki pin/ada ve sembol denemeleri arşivdedir (`logo-v2/`, `logo-v3/varyant-b-monogram/`, `logo-v3/varyant-c-sembol/`). Ürüne uygulanmaz.

İsteğe bağlı slogan (logo kilidine zorunlu değil): **Adanın saati, burada.** Hizmet alanı Kuzey Kıbrıs ve Türkiye'dir; yurt dışında hizmet iddiası yoktur.

## 2. Yazım

- Marka adı: **Ada Merkez** (iki sözcük, baş harfler büyük).
- Kullanılmayan yazımlar: Adamerkez, AdaMerkez, ADA MERKEZ (kısa etiket/kicker dışında), Ada merkez, Ada Merkez’i çarpıtmak.
- İsteğe bağlı slogan (logo kilidine zorunlu değil): **Adanın saati, burada.**
- Alan adı ve fiyat uydurulmaz.

## 3. Logo

### Hikâye
Wordmark, marka adını doğrudan taşır. İlk A’daki mercan kare, “merkez” vurgusudur — keşif ve rezervasyonun toplanma noktası. Ada silueti veya konum pini bu kilidin parçası değildir.

### Ana varlıklar
Kaynak: `logo-v3/final/` (SVG + PNG). Dev kılavuzu: `logo-v3/final/LOGO-DEV.md`.

| Dosya | Kullanım |
| --- | --- |
| `ada-merkez-wordmark-renk-seffaf-acik` | Açık zemin, lacivert yazı |
| `ada-merkez-wordmark-renk-seffaf-koyu` | Koyu zemin, krem yazı |
| `ada-merkez-wordmark-acik-zemin` / `…-koyu-zemin` | 1024² hazır sahne |
| `ada-merkez-a-isaret-renk-seffaf-acik` / `…-koyu` | Yalnız ilk A (şeffaf) |
| `ada-merkez-ikon-1024` / `…-koyu` | Uygulama ikonu, %22 köşe |
| `ada-merkez-ikon-kare` | Köşesiz mercan kare |
| `ada-merkez-ikon-maskable-512` / `…-koyu` | Maskable, güvenli bölge |
| `ada-merkez-apple-touch-icon` | 180×180, opak mercan |
| `ada-merkez-favicon-16` / `32` / `48` (+ koyu) ve `favicon.ico` | Sekme |

Paylaşılan kopyalar (arayüz yolları değişmedi): `ui/shared/logo/`. Form / QR / sosyal yer tutucu `assets/logo.svg` wordmark A ile değiştirildi.

Wordmark fontu **Barlow Condensed Bold**’dur. UI başlık fontu Plus Jakarta Sans’tır; wordmark’ı Plus Jakarta veya başka bir fontla yeniden dizmeyin.

### Koruma alanı
Wordmark’ın çevresinde **mercan karenin kenar uzunluğu kadar** boşluk bırakın (cap yüksekliğinin yaklaşık %10’u). Kenar, fotoğraf veya başka logo bu alana girmesin.

### En küçük boyut
- Wordmark: 28 px yükseklik (dijital); 24 px’in altına düşmeyin
- İlk A işareti: 24 px yükseklik
- Favicon: 16 px’te verilen çizim kullanılır; 1024’ü küçültmeyin
- Baskı: wordmark en az 8 mm yükseklik

### Yanlış kullanımlar
- Logoyu esnetmek, döndürmek, eğmek, 3B gölge veya kontur eklemek
- Çubuktaki mercan kareyi kaldırmak veya başka bir şekle çevirmek
- Wordmark’ın tamamını uygulama ikonu yapmak
- Onaylı wordmark fontu dışında bir fontla wordmark’ı yeniden yazmak
- Düşük kontrastlı zemine yerleştirmek (ör. mercan kare ikonu kırmızı/turuncu fotoğrafın üstüne koymak)
- LiveDev yeşilini (`#00D26A`) işaretin veya wordmark’ın rengi yapmak
- Ada Kampüs turkuazı / güneş sarısını Ada Merkez logosuna katmak

## 4. Renk paleti

**Seçilen palet (10 Kasım 2026, karma):** Zemin `#F8F0E3`, kart `#FFF8F0` (Sıcak Kum); ikincil turkuaz `#0E7C78` ve yumuşak `#D8F1EF` (Akdeniz Turkuaz). Lacivert `#0F2C44` ve mercan `#E4572E` aynen. Kum altını yok. Jetonlar `tokens.json` / `tokens.css` v1.4.

Karşıtlık (WCAG 2.1, hesaplandı): lacivert / kum 12,68:1 AAA; lacivert / kart 13,62:1 AAA; turkuaz `#0E7C78` / kum **4,45:1** (yalnız büyük yazı / UI — küçük metinde AA tutmaz); turkuaz / kart 4,78:1 AA; turkuaz / beyaz 5,03:1 AA; turkuaz koyu `#0A4F4D` / kum 8,29:1 AAA. **Kural:** kicker, bağlantı ve küçük gövde metninde `#0A4F4D` kullan. `#0E7C78` büyük yazı, dolu düğme ve kart yüzeyi içindir. Mercan / kum 3,26:1 (yalnız büyük CTA). Ayrıntı: `palet/README.md`.

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
| Kum (sıcak) | `#F8F0E3` | Açık zemin |
| Kart kremi | `#FFF8F0` | Kart ve form yüzeyi |
| Deniz turkuazı | `#0E7C78` | İkincil, büyük yazı / dolu düğme |
| Turkuaz koyu | `#0A4F4D` | Küçük metin, kicker, bağlantı |
| Turkuaz yumuşak | `#D8F1EF` | Yumuşak dolgu |
| Kum koyu | `#E8DCC8` | İkincil yüzey |
| Krem | `#FFF8F0` | Kart / yumuşak vurgu |

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
| Wordmark (Logo A) | **Barlow Condensed** | 700 | Path; kopya: `logo-v3/kaynak/fonts`. UI’de wordmark olarak yeniden dizilmez |
| Başlık / buton | **Plus Jakarta Sans** | 600–700 | Türkçe glifler doğrulandı |
| Wordmark (v1 varlıkları) | **Outfit** | 700 | v1 logo ve Marka Kiti v1 sunumunda kaldı; yeni kilitlerde kullanılmaz |
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

- `/workspace/ada-merkez/tasarim/tokens.json` — renk (açık/koyu), tipografi, aralık, köşe, gölge, logo ve seçilen palet (v1.4)
- `/workspace/ada-merkez/tasarim/tokens.css` — CSS değişkenleri (`--am-*`), `[data-theme="light"|"dark"]`
- `/workspace/ada-merkez/tasarim/logo-v3/final/` — kesin logo ve ikon seti
- `/workspace/ada-merkez/tasarim/logo-v3/final/LOGO-DEV.md` — yollar, min boyut, boşluk
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
  logo-v2/
    kaynak/build.py, fonts/, island verisi
    varyant-a-monogram/  (svg + png: sembol, yatay, dikey, tek renk)
    varyant-b-pin-ada/
    varyant-c-pusula/
    onerilen/            (B kopyası + ikon 1024, maskable, apple-touch 180, favicon 16/32/48 svg+png+ico)
    karsilastirma/ada-merkez-logo-v2-karsilastirma-1920x1080.png
    canva/               (v2 içe aktarım HTML’leri)
  logo-v3/
    final/               (KESİN Logo A: svg, png, ico, LOGO-DEV.md)
    varyant-a-wordmark/  (üretim kaynağı)
    canva/               (Logo v3 sunum ve varlıklar)
  palet/
    palet-1.json, palet-2.json, README.md
    palet-secenekleri-1920x1080.png
```

Logolar SVG olarak kodlandı; PNG’ye `cairosvg` ile çevrildi. GPT/AI görsel üretimi kullanılmadı. Ada silueti Natural Earth 10m (`cyprus.geojson`) kaynağından sadeleştirildi.

## 10. Canva

Klasör: **Ada Merkez** — https://www.canva.com/folder/FAHaiS-mJdY (`FAHaiS-mJdY`)

HTML (Google Fonts Plus Jakarta Sans + Inter, gerçek metin + PNG’ler) yerelde sunulup `import-design-from-url` ile katmanlı içe aktarıldı. Logo SVG’leri `upload-asset-from-url` ile kütüphane varlığı olarak yüklenir (ham SVG `import-design-from-url` invalid_file verir). Kimlikler: `marka-kiti/canva/canva_ids.json`, `logo-v3/canva/canva_ids.json`, `palet/canva/`.

| Tasarım | ID | Boyut | Düzenle | Görüntüle |
|---|---|---|---|---|
| Ada Merkez — Marka Kiti v1 | DAHaiQRSwtM | 1920×1080 | https://www.canva.com/d/NbsvQPgNTCJHosz | https://www.canva.com/d/D1eXrnTwi5q2Z9c |
| Ada Merkez — Yatay logo (açık zemin) | DAHaiWZZbXk | 1024×1024 | https://www.canva.com/d/jbAUFL95uDzVWUm | https://www.canva.com/d/twEFA3jxS2DAJ7z |
| Ada Merkez — Yatay logo (koyu zemin) | DAHaiVrxx94 | 1024×1024 | https://www.canva.com/d/KRmOO01oTjRBFBS | https://www.canva.com/d/p8z7Y-NjzgeH57l |
| Ada Merkez — Uygulama ikonu | DAHaiY-8UHQ | 1024×1024 | https://www.canva.com/d/xL-iBvEfJRIeUEv | https://www.canva.com/d/j3bMv9M-SJDEjK9 |
| Ada Merkez — Logo v2 karşılaştırması | DAHaivEJodI | 1920×1080 | https://www.canva.com/d/j_Gep0NRMgqKDmQ | https://www.canva.com/d/gPNzFofRd2pzgw0 |
| Ada Merkez — Logo v2 yatay (açık zemin) | DAHaiuP5jhs | 1024×1024 | https://www.canva.com/d/hemMBz--6v1EYNP | https://www.canva.com/d/CinSxaaUvMBemed |
| Ada Merkez — Logo v2 yatay (koyu zemin) | DAHaih_sNW8 | 1024×1024 | https://www.canva.com/d/oU3hRO8au0HMsyh | https://www.canva.com/d/0jCk1EflP9qYuzC |
| Ada Merkez — Logo v2 uygulama ikonu | DAHaivHbdkM | 1024×1024 | https://www.canva.com/d/Ntt7rZJh1qZtuiN | https://www.canva.com/d/lWKYKEjEU-zcjYx |

Kısa düzenleme bağlantıları API çağrısına göre değişir; kararlı kimlik tasarım ID’sidir. v2 kimlikleri ayrıca `logo-v2/canva/canva_ids.json` içinde.

`get-design-content` ile metinler düzenlenebilir göründü; Türkçe karakterler sağlam (Lefkoşa, Karşılaştırma, Önerilen, İKONU). Kart etiketlerindeki büyük İ kaybı (ZEMIN/IKONU/LACIVERT) 10 Kasım 2026’da yerinde düzeltildi: ZEMİN, İKONU, LACİVERT. Marka Kiti v1 kicker’ı “Kuzey Kıbrıs ve Türkiye için süper uygulama” olarak güncellendi; kısaltılmış ülke kodu metinden çıkarıldı.
