# Ada Merkez — /app dekor sözleşmesi

Müşteri, işletme ve yönetici panelleri ayrı PR’larda yazılır. Dekor ortak paketten gelir; sahne `data-dekor` ile seçilir. Kaynak: `packages/ui/dekor/` (`dekor.css`, `dekor.js`, `svg/`, `webp/`, `YERLESIM.md`).

## Etkinleştirme

Kök layout’ta CSS ve JS’yi ekle; `html` ve `body` üzerine sahneyi yaz:

```html
<html lang="tr" data-dekor="app-musteri">
  <link rel="stylesheet" href="/assets/dekor/dekor.css">
  …
  <body data-dekor="app-musteri">
    …
    <script src="/assets/dekor/dekor.js" defer></script>
  </body>
</html>
```

Varlıkları her Next uygulamasının `public/assets/dekor/` altına kopyala (landing bunu yapıyor). `dekor.js` yolundan `./webp` ve `./svg` çözer.

## Sahneler

| `data-dekor` | Uygulama | Tipik rota |
| --- | --- | --- |
| `landing` | Pazarlama (şimdi bağlı) | `/` |
| `app-giris` | Giriş, kayıt, bekleme listesi, işletme başvurusu | `/app/giris`, formlar |
| `app-musteri` | Müşteri (keşif, rezervasyon) | `/app/musteri/…` |
| `app-isletme` | İşletme paneli | `/app/isletme/…` |
| `app-yonetici` | Yönetici paneli | `/app/yonetici/…` veya `/app/yonetim/…` |

Üretimde attribute yazılır. `dekor.js` yoksa sınıf/yoldan da tahmin eder; buna bel bağlanmaz.

Yerleşim tabloları: `packages/ui/dekor/YERLESIM.md`. Paneller sade: kum grain + alt dalga şeridi + en fazla bir küçük sprite. Paralaks `prefers-reduced-motion: reduce` iken kapalı. `will-change` yalnızca kaydırma sırasında. Sprite CSS genişliği `floor(doğal2x / 2)` üstünü geçmez.
