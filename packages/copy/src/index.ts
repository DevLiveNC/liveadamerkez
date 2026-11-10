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
  title: "Ada Merkez — Adada randevu ve rezervasyon dağılmasın",
  description:
    "Kuzey Kıbrıs ve Türkiye için işletme keşfi, randevu ve rezervasyon. Dilersen uygulama indirmeden WhatsApp’tan hallet.",
} as const;

export const cta = {
  customer: "Erken erişime kaydol",
  business: "Kendi işletmeni ekle",
} as const;

export const nav = {
  discover: "Keşif",
  how: "Nasıl çalışır",
  whatsapp: "WhatsApp ile",
  business: "İşletmeler",
  pilot: "Pilot",
  faq: "SSS",
  later: "Sonra",
  waitlist: "Bekleme listesi",
  apply: "İşletme başvurusu",
  menu: "Menü",
  sections: "Bölümler",
  lang: "Dil",
  enSoon: "Yakında",
  enLabel: "EN, Yakında",
  homeAria: "Ada Merkez ana sayfa",
} as const;

export const hero = {
  kicker: "Kuzey Kıbrıs ve Türkiye için",
  title: "Adada randevu ve rezervasyon dağılmasın.",
  lead: "Kuaför, klinik veya restoranı bul; uygun saati seç. Dilersen uygulama indirmeden WhatsApp’tan hallet.",
  primaryCta: cta.customer,
  secondaryCta: cta.business,
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
  body: "Müşteri uygun saati kendisi seçer. Gelen istekler — uygulama veya WhatsApp — aynı panelde durur. Hatırlatma gider. Fiyat ve paket burada yoktur.",
  citiesNote: "Pilot Lefkoşa, Girne ve Mağusa’da. Türkiye’deki işletmeler için ayrı bir dönem planlıyoruz.",
} as const;

export const close = {
  kicker: "Ada'nın merkezi",
  title: "Hazır olunca burada olur.",
  body: "Hazır olduğunda haber veririz. Bu bir rezervasyon veya ücret taahhüdü değildir.",
  meta: "Erken erişim kaydı rezervasyon değildir.",
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
    "Aydınlatma metni onaylanınca burada yer alır. Kayıt, iletişim rızası ile alınır.",
  consentError: "Devam etmek için rıza gerekli.",
  formMeta: "Bu bir rezervasyon formu değildir.",
  successTitle: "Kaydınız alındı.",
  successBody: "Gelişmeleri paylaşırız. Ek bir vaat yok. Bu bir rezervasyon değildir.",
  successMeta: "Bu bir rezervasyon değildir.",
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
  closedShort: "Yakında açılıyor",
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
  formMeta: "Başvuru kabul anlamına gelmez.",
  unavailable: "Başvuru şu anda alınamıyor. Lütfen daha sonra yeniden deneyin.",
  invalid: "Zorunlu alanları ve rızayı kontrol edin.",
  closedTitle: "Başvuru çok yakında açılıyor",
  closedShort: "Yakında açılıyor",
  closedBody: "Yasal metinler onaylanınca işletme başvurusu alınacak. Şu an form kapalıdır.",
} as const;

export const qrPage = {
  kicker: "QR kanalı",
  lead: "Kuaför ve klinikte randevu, restoranda masa; dilerseniz WhatsApp üzerinden. Uygulama indirmek zorunda değilsiniz.",
  cta: cta.customer,
} as const;

export const trackingConsent = {
  title: "Çerez ve ölçüm",
  body: "Ölçüm ve pazarlama çerezleri kapalı başlar. Kabul, ikisini de açar; Reddet kapalı tutar. Ayarlar’dan ayrı seçebilirsiniz. İletişim rızası formda ayrıdır.",
  accept: "Kabul",
  reject: "Reddet",
  settings: "Ayarlar",
  save: "Kaydet",
  settingsBody: "Ölçüm (GA4) ve pazarlama (Pixel) rızasını ayrı seçin. İletişim rızası formda ayrıdır.",
  analyticsLabel: "Ölçüm (GA4)",
  marketingLabel: "Pazarlama (Pixel)",
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
    "Aydınlatma metni, gizlilik ve ilgili mevzuat metinleri onaylanınca burada yayımlanır. Şu an yayımlanmış bir yasal metin yoktur.",
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
  contact: "İletişim",
  logoNote: "Ada Merkez markası.",
} as const;

