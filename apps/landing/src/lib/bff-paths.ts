const UUID =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

const YONETIM = [
  /^admin\/(me|health|reports|users|audit)$/,
  /^admin\/(businesses|applications|bookings|categories)$/,
  new RegExp(`^admin\\/(businesses|applications|bookings|categories)\\/${UUID}$`),
];

const ISLETME = [
  /^business\/(me|register|services|staff|availability|slots|stats)$/,
  new RegExp(`^business\\/(services|staff|availability)\\/${UUID}$`),
  /^bookings$/,
  new RegExp(`^bookings\\/${UUID}$`),
];

export type BffKind = "yonetim" | "isletme";

/** Catch-all BFF yalnızca bu /v1/* yollarını API'ye iletir. */
export function isAllowedBffUpstream(kind: BffKind, suffix: string): boolean {
  const path = suffix.replace(/^\/+/, "").replace(/\/+$/, "");
  if (!path || path.includes("..") || path.includes("//")) return false;
  const rules = kind === "yonetim" ? YONETIM : ISLETME;
  return rules.some((rule) => rule.test(path));
}
