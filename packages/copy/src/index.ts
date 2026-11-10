/**
 * Kullanıcıya görünen metinler — landing, meta, OG, manifest, form.
 * Bölge ifadesi: "Kuzey Kıbrıs ve Türkiye için".
 * Üstünlük ve onaylanmamış ücret iddiası yazılmaz.
 */
export const site = {
  name: "Ada Merkez",
  company: "Kırmızıyüz Live Development Software LTD",
  tagline: "Ada'nın merkezi.",
  regionLine: "Kuzey Kıbrıs ve Türkiye için",
  locale: "tr_TR",
  language: "tr",
  timezone: "Europe/Nicosia",
  title: "Ada Merkez — Kuzey Kıbrıs ve Türkiye için randevu ve rezervasyon",
  description:
    "Kuzey Kıbrıs ve Türkiye için işletme keşfi, kuaför ve klinik randevusu, restoran masa rezervasyonu. Uygulamayı indirmeden WhatsApp üzerinden de rezervasyon planlanıyor.",
} as const;

export const placeholders = {
  domain: "[ALAN ADI]",
  cta: "[CTA]",
  account: "[ADA MERKEZ HESABI]",
} as const;

export const nav = {
  how: "Nasıl çalışır",
  whatsapp: "WhatsApp ile",
  business: "İşletmeler",
  later: "Sonra",
  waitlist: "Bekleme listesi",
  apply: "İşletme başvurusu",
  menu: "Menü",
} as const;

export const hero = {
  kicker: "Kuzey Kıbrıs ve Türkiye için",
  title: "Adada randevu ve rezervasyon dağılmasın.",
  lead: "Kuaför, klinik veya restoranı bul; uygun saati seç. Dilersen uygulama indirmeden WhatsApp’tan hallet.",
  primaryCta: "[CTA]",
  secondaryCta: "İşletmeni yaz",
  note: "Çağrı yönü henüz netleşmedi · [doğrulanacak]",
} as const;

export const how = {
  kicker: "Nasıl çalışır",
  title: "Saat sormak için hattı meşgul etmeden.",
  intro:
    "Akış üç eşit kart değil: işletmeyi bulur, saati seçer, onaylarsın. Ya da aynı işi WhatsApp’tan yürütürsün.",
  steps: [
    {
      n: "01",
      title: "İşletmeyi bul",
      body: "Şehir ve kategori",
    },
    {
      n: "02",
      title: "Saati seç",
      body: "Europe/Nicosia",
    },
    {
      n: "03",
      title: "Onayla",
      body: "Onay bekleniyor",
    },
  ],
} as const;

export const sectors = {
  title: "v1 kapsamı",
  items: [
    {
      title: "Kuaför ve klinik",
      body: "Personel, hizmet ve uygun saat. Slotlar UTC saklanır, Europe/Nicosia saatine göre gösterilir.",
    },
    {
      title: "Restoran",
      body: "Masa planı ve masa rezervasyonu. Aynı masa için çakışan onaylı kayıt veritabanı düzeyinde tutulmaz.",
    },
  ],
} as const;

export const whatsapp = {
  kicker: "Uygulama indirmeden",
  title: "WhatsApp’tan söylemen yeter.",
  body: "Zaten yazıştığın yerden uygun saati söyle, onay gelsin. Aşağıdaki sohbet resmi bir mesajlaşma arayüzünün kopyası değildir; Ada Merkez’in stilize akışıdır.",
} as const;

export const roadmap = {
  title: "Sonra eklenecekler",
  intro:
    "Aşağıdakiler v2 yol haritasıdır. v1’de yokmuş gibi sunulmaz.",
  items: [
    { title: "QR menü", badge: "Yakında" },
    { title: "POS", badge: "Yakında" },
    { title: "Etkinlik bileti", badge: "Yakında" },
    { title: "Öğrenci indirimi", badge: "Yakında" },
  ],
} as const;

export const pilot = {
  title: "İşletmeler için",
  kicker: "İşletmeler için",
  heading: "Defter durmasın, boş saat görünsün.",
  body: "Müşteri uygun saati kendisi seçer. Gelen istekler — uygulama veya WhatsApp — aynı panelde durur. Hatırlatma gider. Fiyat ve paket buraya yazılmaz; [doğrulanacak].",
  citiesNote: "Pilot Lefkoşa, Girne ve Mağusa’da. Türkiye’deki işletmeler yakında aynı çatıda.",
  previewNote: "Tasarım önizlemesi — uydurma puan, yorum veya işletme sayısı yok.",
} as const;

