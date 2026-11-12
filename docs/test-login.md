# Kodsuz test girişi

Geçici test numarası: **+90 539 118 02 04**.

- Giriş ekranında numara hazır gelir. Müşteri, İşletme veya Yönetici sekmesini seçip **Kodsuz test girişi** düğmesine basın.
- Giriş ve kayıt modlarında OTP isteği gönderilmez, kod girilmez.
- İlk başarılı istekte üç hesap da veritabanında oluşturulur. İşletme hesabına onaylı, gerçek işletme olmayan bir test işletmesi ve sahip üyeliği atanır. Tekrarlanan girişler aynı hesapları kullanır.
- Müşteri keşfe, işletme işletme paneline, yönetici yönetim paneline gider. Belirtilmiş dönüş adresi varsa korunur.
- Diğer numaralarda mevcut OTP zorunluluğu ve açık yönetici kaydı yasağı korunur.

## Ortam ayarları

API için çalışan `DATABASE_URL`, uygulanmış veritabanı migration'ları ve `AUTH_SECRET` gereklidir. Landing sunucusunda oturumu doğrulayan `AUTH_SECRET` API ile aynı olmalıdır. Landing için `API_URL` veya `NEXT_PUBLIC_API_URL` gerçek API dağıtım adresini göstermelidir; uzak dağıtımda localhost kullanılmaz. Kod değişiklikleri dağıtılmadan mevcut canlı site değişmez.

`AUTH_TEST_LOGIN=on` ve `AUTH_TEST_PHONES=+905391180204` API ve landing üzerinde aynı ayarlanabilir. Ayar verilmediğinde bu numara için test erişimi açıktır. Virgül veya noktalı virgülle başka test numaraları belirtilebilir.

## Güvenlik: yalnız geçici test ortamı

Bu numara bir parola değildir. Test erişimi açıkken numarayı bilen herkes, **yönetici dahil**, bu test hesaplarına girebilir. Gerçek müşteri verisi bulunan canlı ortamda açık bırakmayın. Test bittiğinde **API ve landing üzerinde `AUTH_TEST_LOGIN=off`** yapıp yeniden dağıtın. Mevcut oturumlar sekiz saate kadar geçerli kalır; kapatma mevcut oturumları iptal etmez. Test kayıtlarını kaldırmak veya oturumları ayrıca sonlandırmak gerekebilir.