export const apiMessages = {
  dbUnavailable:
    "Bekleme listesi kaydı şu anda alınamıyor. Lütfen daha sonra yeniden deneyin.",
  consentRequired: "Açık rıza olmadan kayıt alınmaz.",
  notFound: "Kayıt bulunamadı.",
  otpLimited: "Çok fazla deneme. Lütfen daha sonra yeniden deneyin.",
  deletionReceived: "Silme talebiniz alındı.",
  received: "Kaydınız alındı.",
} as const;

export const offline = {
  title: "Çevrimdışı",
  body: "Bu sayfa cihazınıza kaydedildi. Bağlantı gelince bekleme listesi ve güncel içerik yeniden yüklenir.",
  retry: "Yeniden dene",
} as const;

export const util = {
  clock: "Yerel saat",
  currency: "Gösterim",
  currencyGroup: "Para birimi gösterimi",
} as const;

export const kabuki = {
  name: "Kabuki",
  alt: "Kabuki, Ada Merkez maskotu",
  hero: "Merhaba, ben Kabuki. Adanın saati, burada.",
  how: "İşletmeyi bul, saati seç, onayla. Bu kadar.",
  business: "Boş saat burada durur. Müşteri görür, sen onaylarsın.",
  faq: "Takıldığın bir yer mi var? Sık sorulanlara bak.",
} as const;

export const search = {
  label: "Arama",
  cityLabel: "Şehir",
  cityValue: "Lefkoşa",
  cityMore: "Girne, Mağusa",
  whatLabel: "Ne arıyorsun",
  whatValue: "Kuaför, klinik veya restoran",
  whenLabel: "Ne zaman",
  whenPrefix: "Yarın,",
  submit: "Saatleri gör",
  pilot:
    "Pilot Lefkoşa, Girne ve Mağusa’da. Türkiye’deki işletmeler için ayrı bir dönem planlıyoruz.",
} as const;

export const categories = {
  kicker: "Keşif",
  title: "Ne arıyorsun?",
  lede: "Ada Merkez, Kuzey Kıbrıs ve Türkiye için. Şimdilik kuaför, güzellik, klinik ve restoran.",
  hair: "Kuaför ve güzellik",
  hairHint: "Kesim, bakım, randevu",
  hairAlt: "Örnek görsel: kuaför salonu iç mekânı",
  clinic: "Klinik",
  clinicHint: "Muayene ve kontrol randevusu",
  clinicAlt: "Örnek görsel: klinik muayene odası",
  resto: "Restoran",
  restoHint: "Masa rezervasyonu",
  restoAlt: "Örnek görsel: restoranda servis",
  soon: "Yakında",
  events: "Etkinlikler",
  eventsHint: "Bilet, sonraki evrede (CY Ticket)",
  student: "Öğrenci fırsatları",
  studentHint: "Ada Kampüs ile, sonraki evrede",
} as const;

export const examples = {
  kicker: "Örnekler",
  title: "Böyle görünecek.",
  lede: "Aşağıdakiler örnek kartlardır. Gerçek işletme değildir.",
  badge: "Örnek",
  cards: [
    { name: "Örnek Kuaför", city: "Lefkoşa", category: "Kuaför ve güzellik", service: "Kesim ve bakım", image: "kuafor-salon" },
    { name: "Örnek Güzellik", city: "Lefkoşa", category: "Kuaför ve güzellik", service: "Cilt bakımı", image: "kuafor-makas" },
    { name: "Örnek Klinik", city: "Girne", category: "Klinik", service: "Muayene randevusu", image: "klinik-muayene" },
    { name: "Örnek Diş Kliniği", city: "Girne", category: "Klinik", service: "Kontrol randevusu", image: "klinik-muayene" },
    { name: "Örnek Restoran", city: "Mağusa", category: "Restoran", service: "Masa rezervasyonu", image: "restoran-servis" },
    { name: "Örnek Sofra", city: "Mağusa", category: "Restoran", service: "Masa rezervasyonu", image: "restoran-sofra" },
  ],
} as const;

