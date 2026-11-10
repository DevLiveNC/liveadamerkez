# Ada Merkez — Ürün özeti, rakip analizi ve konumlandırma

Tarih: 10 Kasım 2026 (Asia/Famagusta) · Kaynak taraması aynı gün · Taslak, onay bekler  
Hazırlayan: Ada Merkez · İçerik  
Kural: Bu dosyada yalnızca kaynaklı veya ortak plan dosyalarında yazılı bilgi vardır. Bulunamayanlar uydurulmaz; `[doğrulanacak]` veya “bilinmiyor” diye işaretlenir.

---

## 1. Ürün özeti (kesinleşenler)

**Ad ve sahip.** Uygulamanın adı kullanıcı kararıyla **Ada Merkez**’tir (10 Kasım 2026, LiveDev Şef transkripti). Sahibi **KIRMIZIYÜZ Live Development Software LTD / liveDevelopment**.

**Ne olduğu.** KKTC için planlanan bir süper uygulama: işletme keşfi + randevu/rezervasyon. Planda, müşterinin uygulama indirmeden **WhatsApp AI üzerinden rezervasyon** yapabilmesi de vardır. Bu özellik dış metinde “ilk”, “tek” veya benzersiz diye sunulmaz (Rezbee’nin paketlerinde yapay zeka randevu asistanı vardır; bkz. §3.2 ve §5). Mevcut ürün ailesinin (CyQRMenu, live Yazar Kasa, CY Ticket, Ada Kampüs öğrenci indirimi) ileride tek yerde toplanması hedeflenir. Kaynak: `/workspace/ada-merkez/PLAN.md`, `/workspace/ada-merkez/OZELLIKLER.md`, LiveDev Şef’in ürün önerisi.

**MVP (v1) kapsamı** (`PLAN.md`, `OZELLIKLER.md`):

| Özellik | Sürüm | Durum |
|---|---|---|
| İşletme keşfi (şehir / kategori / harita) | v1 | plan |
| Kuaför / klinik: personel + hizmet + slot randevu | v1 | plan |
| Restoran: masa planı + rezervasyon | v1 | plan |
| WhatsApp AI rezervasyon | v1 | plan |
| İşletme paneli | v1 | plan |
| Hatırlatma bildirimleri (WhatsApp / SMS) | v1 | plan |
| QR menü (CyQRMenu) | v2 | plan (v1’de yalnızca bağlantı / derin link) |
| POS (live Yazar Kasa) | v2 | plan |
| Etkinlik bileti (CY Ticket) | v2 | plan |
| Öğrenci indirimi (Ada Kampüs) | v2 | plan |

**Kanallar (v1).** Web / PWA (müşteri + işletme paneli) ve WhatsApp botu. Yerel mobil uygulamalar sonraya bırakılmıştır. Dil: v1 Türkçe; İngilizce ve Rusça sonra (`PLAN.md`).

**Hedef coğrafya ve pilot niyeti.** Lefkoşa, Girne ve Mağusa’da **15–20 işletmeyle** deneme planlanmıştır. İsimli pilot işletme listesi yoktur. İlk işletmelerin CyQRMenu kullanıcıları ve mevcut lead listelerinden bulunması *önerilmiştir*; bu bir karar veya imzalı anlaşma değildir. Kaynak: `PLAN.md`; Şef ürün önerisi.

**Teknik yığın.** LiveDev Şef, Dev’in önerdiği yığını onaylamıştır: Next.js (App Router) + TypeScript PWA, Tailwind, Neon Postgres + Drizzle, Vercel, WhatsApp için mevcut live-chat-bot (WhatsApp Cloud API). Auth taslağı: müşteride telefon (WhatsApp OTP), işletme panelinde e-posta. Prod’a alma yalnızca Şef onayıyla. Kaynak: Şef → Dev mesajı, 10 Kasım 2026; `PLAN.md`.

**Kontrol şartları (kodlamadan önce plana eklenecek).** Kişisel veri aydınlatması ve açık rıza (WhatsApp hatırlatmaları dahil), saklama / silme akışı; veritabanı düzeyinde çift rezervasyon koruması; WhatsApp OTP sınırlama; çok kiracılı yetki testleri; CI’da lint, typecheck, birim ve en az bir uçtan uca rezervasyon testi; slot saat diliminin Europe/Nicosia (Asia/Famagusta) ile tutarlı saklanması. Kaynak: `/workspace/ada-merkez/KONTROL-NOTLARI.md`.

---

## 2. Açık sorular (bilinmiyor / doğrulanmalı)

