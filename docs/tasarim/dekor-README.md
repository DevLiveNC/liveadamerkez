# Ada Merkez — Landing dekor varlıkları

Arka plan dekor elementleri; landing sayfasının kum zeminini (ve kenarlarını) doldurmak için.
Sayfa metninin okunurluğu ve minimal his bozulmasın diye kenarlara / bölüm aralarına yerleştirilir.

**Ürün kararı (landing):** README’deki düşük opaklık (0.12–0.35) geçersizdir. Canlıda opaklık **0.8–1**; metnin arkasına konulmaz.

**Kaynak:** Chat GPT üretimi (3 sprite sheet, düz beyaz zemin, 1536×1024). Yeni üretim yapılmadı; sheet’ler kesildi, beyaz zemin şeffaflaştırıldı, premultiplied Lanczos ile ölçeklendi. Masaüstü hedefi 2× (üst sınır 2048 px) idi; 600 KB bütçesi için 0,74× bu hedefin (kaynağın ~1,48×’i), WebP q80 uygulandı. Mobil: uzun kenar en fazla 640 px, kaynak daha küçükse büyütülmedi, WebP q70.

## Dosya düzeni

- `png/` — master şeffaf PNG (sıkı kırpılmış, kaynak çözünürlük)
- `webp/` — masaüstü (`ad.webp`, q80 alfa) ve mobil (`ad-m.webp`, q70 alfa)
- `kontrol-pano.png` — lacivert ve kum zeminde kırpım / hale kontrolü
- `gpt/` — işlenmemiş kaynak sheet’ler
- `kaynak/kes_dekor.py` — bu varlıkları üreten kesim scripti

## Ölçüler ve ağırlık

| Element | Master PNG | Masaüstü WebP | Mobil WebP |
|---|---:|---:|---:|
| `kum-tepecigi` | 621×231 · 103.2 KB | 919×342 · **24.2 KB** | 621×231 · **5.7 KB** |
| `dalga` | 642×350 · 186.2 KB | 950×518 · **50.7 KB** | 640×349 · **24.1 KB** |
| `kopuk-serit` | 1430×135 · 164.9 KB | 1516×143 · **33.8 KB** | 640×60 · **8.9 KB** |
| `ayak-izi` | 1317×115 · 74.7 KB | 1516×132 · **39.4 KB** | 640×56 · **10.7 KB** |
| `palmiye` | 520×506 · 209.7 KB | 770×749 · **65.8 KB** | 520×506 · **22.5 KB** |
| `zeytin-dali` | 502×449 · 193.8 KB | 743×665 · **67.8 KB** | 502×449 · **21.7 KB** |
| `begonvil` | 677×405 · 240.4 KB | 1002×599 · **83.0 KB** | 640×383 · **39.2 KB** |
| `yaprak-kumesi` | 418×323 · 120.2 KB | 619×478 · **25.4 KB** | 418×323 · **8.7 KB** |
| `tarak-kabuk` | 395×343 · 129.3 KB | 585×508 · **26.9 KB** | 395×343 · **8.2 KB** |
| `sarmal-kabuk` | 373×334 · 114.8 KB | 552×494 · **25.9 KB** | 373×334 · **8.0 KB** |
| `deniz-yildizi` | 400×371 · 122.6 KB | 592×549 · **36.4 KB** | 400×371 · **13.1 KB** |
| `cakil` | 446×285 · 125.0 KB | 660×422 · **26.3 KB** | 446×285 · **8.3 KB** |
| `kemer` | 833×386 · 214.3 KB | 1233×571 · **50.1 KB** | 640×297 · **18.5 KB** |
| **Toplam WebP** | — | **555.8 KB** (hedef < 600) | **197.5 KB** (hedef < 200) |

## Önerilen opaklık, yerleşim ve paralaks