export const events = {
  kicker: "Etkinlik ve bilet",
  title: "Bilet de aynı çatıda olacak.",
  lede: "Etkinlik bileti sonraki evrede. Aşağıdakiler örnek kartlardır; gerçek etkinlik veya fiyat değildir.",
  cards: [
    { name: "Örnek Sahne", city: "Lefkoşa", hint: "Konser bileti, sonraki evrede.", image: "konser-sahne" },
    { name: "Örnek Gösteri", city: "Girne", hint: "Etkinlik bileti, sonraki evrede.", image: "tiyatro-salon" },
    { name: "Örnek Açık Hava", city: "Mağusa", hint: "Etkinlik bileti, sonraki evrede.", image: "acik-hava-sahne" },
  ],
} as const;

export const howBoard = {
  kicker: "Nasıl çalışır",
  title: "Saat sormak için hattı meşgul etmeden.",
  lede: "İşletmeyi bul, saati veya masayı seç, onayla. Dilersen aynı işi WhatsApp’tan da yürütebilirsin.",
  s1Title: "İşletmeyi bul",
  s1Body: "Lefkoşa, Girne veya Mağusa’da kategorine bak.",
  s2Title: "Saati veya masayı seç",
  s2Body: "Boş saati veya masayı gör, uygun olanı seç.",
  s3Title: "Onayla",
  s3Body: "Onayı al. Dilersen hatırlatma aç.",
  tz: "Europe/Nicosia",
  service: "Hizmet",
  date: "Tarih",
  dateValue: "Çarşamba, 11 Kasım",
  time: "Saat",
  place: "Yer",
  placeValue: "Lefkoşa · örnek işletme",
  status: "Onay bekleniyor",
} as const;

export const whatsappFlow = {
  kicker: "WhatsApp asistanı",
  title: "WhatsApp’tan söylemen yeter.",
  lede: "Uygulama indirmeden, yazışarak randevu veya masa rezervasyonu yapabilirsin.",
  s1Title: "İhtiyacını yaz",
  s1Body: "Şehir, gün ve hizmeti kısaca söylemen yeterli.",
  s2Title: "Uygun saatleri gör",
  s2Body: "Asistan boş saatleri veya masaları gösterir.",
  s3Title: "Onayı al",
  s3Body: "Onay gelince dilersen hatırlatma aç.",
  footnote: "Sohbet görseli stilizedir; resmi bir mesajlaşma arayüzünün kopyası değildir.",
  headTitle: "Ada Merkez asistanı",
  headSub: "Stilize akış · resmi arayüz değil",
  b1: "Merhaba. Kuaför, klinik veya restoran için saat bakabilirim. Şehir ve gün söylemen yeterli.",
  b2: "Lefkoşa, yarın kesim. Öğleden önce.",
  b3: "11 Kasım, Lefkoşa. Öğleden önce boş saatler: 10:30, 11:00. Hangisini ayıralım?",
  b4: "11:00 olsun.",
  b5: "11:00 için yer ayırdım. Onay işletmeden gelince yazarım. Hatırlatma ister misin?",
} as const;

export const businessPanel = {
  kicker: "İşletmeler için",
  title: "Defter durmasın, boş saat görünsün.",
  lede: "Ada Merkez, Kuzey Kıbrıs ve Türkiye için. Pilot Lefkoşa, Girne ve Mağusa’da. Müşteri uygun saati kendisi seçer; istekler panelde durur.",
  feat1Title: "İşletme paneli",
  feat1Body: "Hizmet, personel ve istekler aynı yerde.",
  feat2Title: "Takvim ve masa planı",
  feat2Body: "Kuaför, klinik ve restorana göre.",
  feat3Title: "Hatırlatmalar",
  feat3Body: "Onaylanan randevu için hatırlatma gider.",
  statsLabel: "Örnek istatistikler",
  stat1: "Bugünkü randevu",
  stat2: "Boş saat",
  stat3: "Onay bekliyor",
  calPanel: "İşletme paneli",
  calTitle: "Salı, 10 Kasım",
  calSub: "Lefkoşa · günlük görünüm",
  navCal: "Takvim",
  navReq: "İstekler",
  navSvc: "Hizmetler",
  navLabel: "Örnek panel menüsü",
  inbox: "Gelen istekler",
  ok: "Onaylı",
  wait: "Bekliyor",
  off: "İptal",
  free: "Boş",
  freeHint: "Uygun saat",
  a1: "Kontrol",
  a2: "Kesim ve sakal",
  a3: "Cilt bakımı",
  a4: "Kesim",
} as const;