İçerikte, lansman metninde veya görselde doldurulmamalıdır.

1. **Lansman tarihi** — karar yok.
2. **Alan adı** — karar yok. Şef bakacağını söylemiştir; bu tarama sırasında kesin sonuç raporu ortak dosyalara işlenmemiştir.
3. **Fiyatlandırma** — karar yok, uydurulmaz. Şef’in *onaylanmamış* önerisi (müşteri ücretsiz; işletme Başlangıç 990 TL/ay, Büyüme 1.980 TL/ay, Pro 3.300 TL/ay; biletten %6–8 komisyon) yalnızca iç not olarak durur. Dış metinde fiyat yazılmaz.
4. **Yasal metinler** — yok. KKTC mevzuatı ve TR’li kullanıcılar için KVKK metinleri kullanıcı onayıyla yazılacaktır (`KARARLAR.md`, `KONTROL-NOTLARI.md`).
5. **GitHub reposu** — kullanıcı açacak; kod iskeleti buna bağlı (`GOREV-PANOSU.md`).
6. **Ada Merkez Instagram / TikTok / vs. hesap adları** — bu dosyalarda handle uydurulmaz. `[ADA MERKEZ HESABI]` yer tutucusu kullanılır.
7. **Marka kiti** (logo, renk, font, grid) — henüz yok; Tasarım botunun işidir. Reels ve postlarda liveDevelopment yeşili (#00D26A) Ada Merkez’in onaylı rengi gibi kullanılmamalıdır. Vurgu rengi: `[MARKA VURGU]`.
8. **İsimli pilot işletmeler, müşteri yorumları, indirme / rezervasyon sayıları** — yok; uydurulmaz.
9. **Ön kayıt / bekleme listesi / CTA hedefi** — “yakında”, “ön kayıt”, “işletmeni yaz” gibi hangi çağrının kullanılacağı `[doğrulanacak]`.

---

## 3. Rakip analizi (yalnızca kaynaklı)

Önemli ayırım: “Slotify” adıyla birden fazla ürün vardır. Bu projenin bakılan rakibi, kullanıcının verdiği **[slotify.com.tr](https://slotify.com.tr/)** adresidir. Aşağıdakiler *aynı ürün değildir*: [slotifyco.com](https://slotifyco.com/) (berber / kuaför / güzellik, AP Labs / Emre Pozut), [slotify.shop](https://slotify.shop/) (“Built for local businesses in Cyprus” der; ayrı bir teklif), [slotify.ca](https://slotify.ca/) (Kanada). Karışıklık olmaması için içerikte rakip adı geçince site adresiyle konuşulmalıdır.

### 3.1 Slotify — [slotify.com.tr](https://slotify.com.tr/)

**Ne sunuyor (resmi site, 10 Kasım 2026).** “İşletmelerden rezervasyon yapmanın en hızlı yolu / Uygun saati bul, tek tıkla rezervasyon yap.” Kategoriler: Kişisel Bakım, Medikal, Sağlık & Fitness, Masa Rezervasyonu, Araç Kiralama, Ders. İşletme planları iki kolda anlatılır: **Standart** (kişisel bakım, sağlık, eğitim, evcil hayvan, araç kiralama ve diğerleri) ve **Mekân** (restoran ve toplantı odası). Site TR / EN / RU / EL dillerini sunar. Uygulama: [App Store](https://apps.apple.com/tr/app/slotify/id6766551503), [Google Play](https://play.google.com/store/apps/details?id=com.muz0german.randevum). İşletme paneli: [admin.slotify.com.tr](https://admin.slotify.com.tr/).

**İşletmeye vaat edilenler (ana sayfa).** Sınırsız rezervasyon ve takvim; personel, hizmet ve çalışma saati yönetimi; müşteri listesi ve geçmiş; bildirim / hatırlatma; analitik; uygulamada görünürlük. **14 günlük ücretsiz deneme**, “kart gerekmez, tüm özellikler açık.” Aylık / yıllık seçenek var. Ana sayfada Standart ve Mekân planlarının tutarı **tire (—)** olarak durur; kesin rakam bu taramada kamuya açık sayfada görünmedi. Kaynak: [slotify.com.tr](https://slotify.com.tr/).

**Ödeme modeli (kullanım koşulları, 20 Ekim 2026).** Slotify aracı platformdur. “Hizmet bedeli işletme ile kullanıcı arasında, Slotify dışında belirlenir ve tahsil edilir.” Restoran ve toplantı odası gibi bazı işletmeler rezervasyonu kesinleştirmek için **kapora** isteyebilir; kapora kartla alınır, altyapı Stripe’tır. Müşteri iptalinde kapora iade edilmez, işletme iptalinde iade edilir. Kaynak: [Kullanım Koşulları](https://slotify.com.tr/terms-of-use).

**Uygulama mağazaları (10 Kasım 2026).** Geliştirici: Hüseyin Ekşici (App Store: Huseyin Eksici). iOS ilk sürüm **13 Ağustos 2026**; 16 Ekim 2026 notunda araç kiralama ve ders kategorileri, rezervasyona yorum, Rusça ve İngilizce eklenmiş (1.0.2). Diller: İngilizce, Yunanca, Rusça, Türkçe. Google Play: “50+ indirme” (kova; tam sayı değildir), destek telefonu **+90 548 888 23 66**, e-posta [contact@slotify.com.tr](mailto:contact@slotify.com.tr), geliştirici ülkesi “Türkiye”. 0548, KKTC mobil ön ekidir; bu bir destek hattı işaretidir, resmi “KKTC’de lansman oldu” haberi değildir. Gizlilik politikası (27 Ekim 2026) Türk KVKK (6698) çerçevesinde yazılmıştır; veri sorumlusu metinde “Slotify” olarak geçer, şirket unvanı bu taramada netleşmedi. Kaynaklar: [App Store](https://apps.apple.com/tr/app/slotify/id6766551503), [Google Play](https://play.google.com/store/apps/details?id=com.muz0german.randevum&hl=tr), [Gizlilik Politikası](https://slotify.com.tr/privacy-policy).

**KKTC varlığı — dikkat.** Kullanıcı Slotify’ın KKTC’de açıldığını söylemiştir. Bu taramada resmi bir lansman haberi bulunamadı. Destek hattının 0548 olması ve Yunanca arayüz, ada / Kıbrıs pazarına yönelik bir işarettir; canlı işletme sayısı, şehir dağılımı ve resmi açılış tarihi **[doğrulanacak]**. Ana sayfadaki “Velora Hair Studio”, “Northside Barbers”, “4.9 (128)”, “₺500” gibi öğeler pazarlama arayüzü örneği gibi durur; gerçek işletme veya istatistik diye kullanılmaz.

**Instagram.** Resmi sitede Instagram bağlantısı yok. Handle bu taramada doğrulanamadı; uydurulmaz.

**İçerikte kullanılmayacak Şef notu.** Daha önceki iç incelemede “4 para birimi” ve “Android’de yaklaşık 73 indirme” denmişti. 10 Kasım 2026 itibarıyla 4 para birimi kamuya açık sayfada doğrulanamadı; Play Store “50+” gösterir. Bu rakamlar içerikte yazılmaz.

### 3.2 Rezbee — [rezbee.app](https://rezbee.app/)

**Ne sunuyor.** Kendini “KKTC Online Randevu Platformu” olarak tanımlar. Kuzey Kıbrıs merkezli **Gigabyte Ltd** tarafından, 2025’te kurulmuş bir ekipçe geliştirilir. Kategoriler (6): berber, kuaför, güzellik merkezi, spa & masaj, spor (salon, antrenör, yoga, halısaha), sağlık (fizyoterapi, diyetisyen, ruh sağlığı). Şehirler: Lefkoşa, Girne, Gazimağusa, Güzelyurt, İskele; “KKTC’nin tüm ilçeleri” der. Türkçe ve İngilizce. Müşteri için randevu ücretsizdir; hizmet bedeli işletmeye ödenir. “Uygulama şart değil” — web’den, telefon doğrulamasıyla randevu. Uygulamada hatırlatma, QR ile giriş, BeePoints. Devlet hastanesi / muhaceret randevusunun kendilerinde alınmadığını açıkça ayırırlar. Kaynaklar: [rezbee.app](https://rezbee.app/), [Hakkımızda](https://rezbee.app/hakkimizda).

**İşletme teklifi ve fiyat (resmi sayfa).** Ücretsiz kayıt + temel paket. **Pro paket 1 Ocak 2027’ye kadar abonelik ücreti olmadan** (erken erişim). Mekânda ödemede komisyon yok. Online kart: Ücretsiz pakette %10 hizmet bedeli, Pro’da %3 kart bedeli. Listelenen Pro tarife (promosyon bitince): aylık **50 USD**, yıllık **500 USD** (12 ay yerine 10 ay). Ücretsiz pakette 1 kullanıcı ve ayda 30 “yapay zeka randevu asistanı” konuşması; Pro’da çoklu çalışan, sınırsız asistan, SMS / WhatsApp hatırlatma ve otomatik mesaj, kapora, raporlar, şube. Kaynak: [İşletmeler / fiyatlandırma](https://rezbee.app/isletmeler).

**Listelenen işletmeler.** Ana sayfa “Tüm işletmeleri göster **(41)**” der (10 Kasım 2026). Çoğu Lefkoşa’da görünür; Girne ve Gazimağusa’da daha az satır vardır. Bu, sitenin o günkü kendi listesidir; doluluk veya aktif kullanım iddiası olarak çoğaltılmaz. İsimleri Ada Merkez metinlerinde rakip örneği veya “onlar bizde yok” diye kullanmayın.

**Kurumsal iz.** LinkedIn şirket sayfası Lefkoşa / Kıbrıs, 2025, [rezbee.app](https://rezbee.app/), e-posta info@rezbee.app. Aynı sayfa Instagram olarak [instagram.com/rezbee.app](https://www.instagram.com/rezbee.app) gösterir. Instagram profilinin güncel içeriği bu taramada giriş duvarı nedeniyle okunamadı; handle’ı LinkedIn’e dayandırıyoruz, içerik iddiası yok. Kurucu / fikir tarafı olarak Can Kaygısız’ın LinkedIn paylaşımları Rezbee’yi KKTC pazarına çıkmış, sonraki adımı Avrupa diye anlatır. Rezbee, Eunite Cyprus G360 programında 88 adaydan 40 kişilik kadroya seçildiğini 10 Nisan 2026 tarihli bir paylaşımda duyurmuştur. Kaynaklar: [LinkedIn şirket](https://www.linkedin.com/company/rezbee-app), [Can Kaygısız paylaşımı (G360)](https://tr.linkedin.com/posts/cankaygisiz_rezbee-eunite-cyprus-b%C3%BCnyesinde-y%C3%BCr%C3%BCt%C3%BClen-activity-7448374245426012160-NOor). İletişim (site): +90 533 836 07 03, info@rezbee.app.

### 3.3 Kısa karşılaştırma (iç kullanıma; rakip adı kamuya saldırı metni olmasın)

| Konu | Slotify (slotify.com.tr) | Rezbee | Ada Merkez (plan) |
|---|---|---|---|
| Pazar mesajı | Çok kategorili hızlı rezervasyon, uygulama + web | “KKTC online randevu”, web’den de randevu | Ada süper uygulaması; keşif + randevu, WhatsApp’tan da rezervasyon |
| v1 sektör | Bakım, medikal, fitness, masa, araç, ders | Bakım, spa, spor, sağlık (restoran yok) | Kuaför/klinik + restoran |
| Uygulamasız / sohbetli rezervasyon | Web rezervasyonu var; WhatsApp ile *konuşarak* rezervasyon iddiası sitede yok | Web’den randevu var; paketlerde **yapay zeka randevu asistanı** (Ücretsiz: ayda 30 konuşma, Pro: sınırsız); WhatsApp hatırlatma ve otomatik mesaj | WhatsApp AI ile rezervasyon (uygulama indirmeden) — plan. Dışarıda “ilk / tek / benzersiz” denmez |
| İşletme fiyatı | 14 gün deneme; tutarlar kamuya açık değil | Ücretsiz + Pro (2027’ye kadar ücretsiz ilan); sonra 50 USD/ay | **[doğrulanacak]** |
| Sonraki katman | POS, QR menü, bilet bu taramada görünmüyor | Marketplace + işletme SaaS | v2: CyQRMenu, POS, CY Ticket, Ada Kampüs |
| Durum | Canlı site ve mağaza uygulaması | Canlı site, iOS/Android, listelenmiş işletmeler | Plan / henüz ürün yok |

---

## 4. KKTC içerik trendlerine kısa bakış (kaynaklı)

Uydurma “sektör istatistiği” yoktur. Aşağıdakiler yalnızca yayımlanmış kaynakların söylediğidir.

- **“Randevu” araması kamu hizmetine kayabilir.** KKTC’de devlet hastanesi randevusu Sağlık Bakanlığı sistemi, e-Devlet ve 1101 hattı üzerinden yürür. Rezbee bunu kendi hakkımızda sayfasında özel işletme randevusundan ayırır. Ada Merkez içerikleri “hastane randevusu” ile karışmamalı; kuaför, klinik ve restoran bağlamı baştan net olmalıdır. Kaynaklar: [Sağlık Bakanlığı — Randevu](http://saglik.gov.ct.tr/RANDEVU), [Rezbee Hakkımızda](https://rezbee.app/hakkimizda).
- **Yerel ajansların içerik tavsiyesi (KKTC).** Quartz Medya (6 Mart 2026): her paylaşımın telefon, WhatsApp veya ziyaret gibi bir sonraki adıma hizmet etmesi; haftada bir–iki iyi hazırlanmış içeriğin her gün acele paylaşımdan daha yönetilebilir olması; Girne / Lefkoşa / Mağusa / Güzelyurt gibi *gerçekten hizmet verilen* bölgenin yazılması; stok “toplantı masası” görseli yerine kendi mekân ve ekip fotoğrafı. Fuse Creative (18 Mayıs 2026, güncelleme 5 Ekim 2026): küçük pazarda düzenli ve kendine özgü hesabın çabuk fark edildiği; yazın turist, kışın yerel ve öğrenci ritmine göre plan; Reels’in yeni kişiye, Story’nin mevcut takipçiye daha doğal hizmet ettiği; hesabın bir yüzünün olması. Bunlar ajans blog yazılarıdır, ölçülmüş ada geneli araştırma değildir. Kaynaklar: [Quartz Medya rehberi](https://quartzmedya.com/blog/kktc-sosyal-medya-yonetimi-rehberi), [Fuse Creative yazısı](https://fusecreativeagency.digital/blog/kktc-sosyal-medya-stratejisi/).
- **Rakip mesajı zaten “telefonsuz, 7/24, uygulama şart değil” dilinde.** Hem Slotify hem Rezbee bu vaadi kullanır. Rezbee ayrıca paketlerinde yapay zeka randevu asistanı sunar. Ada Merkez planında WhatsApp üzerinden rezervasyon ve ileride menü, ödeme, bilet, öğrenci indiriminin aynı çatıda toplanması vardır; bunlar dış metinde “ilk”, “tek” veya benzersiz diye anlatılmaz. Ürün hazır olana kadar dil “yakında / plan” kalır.

---

## 5. Konumlandırma önerisi

**İç konum satırı (onay bekler):**  
Ada Merkez, Kuzey Kıbrıs’ta işletmeyi bulup randevu veya masa rezervasyonu yapmanın tek adresi olsun. Müşteri uygulamayı indirmek zorunda değil; WhatsApp’tan da halledebilir. İşletme tek panelden takvimini yönetir. İleride aynı çatıya menü, kasa, bilet ve öğrenci indirimi eklenir.

**Müşteri tarafı vaat (v1, abartısız):** “Uygun saati gör, randevunu al; dilersen yalnızca WhatsApp’tan.”  
**İşletme tarafı vaat (v1, abartısız):** “Telefonla saat yazmak yerine müşteri kendi boş saati seçsin; hatırlatma gitsin.”  
**Söylenmeyecekler:** rakip kötüleme; uydurma işletme sayısı, puan, “adanın bir numarası”; onaylanmamış fiyat; henüz olmayan v2 özelliklerini v1’de varmış gibi sunmak; isimsiz “pilot kuaförümüz” hikâyesi; WhatsApp AI rezervasyonu “ilk”, “tek” veya benzersiz diye sunmak (Rezbee’de yapay zeka randevu asistanı vardır).

**Rekabet açısı (iç not).** Rezbee KKTC’de yerleşik, web’den randevu ve erken erişimde ücretsiz Pro ile işletme topluyor; paketlerinde yapay zeka randevu asistanı, WhatsApp hatırlatma ve otomatik mesaj da vardır. Restoran / masa planı onun ana vaadinde yok. Slotify (slotify.com.tr) kategori olarak daha geniş (masa, araç, ders) ve uygulamalı; kamuya açık fiyatı yok, WhatsApp’tan konuşarak rezervasyon iddiası sitede yok. Ada Merkez yol haritasında, *hazır olduğunda*, şunlar anlatılabilir (dışarıda “ilk / tek / benzersiz” denmeden): WhatsApp üzerinden rezervasyon, restoran masa planının v1’de oluşu, mevcut Live Development ürünlerinin v2’de birleşmesi, yerelde tanınan bir yazılım şirketinin ürünü olması. Bunlar henüz vaat değil, yol haritasıdır.

**İçerik duruşu.** Türkçe, sade, ada ağzına yakın ama uydurma slogan yağmuru olmadan. İngilizce alt satır, turist / öğrenci hedefi netleşince eklenir (ürün v1 dili TR). CTA tek ve açık. Pilot hikâyesi ancak işletme onayı ve gerçek isimle.
