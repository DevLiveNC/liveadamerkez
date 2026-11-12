import { toE164 } from "./phone.js";

/**
 * Kodsuz test girişi.
 *
 * Bu ortamda WhatsApp/SMS gönderimi bağlı olmadığı için telefona kod
 * ulaşmıyor. Test numarası bu listede olduğu sürece giriş ve kayıt akışı
 * kod adımını atlar; hesap üç rolde de (müşteri, işletme, yönetici)
 * sunucuda açılır.
 *
 * Kapatmak için API ve landing tarafında `AUTH_TEST_LOGIN=off` verilmesi
 * yeterlidir; kod değişikliği gerekmez.
 */
export const TEST_LOGIN_DEFAULT_PHONE = "+905391180204";

/** Test girişini kapatan değerler. Tanımsız ya da başka bir değer: açık. */
const OFF_VALUES = new Set(["off", "0", "false", "no", "kapali", "kapalı"]);

export function isTestLoginEnabled(flag?: string | null): boolean {
  return !OFF_VALUES.has((flag ?? "").trim().toLowerCase());
}

/**
 * İzinli numaralar. `AUTH_TEST_PHONES` virgül/boşluk/noktalı virgülle
 * ayrılmış olabilir. Değer yoksa varsayılan test numarası kullanılır.
 */
export function testLoginPhones(raw?: string | null): string[] {
  const parsed = (raw ?? "")
    .split(/[,;]+/)
    .map((item) => toE164(item))
    .filter((item): item is string => Boolean(item));
  const unique = Array.from(new Set(parsed));
  return unique.length > 0 ? unique : [TEST_LOGIN_DEFAULT_PHONE];
}

export function isTestLoginPhone(
  phone: string | null | undefined,
  options?: { enabledFlag?: string | null; phones?: string | null },
): boolean {
  if (!isTestLoginEnabled(options?.enabledFlag)) return false;
  const e164 = toE164(phone);
  if (!e164) return false;
  return testLoginPhones(options?.phones).includes(e164);
}

/** Arayüze gösterilecek numara; kodsuz giriş kapalıysa `null`. */
export function testLoginPhone(options?: {
  enabledFlag?: string | null;
  phones?: string | null;
}): string | null {
  if (!isTestLoginEnabled(options?.enabledFlag)) return null;
  return testLoginPhones(options?.phones)[0] ?? null;
}

/** +905391180204 → "+90 539 118 02 04" */
export function formatPhoneForDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length !== 12 || !digits.startsWith("90")) return phone;
  const rest = digits.slice(2);
  return `+90 ${rest.slice(0, 3)} ${rest.slice(3, 6)} ${rest.slice(6, 8)} ${rest.slice(8, 10)}`;
}
