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

export const nav = {
  features: "Ne sunulacak",
  waitlist: "Bekleme listesi",
  business: "İşletmeler",
  legal: "Yasal",
} as const;

export const hero = {
  kicker: "Yakında",
  title: "Kuzey Kıbrıs ve Türkiye için randevu ve rezervasyon",
  lead: "Kuaför ve klinikte saat seçin, restoranda masa ayırın. Dilerseniz uygulamayı indirmeden WhatsApp üzerinden de rezervasyon yapılabilecek.",
  primaryCta: "Bekleme listesine yazıl",
  secondaryCta: "İşletmeler için",
} as const;

export const how = {
  title: "Nasıl çalışacak",
  intro:
    "Ürün henüz açık değil. Aşağıdaki adımlar v1 planıdır; canlı kullanım sayı veya işletme adı içermez.",
  steps: [
    {
      n: "01",
      title: "İşletmeyi bulun",
      body: "Şehir ve kategoriye göre kuaför, klinik veya restoran arayın.",
    },
    {
      n: "02",
      title: "Saat veya masa seçin",
      body: "Kuaför ve klinikte personel ile hizmete göre slot; restoranda masa planı üzerinden rezervasyon.",
    },
    {
      n: "03",
      title: "WhatsApp’tan da ilerleyin",
      body: "Uygulama şart değil. WhatsApp sohbeti üzerinden rezervasyon v1 kapsamında planlanıyor.",
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
  title: "WhatsApp üzerinden rezervasyon",
  body: "Uygulamayı indirmek zorunda değilsiniz. Planlanan akış: işletmeyi ve saati sohbet içinde netleştirmek. Bu özellik hazır olduğunda duyurulur; henüz bağlanmış bir hat yoktur.",
} as const;

export const roadmap = {
  title: "Sonra eklenecekler",
  intro:
    "Aşağıdakiler v2 yol haritasıdır. v1’de yokmuş gibi sunulmaz.",
  items: [
    { title: "QR menü", badge: "Yakında" },
    { title: "POS / yazar kasa", badge: "Yakında" },
    { title: "Etkinlik bileti", badge: "Yakında" },
    { title: "Öğrenci indirimi", badge: "Yakında" },
  ],
} as const;

export const pilot = {
  title: "Pilot",
  body: "Pilot Lefkoşa, Girne ve Mağusa’da yapılacak. İsimli işletme listesi yoktur; katılım ayrı onaya bağlıdır.",
} as const;

export const waitlist = {
  title: "Bekleme listesi",
  intro:
    "Açılışta haber vermemizi isterseniz kaydolun. Bu bir ön satış veya ücret taahhüdü değildir.",
  roleLabel: "Kayıt türü",
  roleCustomer: "Müşteri olarak izlemek istiyorum",
  roleBusiness: "İşletme olarak izlemek istiyorum",
  nameLabel: "Ad",
  namePlaceholder: "Adınız",
  phoneLabel: "Telefon",
  phonePlaceholder: "+90 5xx xxx xx xx",
  cityLabel: "Şehir (isteğe bağlı)",
  cityPlaceholder: "Lefkoşa, Girne, Mağusa veya diğer",
  consentLabel:
    "Aydınlatma metni kullanıcı onayı bekliyor. Bekleme listesi kaydım ve bu amaçla iletişim bilgilerimin saklanması için açık rıza veriyorum.",
  whatsappLabel:
    "WhatsApp üzerinden bilgilendirme mesajı almak istiyorum (isteğe bağlı). Aydınlatma metni kullanıcı onayı bekliyor.",
  submit: "Listeye yazıl",
  submitting: "Gönderiliyor…",
  success: "Kaydınız alındı. Açılış yaklaşınca bu numaradan haber veririz.",
  duplicate: "Bu telefon bu kayıt türü için zaten listede.",
  unavailable:
    "Bekleme listesi kaydı şu anda alınamıyor. Lütfen daha sonra yeniden deneyin.",
  consentRequired: "Devam etmek için açık rıza kutusunu işaretleyin.",
  invalid: "Lütfen ad ve telefon alanlarını kontrol edin.",
  closedTitle: "Bekleme listesi çok yakında açılıyor",
  closedBody:
    "Yasal metinler onaylanınca kayıt alınacak. Şu an form kapalıdır; veri yazılmaz.",
  retentionNote:
    "Açık rıza ile iletişim bilgileri önerilen 730 gün saklanır; süre yasal metin onayıyla kesinleşir.",
  kvkkPlaceholder: "KVKK aydınlatma metni yakında",
  consentLegal:
    "Aydınlatma metni yer tutucudur. Kayıt açılınca iletişim rızası bu kutudan alınır.",
} as const;

export const install = {
  title: "Ana ekrana ekle",
  body: "Ada Merkez bir PWA’dır. Destekleyen tarayıcılarda ana ekrana eklenebilir.",
  cta: "Ana ekrana ekle",
  ios: "iPhone veya iPad’de Paylaş menüsünden “Ana Ekrana Ekle”yi seçin.",
  dismiss: "Gizle",
} as const;

export const legal = {
  pendingTitle: "Kullanıcı onayı bekliyor",
  pendingBody:
    "Bu sayfa yer tutucudur. Aydınlatma metni, gizlilik ve ilgili mevzuat metinleri kullanıcı onayıyla yazılacaktır. Şu an yayımlanmış bir yasal metin yoktur.",
  aydinlatmaTitle: "Aydınlatma metni",
  gizlilikTitle: "Gizlilik",
  kvkkTitle: "Kişisel veriler",
  retentionNote:
    "Bekleme listesi ve rıza kaydı için önerilen saklama süresi 730 gündür; süre yasal metin onayıyla kesinleşir. Silme talebi API taslağı üzerinden alınır.",
} as const;

export const footer = {
  companyLine: "Kırmızıyüz Live Development Software LTD",
  rights: "Tüm hakları saklıdır.",
  aydinlatma: "Aydınlatma metni",
  gizlilik: "Gizlilik",
  kvkk: "Kişisel veriler",
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
