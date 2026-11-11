# Ada Merkez uygulama sözleşmesi (`/app`)

PWA `apps/landing` içinde `/app` altında yaşar. API `apps/api` üzerindedir. Yeni sır gerekmez: `AUTH_SECRET`, `OTP_PEPPER`.

Runtime dekor: React `Dekor` (`@ada-merkez/ui`). `dekor.js` DOM’a ekleme yapmaz ve sayfaya yüklenmez. Tek varlık kaynağı: `packages/ui/dekor/` (Next import `@ada-merkez/ui/dekor.css`; `public/assets/dekor` yok).

## Yetki

Her panel sayfası ve uçta `requireRole` (veya `requireSession`) zorunludur. Middleware rol kontrolü yapmaz; yalnızca `x-ada-path` ve `Cache-Control` yazar. Sayfa veya API rolü atlanırsa misafir veya yanlış rol o panele girer.

## Dekor

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

Landing slot’ları sayfa ağacında (hero, bölüm arası). `data-dekor` html/body’de kalır (CSS sahneleri). `/app` sahneleri kök layout’ta `<Dekor scene={…} />` ile basılır.

İşletme / yönetici yan menü köşesi:

```tsx
<nav className="side-nav">
  …
  <DekorNavCorner />
</nav>
```

| `data-dekor` / `scene` | Uygulama | Tipik rota |
| --- | --- | --- |
| `landing` | Pazarlama, yasal, formlar | `/`, `/basvuru`, `/bekleme-listesi` (`slot` ile) |
| `app-giris` | Uygulama giriş / kayıt | `/app/giris` |
| `app-musteri` | Müşteri (keşif, rezervasyon, favori, hesap) | `/app`, `/app/randevular`, `/app/isletmeler/…` |
| `app-isletme` | İşletme paneli | `/app/isletme` |
| `app-yonetici` | Yönetici paneli | `/app/yonetim` |

`/app/isletmeler` müşteri işletme detayıdır; `app-isletme` değildir. Yerleşim: `packages/ui/dekor/YERLESIM.md`. Paneller sade: kum grain + alt dalga şeridi + en fazla bir küçük sprite. Mobilde desk-only sprite DOM’a girmez. Masaüstü `srcset` 1× + 2×. Paralaks `prefers-reduced-motion: reduce` iken kapalı. `will-change` yalnızca kaydırma sırasında.

## Rotalar

| Yol | Kim görür | Not |
|---|---|---|
| `/app` | misafir | Keşif; giriş zorunlu değil |
| `/app/isletmeler/:id` | misafir | Detay; randevu/favori için giriş |
| `/app/giris` | misafir | Sekmeler: Müşteri (varsayılan) · İşletme · Yönetici |
| `/app/randevular`, `/app/favoriler`, `/app/hesap` | `customer` | `(musteri)` layout + sayfada `requireRole("customer")` |
| `/app/isletme` | `business` | PR-D yazar; `requireRole("business")` |
| `/app/yonetim` | `admin` | PR-E yazar; `requireRole("admin")` |

Yönetici sekmesinde kayıt yoktur. `admin` rolü yalnızca sunucuda (seed / SQL) atanır.

## Landing oturum API (paneller bunu kullanır)

Dosya: `apps/landing/src/lib/app-auth.ts`

```ts
import { getSession, requireRole, requireSession } from "../../lib/app-auth";

const session = await getSession();
// session: { id, role, name, phone, tenantId } | null

await requireRole("customer", "/app/randevular");
await requireRole("business", "/app/isletme");
await requireRole(["admin"], "/app/yonetim");
```

- `getSession()` çerezdeki jetonu API `GET /v1/auth/me` ile doğrular. İstemci jetonu okumaz.
- `requireSession(next)` yoksa `/app/giris?next=` (yalnız `/app` yolları).
- `requireRole(role, next)` oturum yoksa girişe, rol uymazsa `/app/yetki` sayfasına gider.
- Open redirect yok: `next` her okumada `safeAppPath` / `readNextParam` ile süzülür (`/apple` ve `https://` elenir).