Genel aralık: **0.12–0.35**. Kemer gibi büyük siluetler alt uçta; kabuk ve köpük biraz daha görünür olabilir. Metnin üstüne binmesin.

| Element | Opaklık | Yerleşim | Paralaks hızı |
|---|---|---|---|
| `kum-tepecigi` | 0.22–0.32 | Hero alt kenarı ve bölüm aralarındaki sahil şeridi | 0.12 |
| `dalga` | 0.16–0.28 | Hero arka planı, sağ veya alt; bölüm geçişlerinde yatay bant | 0.18 |
| `kopuk-serit` | 0.18–0.30 | Bölüm ayırıcı olarak tam genişlikte, düşük opaklık | 0.10 |
| `ayak-izi` | 0.16–0.26 | Hero altı veya CTA öncesi kum zeminde yatay iz | 0.08 |
| `palmiye` | 0.14–0.24 | Hero sol kenar, büyük ve silik | 0.22 |
| `zeytin-dali` | 0.16–0.28 | Sağ veya sol kenar, bölüm başlığı yanı | 0.16 |
| `begonvil` | 0.16–0.28 | Kenarlar ve ‘işletmeler’ / etkinlik bölümleri | 0.16 |
| `yaprak-kumesi` | 0.14–0.24 | Kart köşeleri ve boşluk doldurma, küçük | 0.14 |
| `tarak-kabuk` | 0.18–0.30 | Kenar ve alt boşluklar, küçük tekrar | 0.10 |
| `sarmal-kabuk` | 0.18–0.30 | Kenar ve alt boşluklar, küçük tekrar | 0.10 |
| `deniz-yildizi` | 0.16–0.26 | Sahil şeridi ve alt kenar, seyrek | 0.12 |
| `cakil` | 0.16–0.26 | Alt kenar, kum tepeciği yanı | 0.08 |
| `kemer` | 0.10–0.18 | Hero arkasında büyük, çok silik siluet (CSS opacity ile) | 0.06 |

Paralaks hızı, sayfa kaydırmasına göre katmanın hareket katsayısıdır (1.00 = içerikle aynı, daha düşük = geride kalır / daha yavaş).
Önerilen değerler 0.06–0.22 arasındadır; dekor ‘yüzmesin’, sadece hafif derinlik katsın.

## Performans ve erişilebilirlik

- **Format:** WebP, alfa kanallı. Mobilde `*-m.webp` (uzun kenar en fazla 640 px; daha küçük master’lar büyütülmedi). Masaüstünde `*.webp` (~1,48× kaynak, q80); tam 2× bütçeyi aşıyordu.
- **Lazy-load:** Hero dışındaki tüm dekor `loading="lazy"` (veya Intersection Observer) ile yüklensin. Hero arkası `dalga` / `palmiye` / `kemer` / `kum-tepecigi` kritikse yalnızca onlar eager olabilir.
- **`prefers-reduced-motion`:** Paralaks, kayma ve yüzen animasyonları kapatın; katmanları statik konuma sabitleyin. Opaklık ve yerleşim aynen kalabilir.
- **Mobil:** Daha az element, daha düşük opaklık (önerilen aralığın altı) ve hafif sürümler. Kemer ve palmiye gibi büyük parçalar mobilde ya çıkarılsın ya da çok silik (≤ 0.14) kullanılsın.

## Kesim notu

Beyaz zemin kenardan flood-fill ile kaldırıldı; nötr olmayan (sıcak krem) pikseller korunarak köpük, dalga tepesi, kabuk ve ayak izi yemedi. Kenar alıası, en yakın katı renk üzerinden beyazdan unmultiply ile üretildi; ölçekleme premultiplied Lanczos + hafif keskinleştirme.
`kum-tepecigi` üzerindeki istenmeyen deniz yıldızı, çakıl ve bitki kesimde temizlendi; dolgu yumuşak kil gölgelendirmesine yakındır, yakından bakınca hafif bir rötuş izi kalabilir.

