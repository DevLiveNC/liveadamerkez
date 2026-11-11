/** Slot ve gösterim saat dilimi. Saklama her zaman UTC. */
export const APP_TIMEZONE = "Europe/Nicosia" as const;

export const BOOKING_STATUSES = [
  "pending",
  "confirmed",
  "cancelled",
  "no_show",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const ACTIVE_BOOKING_STATUSES = ["pending", "confirmed"] as const;

export const BOOKING_KINDS = ["slot", "table"] as const;
export type BookingKind = (typeof BOOKING_KINDS)[number];

/**
 * Saklama süreleri — önerilen değerler.
 * Yasal metin (aydınlatma / gizlilik / KVKK) kullanıcı onayı bekliyor.
 */
export const RETENTION_DAYS = {
  waitlist: 730,
  booking: 730,
  consentProof: 730,
  deletionRequest: 730,
} as const;

export const CONSENT_TEXT_VERSION = "placeholder-pending-approval" as const;

export const WAITLIST_CITIES = ["lefkosa", "girne", "magusa", "diger"] as const;
export type WaitlistCity = (typeof WAITLIST_CITIES)[number];

export const WAITLIST_SEGMENTS = ["ogrenci", "yerli", "tr_ziyaretci", "diger"] as const;
export type WaitlistSegment = (typeof WAITLIST_SEGMENTS)[number];

export const BUSINESS_SECTORS = ["kuafor", "klinik", "restoran", "diger"] as const;
export type BusinessSector = (typeof BUSINESS_SECTORS)[number];

export const OTP_POLICY = {
  codeLength: 6,
  maxSendsPerWindow: 3,
  maxSendsPerIpWindow: 8,
  windowMs: 15 * 60 * 1000,
  maxVerifyAttempts: 5,
  lockMs: 30 * 60 * 1000,
  codeTtlMs: 5 * 60 * 1000,
} as const;

export const BOOKING_STATUS_TRANSITIONS: Record<
  BookingStatus,
  readonly BookingStatus[]
> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["cancelled", "no_show"],
  cancelled: [],
  no_show: [],
};

export function isWaitlistOpen(value = process.env.WAITLIST_OPEN): boolean {
  return value?.trim() === "true";
}