export const tools = {
  kicker: "İşletme araçları",
  title: "QR menü ve POS, sonraki evrede.",
  lede: "Aynı çatı altında planlanan araçlar. v1’de menü yalnızca bağlantıdır; tahsilat ve yazar kasa sonraki evrededir.",
} as const;

export const pilotCities = {
  kicker: "Pilot şehirler",
  title: "Lefkoşa, Girne ve Mağusa.",
  lede: "Ada Merkez, Kuzey Kıbrıs ve Türkiye için. Pilot bu üç şehirde. Türkiye’den gelenler de burada randevu veya masa ayırabilir. Türkiye’deki işletmeler için ayrı bir dönem planlıyoruz.",
  lefkosa: "Başkentte kuaför, klinik ve restoran.",
  girne: "Girne’de aynı keşif ve rezervasyon akışı.",
  magusa: "Mağusa’da aynı keşif ve rezervasyon akışı.",
} as const;

export const faq = {
  kicker: "SSS",
  title: "Sık sorulanlar",
  items: [
    {
      q: "Ada Merkez nedir?",
      a: "Kuzey Kıbrıs ve Türkiye için bir randevu ve rezervasyon uygulaması. İşletmeyi bulur, saati veya masayı seçersin. Dilersen WhatsApp’tan da halledersin.",
    },
    {
      q: "Hangi şehirlerde çalışır?",
      a: "Pilot Lefkoşa, Girne ve Mağusa’da. Türkiye’den gelenler de bu şehirlerde randevu veya masa ayırabilir. Türkiye’deki işletmeler için ayrı bir dönem planlıyoruz.",
    },
    {
      q: "Uygulama indirmem gerekir mi?",
      a: "Hayır. Web’den kullanabilirsin. Dilersen uygulama indirmeden WhatsApp’tan da yazışarak rezervasyon yapabilirsin.",
    },
    {
      q: "Hastane veya resmi daire randevusu alınır mı?",
      a: "Hayır. Ada Merkez kuaför, güzellik, klinik ve restoran içindir. Devlet hastanesi veya resmi randevu bu uygulamada yoktur.",
    },
    {
      q: "WhatsApp’tan nasıl randevu alırım?",
      a: "Asistana şehir, gün ve ihtiyacını yazarsın. Uygun saatleri görür, seçersin; onay gelince dilersen hatırlatma açarsın.",
    },
    {
      q: "İşletmemi nasıl eklerim?",
      a: "Pilot Lefkoşa, Girne ve Mağusa’daki kuaför, klinik ve restoranlar içindir. İlgileniyorsan kendi işletmeni ekle. Başvurmak seni bağamaz; önce konuşuruz.",
    },
    {
      q: "Ne zaman açılacak?",
      a: "Lansman tarihi henüz net değil. Paylaşılacak bir tarih olunca burada yazarız.",
    },
    {
      q: "Ücret var mı?",
      a: "Fiyat ve paketler henüz yayımlanmadı. Paylaşılınca burada yazarız.",
    },
  ],
} as const;

export const later = {
  kicker: "Aynı çatıda, sonraki evre",
  title: "v1 keşif, randevu ve WhatsApp. Diğerleri planlanan evrede.",
  badge: "Yakında",
  qrTitle: "QR menü",
  qrBody: "Masa QR’ı ile menü; v1’de yalnızca bağlantı.",
  posTitle: "POS",
  posBody: "Yazar kasa ile tahsilat, aynı çatı altında.",
  ticketTitle: "Etkinlik bileti",
  ticketBody: "Konser ve etkinlik bileti, randevunun yanında.",
  campusTitle: "Öğrenci indirimi",
  campusBody: "Ada Kampüs kimliğiyle indirim, abartısız sonraki adım.",
} as const;

export const closeCta = {
  kicker: "Adanın saati, burada.",
  title: "Hazır olunca burada olur.",
  body: "Erken erişim listesi yakında açılıyor.",
} as const;

export const heroShot = {
  alt: "Keşif ekranı",
} as const;
