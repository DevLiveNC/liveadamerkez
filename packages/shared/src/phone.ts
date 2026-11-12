const TR_MOBILE = /^\+90\d{10}$/;

export function toE164(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  let e164: string | null = null;
  if (trimmed.startsWith("+") || digits.startsWith("00")) {
    const rest = digits.startsWith("00") ? digits.slice(2) : digits;
    if (rest.startsWith("90") && rest.length === 12) e164 = `+${rest}`;
  } else if (digits.startsWith("0") && digits.length === 11) {
    e164 = `+90${digits.slice(1)}`;
  } else if (digits.startsWith("90") && digits.length === 12) {
    e164 = `+${digits}`;
  } else if (digits.length === 10 && digits.startsWith("5")) {
    e164 = `+90${digits}`;
  }
  if (!e164 || !TR_MOBILE.test(e164)) return null;
  return e164;
}

/** KVKK veri azaltımı: liste uçlarında tam numara dönülmez. */
export function maskPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return "••••";
  return `${trimmed.slice(0, 2)}•••${trimmed.slice(-2)}`;
}