export const close = {
  kicker: "Ada'nın merkezi",
  title: "Hazır olunca burada olur.",
  body: "Alan adı, lansman tarihi ve çağrı yönü henüz net değil. Yer tutucular bilinçli bırakıldı.",
  meta: "[ALAN ADI] · [ADA MERKEZ HESABI] · tarih [doğrulanacak]",
} as const;

export const waitlist = {
  title: "Bekleme listesi",
  intro:
    "Açılışta haber vermemizi isterseniz kaydolun. Bu bir ön satış veya ücret taahhüdü değildir.",
  heading: "Listeye yazıl.",
  lede: "Kuaför, klinik veya restoran için hazır olunca haber verelim. Dilersen uygulama indirmeden WhatsApp’tan da halledilir.",
  nameLabel: "Ad",
  nameOptional: "isteğe bağlı",
  namePlaceholder: "Adınız",
  nameError: "Ad en az iki karakter olmalı.",
  emailLabel: "E-posta",
  emailPlaceholder: "ornek@posta.com",
  phoneLabel: "Telefon",
  phonePlaceholder: "+90 5xx xxx xx xx",
  contactHint: "E-posta veya telefon, en az biri zorunlu.",
  contactError: "E-posta veya telefon yazın.",
  emailError: "Geçerli bir e-posta yazın.",
  phoneError: "Geçerli bir telefon yazın.",
  cityLabel: "Şehir",
  cityOtherLabel: "Şehrini yaz",
  cityHint: "Pilot: Lefkoşa, Girne ve Mağusa’da.",
  choiceError: "Bir seçim yapın.",
  cities: {
    lefkosa: "Lefkoşa",
    girne: "Girne",
    magusa: "Mağusa",
    diger: "Diğer",
  },
  segmentLabel: "Sen hangisisin",
  segmentHint: "Türkiye’den katılıyorsan bu seçenek raporlamayı ayırır.",
  segments: {
    ogrenci: "Öğrenci",
    yerli: "Yerli",
    tr_ziyaretci: "Türkiye’den ziyaretçi",
    diger: "Diğer",
  },
  consentLabel: "Açık rızam vardır.",
  consentLegal:
    "Aydınlatma metni yer tutucudur; onaylı metin gelince buraya yazılır. KVKK ve Kuzey Kıbrıs mevzuatı — [doğrulanacak].",
  consentError: "Devam etmek için rıza gerekli.",
  formMeta: "[CTA] · [ALAN ADI] · Bu bir rezervasyon formu değildir.",
  successTitle: "Kaydınız alındı.",
  successBody: "Gelişmeleri paylaşırız. Ek bir vaat yok. Bu bir rezervasyon değildir.",
  successMeta: "[ALAN ADI] · [CTA]",
  whatsappLabel:
    "WhatsApp üzerinden bilgilendirme mesajı almak istiyorum (isteğe bağlı). Aydınlatma metni kullanıcı onayı bekliyor.",
  submit: "Listeye yazıl",
  submitting: "Gönderiliyor",
  success: "Kaydınız alındı.",
  share: "Davet bağlantısı",
  shareCopied: "Bağlantı kopyalandı.",
  unavailable:
    "Bekleme listesi kaydı şu anda alınamıyor. Lütfen daha sonra yeniden deneyin.",
  consentRequired: "Devam etmek için rıza gerekli.",
  invalid: "Lütfen adı, şehri, segmenti ve en az bir iletişim alanını kontrol edin.",
  closedTitle: "Bekleme listesi çok yakında açılıyor",
  closedBody:
    "Yasal metinler onaylanınca kayıt alınacak. Şu an form kapalıdır; veri yazılmaz.",
  retentionNote:
    "Açık rıza ile iletişim bilgileri önerilen 730 gün saklanır; süre yasal metin onayıyla kesinleşir.",
  kvkkPlaceholder: "KVKK aydınlatma metni yakında",
  marketingConsentLabel: "Pazarlama ve ölçüm iletişimi için ayrı rızam vardır (isteğe bağlı).",
} as const;