Çerez: `am_session`, `HttpOnly`, `Path=/app`, `SameSite=Lax`. Landing BFF: `POST/DELETE /app/api/oturum`, `POST/DELETE /app/api/randevular`, `POST/DELETE /app/api/favoriler`, `PATCH /app/api/hesap`. BFF mutasyonları `Origin` / `Sec-Fetch-Site` ile aynı origin ister; gerçek `Host` önce, `X-Forwarded-Host` yalnız `TRUST_FORWARDED_HOST=true` iken yedek. `/app/api` yanıtları `Cache-Control: no-store`. `DELETE /app/api/oturum` ayrıca `Clear-Site-Data: "cache"` döner ve SW’ye `CLEAR_CACHES` mesajı gider.

## API

| Uç | Kim | Açıklama |
|---|---|---|
| `POST /v1/otp/request` | herkes | Mevcut OTP; WhatsApp henüz bağlı değil |
| `POST /v1/auth/verify` | herkes | OTP doğrula, oturum jetonu ver |
| `GET /v1/auth/me` | Bearer | Hesap özeti |
| `GET /v1/public/businesses` | herkes | Keşif; yalnız `approved`; boşsa landing örnek kartlara düşer |
| `GET /v1/public/businesses/:id` | herkes | `approved` işletme |
| `GET /v1/public/businesses/:id/slots` | herkes | `date=YYYY-MM-DD` Europe/Nicosia; geçmiş slot yok; yanlış `serviceId` 400 |
| `GET/POST /v1/me/bookings` | `customer` + `sub` | Sahiplik `account_id`; geçmiş 409; rate limit; IDOR yok |
| `DELETE /v1/me/bookings/:id` | `customer` + `sub` | Yalnız kendi kaydı |
| `GET/POST /v1/me/favorites` | `customer` + `sub` | Yalnız kendi favorisi |
| `DELETE /v1/me/favorites/:businessId` | `customer` + `sub` | Yalnız kendi favorisi |
| `PATCH /v1/me` | `customer` + `sub` | Ad güncelle |
| `GET/POST /v1/bookings` | `business` \| `admin` + `tenantId` | Müşteri bu ucu kullanmaz |

`POST /v1/auth/verify` gövde: `{ phone, code, role, mode: "login" \| "register", name? }`. `role=admin` ve `mode=register` → `403 ADMIN_REGISTER_DISABLED`.

Sunucu yetkisi: `apps/api/src/lib/auth.ts` → `sessionOr401`, `requireRole`. Kiracı: `withTenant` / `X-Tenant-Id` düzeni durur.

## PWA

- Manifest: `/app/manifest.json` — `start_url=/app?source=pwa`, `scope=/app`, `display=standalone`. `scope=/app/` prefix olarak `/app` kökünü kapsamaz; Next.js kanonik yol `/app` olduğu için kapsam `/app`.
- Landing HTML (`/`) app manifest’ini link’ler (iOS ana ekrana eklemede o anki sayfa URL’sini kullanır). Standalone / `navigator.standalone` ise render’dan önce `/app`’e yönlenir.
- İkonlar: `/app/icons/` (192, 512, maskable-512, apple-touch-180)
- iOS splash: `/app/splash/` + `apple-touch-startup-image` (`IosSplashLinks`)
- Kısayol: Keşif `/app`, Randevularım `/app/randevular`
- Service worker: `/app/sw.js`, kayıt kapsamı `/app` (manifest `scope` ile aynı; `Service-Worker-Allowed: /app`)
- Landing SW `/app` isteklerini işlemez; `/` önbelleği `/app` yanıtı olarak dönmez
- SW yalnızca kamu kabuğunu (`/app/offline.html`) ve statik ikon / splash / manifest dosyalarını önbelleğe alır. Gezinme, HTML ve RSC `network-only`; `cache.put` yok.
- Kimlikli HTML, RSC ve `/app/api` yanıtları `Cache-Control: no-store`.

## Test hesapları

`npm run db:seed-test` rastgele telefon ve OTP üretir; yalnızca çalıştıranın çıktısına basar. Kodları repoya yazmayın. Bekleme listesi kapalı kalır (`WAITLIST_OPEN` dokunulmaz).
