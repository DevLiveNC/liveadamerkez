# Pazarlama ölçüm notu

Alan adı, Pixel ID ve yasal metinler yer tutucudur (`[ALAN ADI]`, `[CTA]`, aydınlatma/KVKK onay bekliyor).

## UTM / ref saklama

- Pencere: **30 gün** (`ATTRIBUTION_WINDOW_DAYS` in `packages/shared/src/attribution.ts`).
- İlk ziyarette UTM + `ref` → ilk temas. Yeni UTM’li ziyaret → son temas. Parametresiz gezide ilk temas unutulmaz (süre dolana kadar).
- Çerez `am_attr` (Max-Age 30 gün, SameSite=Lax) ve `localStorage` anahtarı `am_attr_v1`. Form gövdesinde de gider (çapraz origin).
- Adlandırma: küçük harf, ASCII, alt çizgi.
- `/q/...` yolları URL’de UTM göstermez; istemci aynı UTM’i (`utm_source=qr`, `utm_medium=offline`, kampanya/content kanal) yazar.

## Olaylar

Tarayıcı Pixel + gtag; sunucu Meta Conversions API ve GA4 Measurement Protocol. Aynı `event_id` ile tekilleştirme.

| Olay | Pixel/CAPI (mümkünse) | GA4 |
|---|---|---|
| `page_view` | PageView | `page_view` |
| `waitlist_submit` | Lead | `waitlist_submit` |
| `business_apply_submit` | Lead | `business_apply_submit` |
| `sign_up` | CompleteRegistration | `sign_up` |
| `booking_confirmed` / `whatsapp_booking_confirmed` | Schedule | aynı ad |
| `search` / `view_business` / `begin_booking` | Search / ViewContent / InitiateCheckout | aynı ad |
| `qr_landing`, `cta_click`, `referral_share`, `referral_signup`, `booking_cancelled` | — | aynı ad |

Parametreler: `city`, `segment`, `channel`, `business_id`, `ref`. Rezervasyon değeri uydurulmaz.

## Ortam değişkenleri (yalnız env; yoksa sessiz atlanır)

API:

- `META_PIXEL_ID`, `META_CAPI_ACCESS_TOKEN`, isteğe bağlı `META_CAPI_TEST_EVENT_CODE`
- `GA4_MEASUREMENT_ID` veya `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `GA4_API_SECRET`
- `INTERNAL_EXPORT_TOKEN` — CSV: `GET /v1/internal/waitlist`, `/v1/internal/business-applications?inTurkey=true`, `/v1/internal/referrals`

Landing:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_META_PIXEL_ID` (yoksa Pixel scripti yok)
- `NEXT_PUBLIC_GA4_MEASUREMENT_ID` (yoksa gtag yok)
- `NEXT_PUBLIC_SITE_URL` (CAPI `event_source_url`)

## Test

1. Events Manager: `META_CAPI_TEST_EVENT_CODE` ile test olayı; tarayıcı ve sunucu aynı `event_id`.
2. GA4 DebugView / Measurement Protocol: `waitlist_submit` form gönderiminde.
3. Uçtan uca: `/?utm_source=instagram&utm_campaign=evre_a_teaser` → bekleme listesi → iç CSV’de ilk/son temas.

## Davet kodu

Kanca: `issued` / `signed_up` / `first_booking`. Ödül tutarı yok. Paylaşım `/?ref=AMXXXXXX`.
