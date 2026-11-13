# Ada Merkez · İşletme ve yönetici paneli teslim notu

Bu teslim, `docs/PANEL-PWA-GELISTIRME-PROMPTU.md` içindeki proje promptuna göre yapıldı. Web'de `/` pazarlama landing page'i olarak korundu; ürün ve çalışma panelleri aynı origin içinde `/app` altında PWA öncelikli yaşar.

## Yapılanlar

- Ortak panel altyapısı: `PanelShell`, `PanelKit`, `usePanelData`, `usePanelMutation`, `panelRequest`. Yarışan eski istekler yeni sonucu ezemez; 401/403 durumda kişisel veri temizlenir; çevrimdışı yazma kuyruğa alınmaz.
- İşletme paneli: gerçek özet/kurulum adımları, gelen talepler, takvim, boş saatler, hizmet/personel CRUD, profil ve çalışma saatleri. Onay/ret/alternatif saat açık onay ve görünür sonuçla çalışır.
- Yönetici paneli: operasyon özeti, birleşik onay kuyruğu, kiracı/kullanıcı/denetim listeleri, rezervasyon müdahalesi, sunucu toplamlı rapor ve CSV, gerçek sistem durumu.
- API/DB: yönetici rezervasyon süzgeçleri 200 satır sınırından önce uygulanır; günlük rapor liste sınırından bağımsız tüm aralığı sayar; günler Europe/Nicosia, saklama UTC. Denetim ve kullanıcı listelerinde telefon maskelenir.
- PWA: manifest kısayolları, tablet orientation kilidi yok, kurulum yaprakları panelden erişilebilir, service worker `ada-merkez-app-v6` yalnız uygulama önbelleklerini yönetir. Güncelleme panellerde kullanıcı onayı bekler; landing önbelleği silinmez.
- Güvenlik: BFF yalnız izin verilen yol/metot çiftlerini iletir, mutasyonlarda aynı origin kontrolü vardır, upstream 15 sn içinde yanıt vermezse 503 döner. Jeton localStorage'a yazılmaz.
- Yerel seed düzeltmesi: `db:seed-test` işletme hesabı için `business_member` yazar; yalnız `app_account.tenant_id` panel girişini açmıyordu.

## Doğrulama

Yerel PostgreSQL ve Chromium ile:

- `npm run typecheck`: başarılı
- `npm run lint`: başarılı, uyarı yok
- `npm run copy-check`: başarılı, 429 dosya
- `npm run test`: 47 dosya / 182 test başarılı
- `npm run build`: API + landing üretim derlemesi başarılı
- `npm run e2e`: 50/50 başarılı

E2E kapsamı: landing, giriş, mobil kaydırma, PWA/standalone, işletme ve yönetici rota/yetki sınırları, işletme CRUD/onay/saat önerisi/çevrimdışı koruma, kiracı/rol sınırı, yönetici başvuru akışı ve CSV.

## Çalıştırma

1. `npm ci`
2. Yerel PostgreSQL için `DATABASE_URL` ayarla.
3. `npm run db:migrate`
4. `npm run db:seed-test` — telefon ve OTP kodları yalnız stdout'a yazılır, repoya yazılmaz.
5. `AUTH_SECRET`, `OTP_PEPPER`, `API_URL` ayarla; `npm run dev:api` ve `npm run dev:landing`.

Playwright Notları:

- Hazır sunuculara karşı `PLAYWRIGHT_BASE_URL` ve `PLAYWRIGHT_API_URL` verilir.
- İmzalı oturum kullanan testlerde `E2E_AUTH_SECRET` / `E2E_OTP_PEPPER` çalışan sunucunun değerleriyle eşleşmelidir.
- Deterministik giriş ekranı için sunucularda `AUTH_TEST_LOGIN=off` kullanıldı. Playwright config kendi sunucularını başlatırken bunu varsayılan yapar.
- Chromium ikili yolu gerekirse `PLAYWRIGHT_CHROMIUM_EXECUTABLE` ile verilebilir.

## Sınırlar ve dürüst durumlar

- Gerçek iPhone/iPad Safari cihaz testi yapılmadı. iOS UA, `navigator.standalone`, safe-area ve klavye yüksekliği emülasyonla kontrol edildi.
- Üretim dağıtımı veya yeni veritabanı migrasyonu yapılmadı. Bu teslimde şema migrasyonu gerekmedi.
- WhatsApp, SMS, push bildirim, ödeme ve bekleme listesi bağlı/kapalı durumlarıyla açıkça gösterilir; çalışıyor gibi sunulmaz.
- Yönetici rezervasyon listesi en fazla 200 satır gösterir; arama yüklenen kayıtlarda yapılır. Rapor ve CSV sunucu toplamlarını kullanır.
- Çevrimdışı yazma kuyruğu yoktur. Bağlantı dönünce okuma yenilenir; eski onay/iptal kendiliğinden gönderilmez.
- `~/Downloads/panel-ios-pwa.patch` bulunamadığı için uygulanmadı. Çalışma ayrı dalda tutuldu; doğrudan `main` üzerine push yapılmadı.

## Görsel kontrol

Yerel önizleme ekran görüntüleri `artifacts/panel-isletme-desktop.png`, `artifacts/panel-yonetim-desktop.png`, `artifacts/panel-isletme-mobile.png`, `artifacts/panel-yonetim-mobile.png` dosyalarına alındı. `artifacts/` Git'e girmez.
