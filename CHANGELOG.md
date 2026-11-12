# CHANGELOG

Tüm önemli değişiklikler bu dosyada tutulur. Biçim: Keep a Changelog; sürüm: anlamsal sürümleme.

## [Entegrasyon 2026-11-12] — repository-unification

Tek entegrasyon dalında birleştirilen müşteri ekranları, landing v3, tasarım altyapısı ve
kurtarma çalışmaları. Ana hedef: dağınık/yarım PR'ların tek kararlı dala taşınması,
CI'nin yeşile çekilmesi ve güvenlik yamaları.

### Birleştirilen dallar (önceden merge edilmemiş)

- `cursor/app-kesif-arama-6699` (#18) — müşteri keşif + arama/filtre (`/app?q=`, `/app?category=`)
- `cursor/app-isletme-galeri-6699` (#19) — işletme detay + 3 kare galeri
- `cursor/app-randevular-6699` (#21) — Randevularım: Yaklaşan/Geçmiş segmentleri
- `cursor/app-favoriler-6699` (#22) — Favoriler dolu/boş durumları
- `cursor/app-hesap-6699` (#23) — Hesap: TR/EN dil seçici, gösterim biçimi
- `cursor/app-rezervasyon-6699` (#26) — Rezervasyon sheet + talep gönderimi
- `cursor/landing-kontrol-takip-4359` (#30) — kontrol takip: CTA, admin maske, mobil menü
- `cursor/tasarim-v3-altyapi-d3a7` (#32) — Faz A token köprüsü, tembel GSAP, LazyMotion
- `cursor/landing-v3-hero-4359` (#33) — landing v3 CSS sahne + açık uygulama CTA
- `cursor/tasarim-v3-splash-d3a7` — splash, iskelet ve 3 adımlı onboarding (PR'sız dal)
- `cursor/musteri-paneli-e62c` — erken WIP; içerik `musteri-paneli-v2` (#10) ile karşılanmış

### Eklendi

- Müşteri v2 akışları: keşif, arama, işletme detay + galeri, rezervasyon sheet
  (Europe/Nicosia tarih şeridi + slot), randevu detay kartı, favoriler, hesap paneli.
- Landing v3: hero CSS sahnesi, `--am3-*` token köprüsü, tembel GSAP/ScrollTrigger
  (yalnızca `/`), LazyMotion, `prefers-reduced-motion` kısayolları.
- PWA: splash + 3 adımlı onboarding, `AppLaunch`/`AppSplash`, rota iskeletleri.
- Bildirimler: `app_notification` tablosu (`0008_notifications.sql`), `GET /v1/me/notifications`,
  rezervasyon onayı ve slot önerisi olaylarında uygulama içi bildirim;
  WhatsApp kanalı stub (`sendWhatsAppNotification` — göndermez, arayüz hazırlıkları tamam).
- e2e: giriş ekranı 320/375×667/390/430 ölçüleri, v3 hero, splash, onboarding, scroll kabuğu.

### Düzeltildi

- **e2e `assertScrollTopGrows`**: pad öğesi flex kapsayıcıda küçüldüğü için `scrollTop`
  hiç artmıyor, CI'nin e2e adımı deterministik kırılıyordu. Pad `flex: 0 0 auto`
  işaretlendi; test, gerçek kaydırma davranışını doğrular hale geldi.
- 200+ rezervasyonda personel slot çakışması testi (exclusion constraint 30 dk/1 dk senaryosu).
- Mobil menü dış tıklama scrim'i ve odak yönetimi; Safari CSS taşmaları.

### Güvenlik

- `drizzle-orm` 0.44.7 → 0.45.4 — [GHSA-gpj5-g38j-94v9](https://github.com/advisories/GHSA-gpj5-g38j-94v9)
  (yüksek; SQL identifier kaçışı) — tüm DB testleri ve e2e ile doğrulandı.
- `zod` 3.25.76 → 4.6.7 — [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5)
  (yüksek; aşırı büyük koleksiyon doğrulamasında bellek tükenmesi) — API istek doğrulama
  şemaları v4 ile uyumlu; tüm testler geçti.
- `postcss` kök `overrides` ile ≥8.5.23 sabitlendi (Next 15'in paket içi 8.4.31'i yerine) —
  [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) ve ilgili üç danışma.
  Kalıcı çözüm Next 16 yükseltmesidir (ayrı, onaylı iş).
- Üretim bağımlılığı audit sonucu: **0 açık**. Kalan bulgular yalnızca dev bağımlılıklarında
  (vitest/tinypool, minimatch) — ayrı yükseltme işi.

### Test

- lint, typecheck, copy-check: geçer.
- Birim/entegrasyon: 42 dosya, 134/134 geçer (Postgres 16 hedefli; PGlite wire uyumlu ortamda).
- e2e (Playwright, Chromium): 46/46 geçer.
- Üretim build (API + landing): geçer.
