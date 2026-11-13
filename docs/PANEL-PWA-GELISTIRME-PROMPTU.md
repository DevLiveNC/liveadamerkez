# Ada Merkez · İşletme ve yönetim paneli geliştirme promptu

Bu belge, projeyi devralan geliştirici veya kodlama ajanı için uygulanabilir ana prompttur. Amaç gösterişli bir maket değil; mevcut API, kimlik ve kiracı sınırlarını koruyan, telefonda gerçekten kullanılabilir bir üründür.

## Rol ve hedef

Ada Merkez'in mevcut monorepo'sunda kıdemli ürün mühendisi ve ürün tasarımcısı olarak çalış. Önce kodu, veri sözleşmelerini, testleri ve marka tokenlarını incele. İşletme ve yönetici panellerindeki eksikleri gerçek kullanım senaryolarına göre çıkar; ardından küçük ama uçtan uca tamamlanmış dikey dilimler halinde uygula. Her dilimde arayüz, API istemcisi, yetki, hata davranışı ve test birlikte ilerlesin.

**Ürün kararı:** Web'de `/` pazarlama landing page'i olarak kalır. Müşteri uygulaması ve çalışma panelleri aynı origin içinde `/app` altında, PWA öncelikli yaşar. Panelleri ayrı bir masaüstü sitesine dönüştürme; landing tasarımı yeniden yazma. Mobil elde tek elle kullanım, masaüstünde aynı verinin daha geniş görünümü esastır.

## Değişmez sınırlar

- Next.js App Router, TypeScript, mevcut React bileşenleri ve npm workspaces kullanılmaya devam eder.
- `apps/landing`: landing + PWA; `apps/api`: API; veritabanı erişimi yalnız API/packages/db katmanında.
- Landing'e `DATABASE_URL`, API sırrı veya yönetici yetkisi ekleme.
- Mevcut fildişi / şeftali / mercan / lacivert / Akdeniz yeşili kimliğini ve `packages/brand`, `packages/ui`, `packages/copy` kaynaklarını kullan.
- Türkçe metin tek kaynaktan gelsin. Bölge adı **Kuzey Kıbrıs**; kanıtsız üstünlük, onaylanmamış fiyat/ücretsizlik veya yayın tarihi vaadi yok.
- Tarih/saat gösterimi ve takvim günleri **Europe/Nicosia**; saklama UTC. Cihazın saat dilimine göre sessizce tarih kaydırma.
- Rol ve kiracı kontrolü sunucudadır. Gizli menü, güvenlik kontrolü değildir. Jeton localStorage'a yazılmaz.
- İşletme yalnız kendi kiracısının verisini görür/değiştirir. Yönetici rolü istemcide yükseltilemez. Kişisel telefonlar yönetim listelerinde maskelenir.
- HTML, RSC, kimlikli yanıtlar ve `/app/api` önbelleğe alınmaz. Çevrimdışı durumda eski müşteri/rezervasyon verisi gerçek güncel veri gibi gösterilmez.
- Çevrimdışı yazma kuyruğu oluşturma: bağlantı geri geldiğinde eski bir onay/iptal isteğini kendiliğinden uygulama.
- WhatsApp, SMS, push bildirim, ödeme, masa planı editörü veya etkinlik sistemi çalışmıyorsa çalışıyor gibi gösterme.

## İşletme senaryoları

1. **Sabah açılışı:** İşletme sahibi bugünkü onaylı randevuları, bekleyen talepleri ve eksik kurulum adımlarını bir bakışta görür. Sıfır kayıt, örnek rakamlarla kapatılmaz.
2. **Talep yönetimi:** Müşteri adı, hizmet, personel, tarih, saat, kanal, durum ve not okunur. Ada göre ara; durum/kanal/tarih ile süz. Onay, ret ve alternatif saat önerisi açık sonuç verir. Aynı işlem iki kez gönderilemez.
3. **Hizmet kataloğu:** Ad, süre, fiyat etiketi, açıklama ve personel atanır. Kayıt düzenlenir; geçmiş randevuları bozmamak için silmek yerine pasifleştirme tercih edilir.
4. **Ekip ve çalışma saatleri:** Personel eklenir/düzenlenir/pasifleştirilir. Gün, başlangıç, bitiş ve personel ilişkisi görünür. Geçersiz saat aralığı sunucuya gitmeden açıklanır.
5. **Profil:** Kayıt yüklenirken boş form kaydedilemez. Başarı, hata ve yeniden deneme görünür. Kaydedilmemiş değişiklik korunur; başarılı kayıttan sonra form gerçek veriyle eşitlenir.
6. **Telefondayım:** Ana işlere alt gezinmeden ulaşılır. İkincil ekranlar kaybolmaz; güvenli alan, klavye, küçük ekran ve yatay kullanım hesaba katılır.

## Yönetici senaryoları

