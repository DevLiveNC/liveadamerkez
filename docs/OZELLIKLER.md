# Özellik Listesi

Durumlar: `plan` (başlanmadı), `kısmen` (çalışıyor, eksikleri var), `uygulanda` (uçtan uca çalışır).

| # | Özellik | Sürüm | Durum | Not |
|---|---|---|---|---|
| 1 | İşletme keşfi (şehir/kategori) | v1 | uygulanda | `/app` keşif, `/app?q=` ve `/app?category=` arama; harita ve semt verisi yok |
| 2 | Kuaför/klinik slot randevu | v1 | uygulanda | hizmet + personel + slot; rezervasyon sheet, Europe/Nicosia; DB düzeyinde çakışma koruması |
| 3 | Restoran masa planı + rezervasyon | v1 | kısmen | rezervasyon talebi akışı var; masa planı editörü ve kaynak (masa) yönetimi yok |
| 4 | WhatsApp AI rezervasyon | v1 | plan | WhatsApp kanalı stub (göndermez); OTP ve derin bağlantı altyapısı hazır |
| 5 | İşletme paneli | v1 | uygulanda | genel, takvim, talepler, hizmetler, ayarlar; sunucu tarafında rol kilidi |
| 6 | Hatırlatma bildirimleri | v1 | kısmen | uygulama içi bildirim + onay/slot önerisi olayları; WhatsApp/SMS gönderimi stub |
| 7 | QR menü (CyQRMenu) | v2 | plan | landing'de "Yakında" |
| 8 | POS (live Yazar Kasa) | v2 | plan | — |
| 9 | Etkinlik bileti (CY Ticket) | v2 | plan | landing'de "Yakında" |
| 10 | Öğrenci indirimi (Ada Kampüs) | v2 | plan | landing `#sonra` kartında tanıtım metni var |

Yönetim paneli (PLAN dışı ek kapsam): genel, onaylar, kiracılar, kullanıcılar, rezervasyonlar, raporlar, denetim, sistem — sunucu kilidi ve RLS ile.