export const businessApply = {
  title: "İşletme başvurusu",
  heading: "İşletmeni yaz.",
  intro:
    "Pilot Lefkoşa, Girne ve Mağusa’da. Türkiye’deki işletmeler ayrı bakılır; keşif listesine otomatik düşmez. Fiyat burada yoktur.",
  businessName: "İşletme adı",
  sector: "Sektör",
  sectors: {
    kuafor: "Kuaför/güzellik",
    klinik: "Klinik",
    restoran: "Restoran",
    diger: "Diğer",
  },
  inTurkey: "Türkiye’de işletmeyim",
  inTurkeyHint: "Ayrı değerlendirilir; otomatik yayına girmez",
  northCyprus: "Kuzey Kıbrıs",
  northCyprusHint: "Lefkoşa, Girne, Mağusa veya diğer",
  turkeyHint: "Türkiye’deki işletmeler ayrı değerlendirilir; keşif listesine otomatik düşmez.",
  locationLabel: "Konum",
  cityLabel: "Şehir",
  contactName: "Yetkili adı",
  phone: "Telefon",
  email: "E-posta",
  whatsapp: "WhatsApp hattı",
  notes: "Kısa not",
  consent: "Açık rızam vardır.",
  submit: "Başvuruyu gönder",
  submitting: "Gönderiliyor",
  success: "Başvurunuz alındı.",
  successBody: "İnceleme sonrası size döneceğiz. Bu bir kabul değildir. Fiyat veya paket vaadi yoktur.",
  formMeta: "[CTA] · [ALAN ADI] · Başvuru kabul anlamına gelmez.",
  unavailable: "Başvuru şu anda alınamıyor. Lütfen daha sonra yeniden deneyin.",
  invalid: "Zorunlu alanları ve rızayı kontrol edin.",
  closedTitle: "Başvuru çok yakında açılıyor",
  closedBody: "Yasal metinler onaylanınca işletme başvurusu alınacak. Şu an form kapalıdır.",
} as const;

export const qrPage = {
  kicker: "QR kanalı",
  lead: "Kuaför ve klinikte randevu, restoranda masa; dilerseniz WhatsApp üzerinden. Uygulama indirmek zorunda değilsiniz.",
  cta: "Bekleme listesine yazıl",
} as const;

export const trackingConsent = {
  title: "Çerez ve ölçüm",
  body: "Ölçüm ve pazarlama çerezleri kapalı başlar. Kabul ederseniz Pixel ve GA4 yüklenir; reddederseniz yalnızca gerekli çerezler kalır. İletişim rızası formda ayrıdır.",
  accept: "Kabul et",
  reject: "Reddet",
} as const;

export const install = {
  title: "Ada Merkez’i ana ekrana ekle",
  body: "Kuzey Kıbrıs ve Türkiye için. Mağaza rozeti yoktur; v1 bir PWA’dır.",
  cta: "Ekle",
  ios: "iPhone veya iPad’de Paylaş menüsünden “Ana Ekrana Ekle”yi seçin.",
  dismiss: "Şimdi değil",
} as const;

export const legal = {
  pendingTitle: "Kullanıcı onayı bekliyor",
  pendingBody:
    "Bu sayfa yer tutucudur. Aydınlatma metni, gizlilik ve ilgili mevzuat metinleri kullanıcı onayıyla yazılacaktır. Şu an yayımlanmış bir yasal metin yoktur. KVKK metni [doğrulanacak].",
  aydinlatmaTitle: "Aydınlatma metni",
  gizlilikTitle: "Gizlilik",
  kvkkTitle: "Kişisel veriler",
  retentionNote:
    "Bekleme listesi ve rıza kaydı için önerilen saklama süresi 730 gündür; süre yasal metin onayıyla kesinleşir. Silme talebi API taslağı üzerinden alınır.",
} as const;

export const footer = {
  companyLine: "Kırmızıyüz Live Development Software LTD",
  rights: "Tüm hakları saklıdır.",
  aydinlatma: "Aydınlatma metni [doğrulanacak]",
  gizlilik: "Gizlilik [doğrulanacak]",
  kvkk: "Kişisel veriler [doğrulanacak]",
  contact: "İletişim [doğrulanacak]",
  logoNote: "Logo kesin değil, yer tutucu.",
} as const;

export const apiMessages = {
  dbUnavailable:
    "Bekleme listesi kaydı şu anda alınamıyor. Lütfen daha sonra yeniden deneyin.",
  consentRequired: "Açık rıza olmadan kayıt alınmaz.",
  notFound: "Kayıt bulunamadı.",
  otpLimited: "Çok fazla deneme. Lütfen daha sonra yeniden deneyin.",
  deletionReceived: "Silme talebiniz alındı.",
} as const;

export const offline = {
  title: "Çevrimdışı",
  body: "Bu sayfa cihazınıza kaydedildi. Bağlantı gelince bekleme listesi ve güncel içerik yeniden yüklenir.",
  retry: "Yeniden dene",
} as const;
