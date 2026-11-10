# Ada Merkez — Landing görsel ve yazı tipi kaynakları

Tarih: 10 Kasım 2026 (Asia/Famagusta)  
Kullanım: tasarım kaynağı, yayın yok. Stok fotoğraflar örnek görseldir; gerçek Ada Merkez işletmesi değildir.

Stok fotoğraflar ve ürün ekranları yapay zekâ ile üretilmedi. Kabuki maskotu Chat GPT ile üretildi; gerçek kişi değildir. Nisa, Yaşar veya tanınabilir kişiler oluşturulmadı.

Canlı dosya yolu: `apps/landing/public/landing/` (WebP). Aşağıdaki adlar sitede sunulan uzantılardır.

## 1. Ürün ekranları (kendi tasarımlarımız)

Kaynak dizin: `tasarim/ui/`  
Canlı kopya: `apps/landing/public/landing/ekran/`

| Dosya | Kaynak | Kullanım |
|---|---|---|
| `kesif-mobil.webp` | `ui/musteri/png/kesif-mobil-390.png` | Hero telefon çerçevesi |
| `rezervasyon-mobil.webp` | `ui/musteri/png/rezervasyon-mobil-390.png` | Yedek / evrak (landing’de doğrudan kullanılmadı; envanterde durur) |
| `takvim-masaustu.webp` | `ui/isletme/png/takvim-1440.png` | İşletmeler için bölümü, ürün ekranı. Üzerinde görünür **Örnek** etiketi vardır. |

Bu ekranlardaki işletme adları zaten “Örnek …” biçimindedir; puan ve yorum yoktur.

## 2. Stok fotoğraflar (Pexels / Unsplash)

Canlı yol: `apps/landing/public/landing/stok/*.webp`  
Kaynak jpg: tasarım paketindeki `ui/landing/assets/stok/`.  
Lisanslar ticari kullanıma açıktır; atıf yazılmıştır. Unsplash+ veya Adobe Stock kullanılmadı.

| Dosya | Kullanım | Fotoğrafçı | Kaynak | Sayfa | Lisans |
|---|---|---|---|---|---|
| `kuafor-salon.webp` | Keşif: Kuaför ve güzellik; örnek kart 1 | Delbeautybox | Pexels, foto 705255 | https://www.pexels.com/photo/705255/ | [Pexels License](https://www.pexels.com/license/) |
| `kuafor-makas.webp` | Örnek kart 2 (Örnek Güzellik) | Nikolaos Dimou | Pexels, foto 1319460 | https://www.pexels.com/photo/1319460/ | [Pexels License](https://www.pexels.com/license/) |
| `klinik-muayene.webp` | Keşif: Klinik; örnek kart 3 ve 4 (farklı kırpma) | Daniel Frank | Pexels, foto 305568 | https://www.pexels.com/photo/305568/ | [Pexels License](https://www.pexels.com/license/) |
| `restoran-servis.webp` | Keşif: Restoran; örnek kart 5 | Pixabay | Pexels, foto 262978 | https://www.pexels.com/photo/262978/ | [Pexels License](https://www.pexels.com/license/) |
| `restoran-sofra.webp` | Örnek kart 6 (Örnek Sofra) | Jay Wennington | Unsplash, `photo-1414235077428-338989a2e8c0` | https://unsplash.com/photos (görsel kimliği: photo-1414235077428-338989a2e8c0) | [Unsplash License](https://unsplash.com/license) |
| `konser-sahne.webp` | Örnek etkinlik kartı 1 (Örnek Sahne, Lefkoşa) | Josh Sorenson | Pexels, foto 976862 | https://www.pexels.com/photo/976862/ | [Pexels License](https://www.pexels.com/license/) |
| `tiyatro-salon.webp` | Örnek etkinlik kartı 2 (Örnek Gösteri, Girne) | JIUN-JE LIN | Pexels, foto 19658083 | https://www.pexels.com/photo/19658083/ | [Pexels License](https://www.pexels.com/license/) |
| `acik-hava-sahne.webp` | Örnek etkinlik kartı 3 (Örnek Açık Hava, Mağusa) | Alec Doualetas | Pexels, foto 29585548 | https://www.pexels.com/photo/29585548/ | [Pexels License](https://www.pexels.com/license/) |

Notlar:

- Pexels 705255 sayfasında fotoğrafçı hesabı **Delbeautybox** olarak geçer. Görsel Del Mar, CA’daki bir salon iç mekânıdır; Ada Merkez’de **örnek görsel** olarak kullanılır, gerçek yerel işletme değildir.
- Pexels 1319460 fotoğrafçısı sayfada **Nikolaos Dimou** olarak geçer.
- Kart 3 ve 4 aynı klinik fotoğrafının farklı `object-position` kırpmalarıdır (ikinci ayrı stok, güvenilir atıfla bulunamadığı için yeni fotoğraf uydurulmadı).
- Unsplash restoran görseli Jay Wennington atıflıdır (`photo-1414235077428-338989a2e8c0`).
- Etkinlik kartları: sahne ışıkları (976862, Josh Sorenson), boş tiyatro salonu (19658083, JIUN-JE LIN; uzakta tanınmayan silüet, öne çıkmaz), boş açık hava sahnesi (29585548, Alec Doualetas). Tanınabilir marka veya kişi öne çıkmaz. Nisa / Yaşar yok.
- Stok fotoğraflarda Nisa / Yaşar yok; stokta yapay zekâ portresi yok.

## 3. Logo

Landing’de **Logo A (kesin)** kullanılır: `apps/landing/public/brand/logo.svg`. Kaynak: `logo-v3/final/`. Dev kılavuzu: `logo-v3/final/LOGO-DEV.md`.

## 4. Maskot

Kabuki (mercan kabuklu caretta), **Chat GPT** ile üretildi; gerçek kişi değildir. Kaynak kare: `tasarim/maskot/gpt/05-kabuki-pozlar.png`. Ürün pozları: `tasarim/maskot/final/`. Canlı kopya: `apps/landing/public/landing/maskot/`.

| Dosya | Kullanım |
|---|---|
| `kabuki-selam.webp`, `kabuki-selam-512.webp` | Hero |
| `kabuki-goster.webp`, `kabuki-goster-512.webp` | Nasıl çalışır; işletmeler |
| `kabuki-dusunen.webp`, `kabuki-dusunen-512.webp` | SSS |
| `kabuki-avatar-48.png`, `kabuki-avatar-96.png` | WhatsApp asistan başlığı (resmi WhatsApp arayüzü değil) |

Konuşma balonları landing’de `.kabuki` bileşenidir.

## 5. Yazı tipleri (SIL OFL 1.1)

Canlı yol: `apps/landing/public/fonts/`. Lisans metni: `apps/landing/public/fonts/OFL.txt`.

| Aile | Dosyalar | Kaynak | Lisans |
|---|---|---|---|
| Inter | `Inter-Regular.woff2`, `Inter-Medium.woff2`, `Inter-SemiBold.woff2`, `Inter-Bold.woff2` | [rsms/inter](https://github.com/rsms/inter) | [SIL Open Font License 1.1](https://openfontlicense.org) |
| Plus Jakarta Sans | `PlusJakartaSans-Regular.woff2`, `PlusJakartaSans-SemiBold.woff2`, `PlusJakartaSans-Bold.woff2` | [tokotype/PlusJakartaSans](https://github.com/tokotype/PlusJakartaSans) | [SIL Open Font License 1.1](https://openfontlicense.org) |

Telif satırları `OFL.txt` başındadır. Değişken (variable) woff2 sitede kullanılmaz; dağıtılmaz.

## 6. Dekor (yeşillik / kabuk 2× WebP; dalga–kum–köpük SVG)

Chat GPT üretimi sprite sheet’lerden kesildi (`tasarim/ui/landing/assets/dekor/gpt/sheet-1-sahil.png`, `sheet-2-yesillik.png`, `sheet-3-detay.png`). Gerçek kişi yoktur. Master PNG: `tasarim/ui/landing/assets/dekor/png/`. Canlı tek kaynak: `packages/ui/dekor/` (React `Dekor`, Next import). Yerleşim `packages/ui/dekor/YERLESIM.md`.

Dalga, kum, köpük ve ayak izi SVG’dir. `dalga`, `kopuk-serit`, `kum-tepecigi`, `ayak-izi`, `kemer` WebP kullanılmaz.

| Paket | Toplam |
|---|---|
| Masaüstü 2× (8 sprite) | ~88 KB |
| Mobil 1× (`*-m.webp`) | ~26 KB |

Kullanılan adlar: `palmiye`, `begonvil`, `zeytin-dali`, `yaprak-kumesi`, `tarak-kabuk`, `sarmal-kabuk`, `deniz-yildizi`, `cakil`. Opaklık 0.85–1 (grain doku 0.16). Eski 0.12–0.35 tablo geçersiz. /app sahneleri: `docs/APP-SOZLESME.md`.
