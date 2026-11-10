# Ada Merkez

Kuzey Kıbrıs ve Türkiye için işletme keşfi, randevu ve rezervasyon. Kuaför / klinik slot randevusu, restoran masa planı; uygulamayı indirmeden WhatsApp üzerinden rezervasyon (v1 planı). QR menü, POS, etkinlik bileti ve öğrenci indirimi yol haritasındadır (landing’de **Yakında**).

Şirket: **Kırmızıyüz Live Development Software LTD**.

Bu PR: monorepo iskeleti, API’nin ilk hali, Türkçe PWA landing. Müşteri / işyeri / yönetim panelleri sonraki PR’lar.

## HeyTaksi’den uyarlanan yapı

[DevLiveNC/HeyTaksi](https://github.com/DevLiveNC/HeyTaksi) özel repo; bu ortamdan kaynak okunamadı. Vercel ekibindeki dört ayrı proje incelendi:

| HeyTaksi Vercel projesi | Çerçeve | Bu repodaki karşılık |
|---|---|---|
| `hey-taksi-api` | Fastify | `apps/api` (Next.js App Router; onaylı yığın) |
| `hey-taksi-passenger` | Vite | `apps/landing` (şimdi), sonra `apps/customer` |
| `hey-taksi-driver` | Vite | `apps/business` (sonraki PR) |
| `hey-taksi-admin` | Vite | `apps/admin` (sonraki PR) |

Uyarlanan ilkeler:

- **Bir git deposu, ayrı Vercel projeleri.** Her servis kendi Root Directory’sinden yayınlanır; ortak yaşam döngüsü yok.
- **API merkezli.** Ön yüzler API’yi HTTP ile çağırır (`NEXT_PUBLIC_API_URL`; HeyTaksi’de `VITE_API_URL` / `API_ORIGIN`).
- **Veritabanı yalnızca API’de.** `DATABASE_URL` landing’de yok. Landing, DB olmasa da build olur ve açılır.
- **Paylaşılan paketler** `packages/` altında; Vercel’de “source files outside of root directory” açık olmalı.
- **Bölge:** Frankfurt (`fra1`), HeyTaksi API ile aynı.

Pazarlama (bu PR): 30 günlük ilk/son UTM+`ref`, bekleme listesi ve işletme başvurusu (CSV), Meta Pixel/CAPI + GA4 (`event_id`), `/q/...` QR yolları, davet kodu kancası. Ayrıntı: `docs/PAZARLAMA-OLCUM.md`.

Logo kesin değil. UI yalnızca `apps/landing/public/brand/logo.svg` yer tutucusunu (`Logo` bileşeni) kullanır.

## Klasörler

```
apps/api          API (health, bekleme listesi, rıza/silme, OTP iskeleti, rezervasyon)
apps/landing      Türkçe PWA landing
apps/customer     yer tutucu (sonraki PR)
apps/business     yer tutucu (sonraki PR)
apps/admin        yer tutucu (sonraki PR)
packages/db       Drizzle şema, SQL migration, kiracı + çift rezervasyon
packages/shared   saat dilimi, OTP limit, kiracı yardımcıları
packages/copy     kullanıcıya görünen metin (tek kaynak)
packages/brand    tokens.css / tokens.json / logo
packages/ui       ortak dekor (dekor.css/js, 1×/2× srcset, sahneler)
docs/             PLAN, kontrol notları, özellik listesi, bağlam
```

## Yerel geliştirme

Node 22+.

```bash
npm install
npm run dev:api        # :3001
npm run dev:landing    # :3000  (NEXT_PUBLIC_API_URL=http://localhost:3001)
```

Veritabanı (isteğe bağlı; landing’siz de çalışır):

```bash
export DATABASE_URL=postgres://postgres:postgres@localhost:5432/ada_merkez
npm run db:migrate
```

```bash
npm run lint
npm run typecheck
npm run copy-check    # yasaklı bölge kısaltması, üstünlük iddiası, onaylanmamış ücretsiz teklif
npm run test          # OTP, saat dilimi, kiracı, çift rezervasyon (DB varsa)
npm run build         # API + landing; DATABASE_URL şart değil
npm run e2e           # landing smoke (önce build)
```

## Vercel kurulumu

Aynı GitHub reposunu **ayrı projeler** olarak bağlayın. Root Directory uygulama klasörüdür. Install komutu monorepo kökünden `npm ci` çalıştırır (`apps/*/vercel.json`).

Kaynak dosyalar kök dışında: **Include source files outside of the Root Directory in the Build Step = On**.

### `ada-merkez-api`

| Ayar | Değer |
|---|---|
| Root Directory | `apps/api` |
| Framework | Next.js |
| Install | `cd ../.. && npm ci` |
| Build | `cd ../.. && npm run build -w @ada-merkez/api` |
| Region | `fra1` (önerilen) |

Ortam değişkenleri:

| Değişken | Zorunlu | Not |
|---|---|---|
| `DATABASE_URL` | Hayır (v1 landing için) | Neon Postgres. Yoksa `/health` `db: disconnected`; bekleme listesi 503 ve düzgün mesaj. |
| `CORS_ORIGINS` | Evet (prod) | Landing (ve sonra paneller) origin’leri, virgülle. |
| `APP_TIMEZONE` | Hayır | Varsayılan `Europe/Nicosia`. Slotlar UTC saklanır. |
| `INTERNAL_EXPORT_TOKEN` | CSV için | `GET /v1/internal/waitlist` (şehir/segment), `/v1/internal/business-applications?inTurkey=true`, `/v1/internal/referrals`. |
| `META_PIXEL_ID` / `META_CAPI_ACCESS_TOKEN` | Hayır | Yoksa CAPI sessiz atlanır. İsteğe bağlı `META_CAPI_TEST_EVENT_CODE`. |
| `GA4_MEASUREMENT_ID` / `GA4_API_SECRET` | Hayır | Yoksa Measurement Protocol sessiz atlanır. |

### `ada-merkez-landing`

| Ayar | Değer |
|---|---|
| Root Directory | `apps/landing` |
| Framework | Next.js |
| Install | `cd ../.. && npm ci` |
| Build | `cd ../.. && npm run build -w @ada-merkez/landing` |
| Region | `fra1` (önerilen) |

Ortam değişkenleri:

| Değişken | Zorunlu | Not |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Prod’da evet | API origin, örn. `https://ada-merkez-api.vercel.app` (sonda `/` yok). Yoksa bekleme listesi formunda kırılma olmadan “alınamıyor” mesajı. |
| `NEXT_PUBLIC_SITE_URL` | Hayır | Mutlak OG URL’leri için. Yer tutucu alan adı yok; `[ALAN ADI]`. |
| `NEXT_PUBLIC_META_PIXEL_ID` | Hayır | Yoksa Pixel scripti yüklenmez. |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Hayır | Yoksa gtag yüklenmez. |

### Sonraki paneller

| Proje | Root Directory | Env |
|---|---|---|
| `ada-merkez-customer` | `apps/customer` | `NEXT_PUBLIC_API_URL` |
| `ada-merkez-business` | `apps/business` | `NEXT_PUBLIC_API_URL` |
| `ada-merkez-admin` | `apps/admin` | `NEXT_PUBLIC_API_URL` |

## Veri modeli (API + DB)

Business (kiracı), Location, Category, Staff, Service, Resource (masa), AvailabilityRule, Booking, Customer, Consent.

- Kiracı: satırlarda `tenant_id`; API `X-Tenant-Id` (auth sonraki PR); RLS politikaları `app.tenant_id`.
- Çift rezervasyon: `booking_staff_overlap_excl` ve `booking_resource_overlap_excl` (GiST / `tstzrange`, `pending`+`confirmed`).
- Saat: UTC saklama, gösterim `Europe/Nicosia`.
- Rıza: `consent` (amaç, metin sürümü, `retention_days`, `retain_until`). Silme talebi: `POST /v1/privacy/deletion-requests`.
- OTP: `POST /v1/otp/request` iskeleti; pencere başına gönderim ve deneme tavanı.

Yasal metinler landing’de **kullanıcı onayı bekliyor** yer tutucusudur.

## Metin kuralları

Kullanıcıya görünen metin (landing, meta, OG, manifest, API mesajları):

- Siyasi kısaltma yazılmaz; bölge **Kuzey Kıbrıs**, ifade **Kuzey Kıbrıs ve Türkiye için**.
- Pilot: Lefkoşa, Girne, Mağusa.
- `ilk` / `tek` üstünlük iddiası yok.
- v2 özellikleri **Yakında** etiketiyle.
- Onaylanmamış “ücretsiz kurulum” / “müşteri için ücretsiz” yok.

`npm run copy-check` bunları tarar (CI zorunlu).
