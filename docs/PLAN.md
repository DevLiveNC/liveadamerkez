# Ada Merkez — Ürün ve Teknik Plan (taslak v0, Dev botu, 2026-11-10)

## Ürün
Kuzey Kıbrıs ve Türkiye için süper uygulama: işletme keşfi + randevu/rezervasyon, WhatsApp AI rezervasyon (uygulama indirmeden),
QR menü (CyQRMenu), POS (live Yazar Kasa), etkinlik bileti (CY Ticket), öğrenci indirimi (Ada Kampüs).
Rakip: Slotify (slotify.com.tr).

## MVP (v1) kapsamı
- Web/PWA (müşteri + işletme paneli) ve WhatsApp botu
- 2 sektör: kuaför/klinik (personel+hizmet+slot randevu), restoran (masa planı + rezervasyon)
- Pilot: Lefkoşa, Girne, Mağusa'da 15–20 işletme
- Entegrasyonlar v1'de sadece "bağlantı/derin link" seviyesinde; tam entegrasyon v2

## Önerilen teknik yığın (onay bekliyor)
- Next.js (App Router) + TypeScript, PWA, Tailwind
- Neon Postgres + Drizzle ORM
- Auth: telefon (WhatsApp OTP) + işletme paneli için e-posta
- Vercel (preview + prod; prod yalnızca LiveDev Şef onayıyla)
- WhatsApp: mevcut live-chat-bot (WhatsApp Cloud API) platformu üzerinden, rezervasyon araçları API ile
- i18n: TR (v1), EN/RU sonra

## Çekirdek veri modeli
Business, Location(şehir), Category(kuaför/klinik/restoran), Staff, Service, Resource(masa),
FloorPlan, AvailabilityRule, Booking(durum: beklemede/onaylı/iptal/gelmedi), Customer, Review, Notification

## Aşamalar
1. Repo + iskelet + CI (repo açılınca)
2. İşletme paneli: hizmet/personel/çalışma saati, masa planı editörü
3. Müşteri keşif + rezervasyon akışı (PWA)
4. WhatsApp bot rezervasyon akışı
5. Bildirimler (WhatsApp/SMS hatırlatma), no-show takibi
6. Pilot onboarding araçları, Kontrol botu incelemesi, canlıya alma (onaylı)

## Onaylanan güncellemeler (2026-11-10, LiveDev Şef)
Yığın onaylı: Next.js PWA, Neon Postgres, Vercel, WhatsApp için mevcut live-chat-bot.
Repo: https://github.com/DevLiveNC/liveadamerkez

### Mimari (kullanıcı isteği)
- API merkezli, çoklu servis/çoklu hosting; örnek: DevLiveNC/HeyTaksi yapısı.
- Ayrı API servisi; tüm ön yüzler (landing, müşteri, işyeri sahibi, yönetim panelleri) bu API'yi kullanır.
- Kiracı (tenant) ayrımı API ve DB düzeyinde.
- Sıra: landing + backend → müşteri paneli → işyeri sahibi paneli → yönetim paneli.
- Web + PWA (manifest, service worker, ikonlar, ana ekrana ekle); native uygulama sonra.
- Arayüz: kurumsal, güven verici; basit AI şablon görünümü yasak; tasarim/tokens.* ve ekran tasarımlarına uyulur.
- Metinlerde yasaklı bölge kısaltması yazılmaz, "Kuzey Kıbrıs" denir; Türkiye'ye de hizmet verildiği belirtilir.
- Özel alan adı yok (şimdilik Vercel adresi).

### Kontrol şartları (KONTROL-NOTLARI.md, zorunlu)
1. Kişisel veri: aydınlatma metni, açık rıza (WhatsApp hatırlatma dahil), saklama süresi, silme talebi akışı. KVKK + Kuzey Kıbrıs mevzuatı; yasal metinler kullanıcı onayıyla (yer tutucu).
2. Çift rezervasyon: DB düzeyinde koruma (Postgres exclusion constraint / benzersiz slot + transaction kilidi).
3. WhatsApp OTP: rate limit, deneme sınırı, kötüye kullanım koruması.
4. Çok kiracılı yetki: işletme yalnızca kendi verisini görür; otomatik testle doğrulanır.
5. CI: lint, typecheck, birim testleri, rezervasyon akışı için en az bir e2e test.
6. Saat dilimi: tüm slotlar Europe/Nicosia ile tutarlı (UTC saklama + bölge dönüşümü).
