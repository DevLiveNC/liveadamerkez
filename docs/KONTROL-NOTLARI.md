# Kontrol Notları

## 2026-11-10 · PLAN.md v0 incelemesi — Koşullu onay
Plan yönü uygun; aşağıdakiler kodlamadan önce plana eklenmeli:
1. Kişisel veri: telefon, rezervasyon ve müşteri verisi işleniyor. Aydınlatma metni, açık rıza (WhatsApp hatırlatma mesajları dahil), saklama süresi ve silme talebi akışı planda yok. KKTC mevzuatı ve TR'li kullanıcılar için KVKK, yasal metinler kullanıcı onayıyla yazılmalı.
2. Çift rezervasyon: aynı slot/masa için veritabanı düzeyinde benzersizlik veya kilit (yalnızca uygulama kontrolü yetmez).
3. WhatsApp OTP: istek sınırlama (rate limit), deneme sınırı ve kötüye kullanım koruması.
4. Çok kiracılı yetki: işletme paneli yalnızca kendi işletmesinin verisini görebilmeli; testle doğrulanmalı.
5. CI'da zorunlu adımlar: lint, typecheck, birim testleri, rezervasyon akışı için en az bir uçtan uca test.
6. Saat dilimi: tüm slotlar Europe/Nicosia (Asia/Famagusta) ile tutarlı saklanmalı.

## 2026-11-10 · İçerik paketi v1 (icerik/00–04) — Koşullu onay
Kaynaklar ve yer tutucular düzgün; uydurma rakam, yorum ya da pilot adı yok. Tarz adları TARZLAR.md ile uyumlu. Briefler aşağıdaki düzeltmelerden sonra Tasarım ve Sosyal'e gidebilir.

**Zorunlu düzeltmeler**
1. İmla/anlam: "Kuaföre ramak kalmıştın" yanlış ("ramak kalmak" bir şeyin, çoğunlukla kötü bir şeyin olmasına çok az kalması demek). Öneri: "Kuaföre gidecektin. Telefonu açtın, hat meşguldü." Hook 1, takvim 2. gün, Reels sahne 1 ve brief'te değişmeli.
2. 5. gün caption: "randevuyu ... vermek istiyoruz" müşteri için yanlış fiil. Öneri: "Randevunu uygulamadan da, WhatsApp'tan da alabilmeni istiyoruz."
3. 5. gün "Herkes WhatsApp kullanıyor." kanıtsız genelleme. Öneri: "WhatsApp zaten telefonunda."
4. 3. gün caption "kapı kapı aramaya" deyim karışıyor. Öneri: "tek tek aramaya".
5. Fark iddiası: Rezbee'nin Ücretsiz/Pro paketinde "yapay zeka randevu asistanı" var (00-baglam 3.2). "WhatsApp'ta konuşarak rezervasyon" farkı dış metinde "ilk/tek" diye sunulmamalı; konumlandırmaya bu not eklensin.
6. Brief'e kullanıcının yürürlükteki kuralları açıkça yazılsın: her tasarımla düzenlenebilir Canva linki teslim edilir; görsel üretimi yalnızca Chat GPT botu üzerinden ve en az kredi ile yapılır (02 takvimdeki "kısıt gelirse" ifadesi yerine).
7. 3. gün yorum CTA'sı ("SAAT/MASA"): otomatik DM yok, cevabı kimin elle vereceği yazılmalı; yoksa bu CTA kullanılmamalı.

**Küçük notlar**
- Reels: seslendirme ~40 kelime, dosya "90–110 kelime" diyor. Rakam ~40–50 olarak düzeltilsin (30 sn için yeterli).
- 01 kampanya, kilitler listesi: "taslakte" → "taslakta".
- 00-baglam: rakip geliştiricinin kişisel Gmail adresi iç dosyada bile gereksiz; yalnızca kurumsal iletişim kalsın.

## 2026-11-10 · İçerik paketi v1.1 — Onay
7 zorunlu düzeltme ve küçük notlar doğrulandı (rg). Brief Tasarım ve Sosyal botlarına iletilebilir. Yayın ve yer tutucuların (tarih, alan adı, hesap, CTA) doldurulması kullanıcı onayına bağlı.
