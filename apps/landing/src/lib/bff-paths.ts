const UUID =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

type BffRule = { methods: ReadonlySet<string>; pattern: RegExp };

function rule(methods: string[], pattern: RegExp): BffRule {
  return { methods: new Set(methods.map((method) => method.toUpperCase())), pattern };
}

const YONETIM: BffRule[] = [
  rule(["GET"], /^admin\/(me|health|reports|users|audit)$/),
  rule(["GET"], /^admin\/(businesses|applications|bookings)$/),
  rule(["GET", "POST"], /^admin\/categories$/),
  rule(
    ["PATCH"],
    new RegExp(`^admin\\/(businesses|applications|bookings|categories)\\/${UUID}$`),
  ),
];

const ISLETME: BffRule[] = [
  rule(["GET", "PATCH"], /^business\/me$/),
  rule(["POST"], /^business\/register$/),
  rule(["GET", "POST"], /^business\/(services|staff|availability)$/),
  rule(["GET"], /^business\/(slots|stats)$/),
  rule(["PATCH", "DELETE"], new RegExp(`^business\\/services\\/${UUID}$`)),
  rule(["PATCH"], new RegExp(`^business\\/staff\\/${UUID}$`)),
  rule(["DELETE"], new RegExp(`^business\\/availability\\/${UUID}$`)),
  rule(["GET"], /^bookings$/),
  rule(["GET", "PATCH"], new RegExp(`^bookings\\/${UUID}$`)),
];

export type BffKind = "yonetim" | "isletme";

const ENCODED_TRAVERSAL = /%2e|%2f|%5c/i;

function isUnsafeBffPath(suffix: string): boolean {
  if (!suffix) return true;
  if (ENCODED_TRAVERSAL.test(suffix) || suffix.includes("\\") || suffix.includes("//") || suffix.includes("..")) {
    return true;
  }
  let decoded = suffix;
  for (let i = 0; i < 3; i += 1) {
    try {
      const next = decodeURIComponent(decoded);
      if (next === decoded) break;
      decoded = next;
      if (
        ENCODED_TRAVERSAL.test(decoded) ||
        decoded.includes("..") ||
        decoded.includes("//") ||
        decoded.includes("\\")
      ) {
        return true;
      }
    } catch {
      return true;
    }
  }
  return false;
}

/** Catch-all BFF yalnızca bu /v1 yol + metot çiftlerini API'ye iletir. */
export function isAllowedBffUpstream(kind: BffKind, suffix: string, method: string): boolean {
  const path = suffix.replace(/^\/+/, "").replace(/\/+$/, "");
  if (isUnsafeBffPath(suffix) || isUnsafeBffPath(path)) return false;
  const verb = method.trim().toUpperCase();
  if (!verb) return false;
  const rules = kind === "yonetim" ? YONETIM : ISLETME;
  return rules.some((entry) => entry.methods.has(verb) && entry.pattern.test(path));
}
