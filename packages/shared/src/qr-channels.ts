export type QrChannel = {
  slug: string;
  label: string;
  source: "qr";
  medium: "offline";
  campaign: string;
  content: string;
};

/**
 * Kalıcı QR yolları. Kampanya UTM’si burada güncellenebilir; yol kırılmaz.
 */
export const QR_CHANNELS: Record<string, QrChannel> = {
  afis: {
    slug: "afis",
    label: "Afiş",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "afis",
  },
  "el-ilani": {
    slug: "el-ilani",
    label: "El ilanı",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "el_ilani",
  },
  masa: {
    slug: "masa",
    label: "Masa üstü stand",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "masa",
  },
  billboard: {
    slug: "billboard",
    label: "Billboard",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "billboard",
  },
  "uni-stand": {
    slug: "uni-stand",
    label: "Üniversite stantı",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "uni_stand",
  },
  vitrin: {
    slug: "vitrin",
    label: "Vitrin çıkartması",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "vitrin",
  },
  etkinlik: {
    slug: "etkinlik",
    label: "Etkinlik",
    source: "qr",
    medium: "offline",
    campaign: "pilot_2026",
    content: "etkinlik",
  },
};

export const QR_LOCATION_SUFFIXES = ["lefkosa", "girne", "magusa"] as const;

export function resolveQrPath(segments: string[]): {
  channel: QrChannel;
  location?: string;
  businessId?: string;
} | null {
  const [head, tail] = segments;
  if (!head) return null;
  const channel = QR_CHANNELS[head];
  if (!channel) return null;
  if (!tail) return { channel };
  if (head === "billboard" && QR_LOCATION_SUFFIXES.includes(tail as (typeof QR_LOCATION_SUFFIXES)[number])) {
    return { channel, location: tail };
  }
  if (head === "vitrin" || head === "masa") {
    return { channel, businessId: tail };
  }
  return null;
}
