# Ada Merkez — /app dekor sözleşmesi

Müşteri, işletme ve yönetici panelleri ayrı PR’larda yazılır. Runtime: React `Dekor` (`@ada-merkez/ui`). `dekor.js` DOM’a ekleme yapmaz. Tek varlık kaynağı: `packages/ui/dekor/` (Next import; `public/assets/dekor` yok).

## Etkinleştirme

```tsx
import { Dekor, DekorNavCorner } from "@ada-merkez/ui";
import "@ada-merkez/ui/dekor.css";

<html lang="tr" data-dekor="app-musteri">
  <body data-dekor="app-musteri">
    {children}
    <Dekor scene="app-musteri" />
  </body>
</html>
```

Landing slot’ları sayfa ağacında (hero, bölüm arası). `data-dekor` html/body’de kalır (CSS sahneleri).

İşletme / yönetici yan menü köşesi:

```tsx
<nav className="side-nav">
  …
  <DekorNavCorner />
</nav>
```

## Sahneler

| `data-dekor` / `scene` | Uygulama | Tipik rota |
| --- | --- | --- |
| `landing` | Pazarlama | `/` (`slot` ile yerleşim) |
| `app-giris` | Giriş, kayıt, bekleme listesi, işletme başvurusu | `/app/giris`, formlar |
| `app-musteri` | Müşteri (keşif, rezervasyon) | `/app/musteri/…` |
| `app-isletme` | İşletme paneli | `/app/isletme/…` |
| `app-yonetici` | Yönetici paneli | `/app/yonetici/…` veya `/app/yonetim/…` |

Yerleşim: `packages/ui/dekor/YERLESIM.md`. Mobilde desk-only sprite DOM’a girmez. Masaüstü `srcset` 1× + 2×; 1× ekranda 2× dosya seçilmez. Paralaks `prefers-reduced-motion` kapalı; `will-change` yalnızca kaydırmada.