1. **Operasyon özeti:** Onay bekleyen işletmeler, açık başvuru kuyruğu, kullanıcılar ve bugünkü rezervasyonlar gerçek sayılardır. Sıfır ve bağlantı hatası birbirinden ayrılır.
2. **Onay kuyruğu:** İşletme kaydı ile pazarlama başvurusu kaynak olarak ayrılır. `pending`, `received` ve `review` bekleyen kuyruğa dahildir. Arama, durum süzgeci, detay, inceleme, onay ve ret vardır. Etkili işlemler onay ister.
3. **Başvuru notu:** Pazarlama başvurusunun onaylanması tek başına işletme hesabı açmaz veya işletmeyi keşifte yayımlamaz. Arayüz bu farkı açıkça anlatır.
4. **Kiracı/kullanıcı/denetim:** Aranabilir, sayfalanan listeler; rol ve durum süzgeçleri; gerçek boş durum; yeniden deneme. Denetim çıktısında ham telefon veya oturum sırrı bulunmaz.
5. **Rezervasyon müdahalesi:** Tarih aralığı, işletme, durum ve kanal ile bulunur. Gösterilen kayıt sayısı ve sunucu sınırı dürüstçe belirtilir. Onay/iptal geri döndürülemez bir düğme gibi davranmaz.
6. **Rapor:** Grafik, ilk 200 satırın sayımı değil sunucu toplamıdır. Günler Europe/Nicosia sınırına göre gruplanır. Tarih aralığı seçilir; kişisel veri içermeyen günlük özet CSV olarak indirilebilir.
7. **Sistem:** API/DB sonucu gerçek kontrolden gelir. WhatsApp bağlı değil, bildirim kuyruğu kapalı ve bekleme listesi kapalı olduğu açıkça yazılır. Cihazın PWA durumu sunucu sağlığı diye sunulmaz.

## PWA ve etkileşim kabul ölçütleri

- Birincil gezinme en fazla beş hedef; tüm ikincil hedefler erişilebilir bir ek menüde. Masaüstünde tam yan menü.
- Dokunma hedefleri en az 44 × 44 px; form etiketleri görünür; iOS form yakınlaşmasını önlemek için girdi metni en az 16 px.
- 320, 375, 390, 430, 768 ve geniş masaüstünde sayfa düzeyinde yatay taşma yok. Uzun içerik alt gezinmenin altında kalmaz.
- `safe-area-inset-*`, Dynamic Island, home indicator, klavye açılması ve azaltılmış hareket desteklenir.
- Yükleniyor / boş / başarılı / hata / çevrimdışı / yetki kaybı durumları ayrıdır. Yükleniyor ekranı sonsuz boşluk değildir.
- Çevrimdışı bannerı görünür, yazma işlemleri engellenir. Bağlantı dönünce veri yenilenir; kullanıcı yazısı silinmez.
- Yenileme ve uygulamaya dönüsteki tazeleme yarışan eski isteklerin yeni sonucu ezmesine izin vermez.
- service worker güncellemesi devam eden formu otomatik yenileyerek kaybetmez. Yeni sürüm kullanıcıya bildirilir.
- Ana ekrana ekleme panellerden erişilebilir; Android istemi veya iOS yönergesi gerçek destek durumuna göre gösterilir.
- Manifestte panel kısayolları bulunur; tablet için portrait kilidi dayatılmaz.
- Odak görünür, diyalogda odak döngüsü ve Escape vardır; kapanınca odak tetikleyiciye döner. Durum iletimi `role=status` / `role=alert` ile yapılır.
- Mutasyonlar: istek sırasında kilit, açık onay, sunucudan doğrulama, başarıda görünür sonuç, hatada girdiyi koruma. Ham hata nesnesi kullanıcıya basılmaz.

## Uygulama sırası

1. Mevcut davranışı ve sözleşmeleri çıkar; ortak panel veri/yükleme/mutasyon altyapısını kur.
2. İşletme özetini, kurulum adımlarını ve talep yönetimini tamamla.
3. Hizmet/personel/profil/çalışma saatlerini gerçek CRUD ve durum yönetimiyle tamamla.
4. Yönetici özetini, birleşik onay kuyruğunu ve aramalı listeleri tamamla.
5. Sunucu toplamlı raporu, CSV dışa aktarımını ve gerçek sistem durumunu tamamla.
6. PWA gezinmesi, çevrimdışı koruma, güncelleme ve kurulum davranışını doğrula.
7. lint, typecheck, copy-check, birim/entegrasyon, üretim build ve Playwright çalıştır. Gerçek iPhone doğrulaması yapılmadıysa açıkça yaz.

## Teslim

- Çalışan kod ve bu promptun projeye uyarlanmış hali.
- Değişen sözleşmeler ve güvenlik kararları için kısa belge.
- Otomatik test sonuçları; çalıştırılamayanlar ve nedeni.
- Landing'in korunduğuna, PWA kapsamlarının ayrıldığına ve kişisel verinin önbelleklenmediğine ilişkin kontrol.
- Gerçek veriyle canlı önizleme; örnek hesap sırları repoda değil yalnız çalıştırma ortamında.
- Ayrı çalışma dalı ve `main` hedefli PR. Doğrudan üretim yayını veya veri tabanı migrasyonu kullanıcı onayı olmadan yapılmaz.
