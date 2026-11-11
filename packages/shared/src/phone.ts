export function toE164(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15) return null;
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.startsWith("00") && digits.length >= 12) return `+${digits.slice(2)}`;
  if (digits.startsWith("0") && digits.length === 11) return `+90${digits.slice(1)}`;
  if (digits.startsWith("90") && digits.length === 12) return `+${digits}`;
  if (digits.length === 10 && digits.startsWith("5")) return `+90${digits}`;
  return `+${digits}`;
}

/** KVKK veri azaltımı: liste uçlarında tam numara dönülmez. */
export function maskPhone(phone: string): string {
  const trimmed = phone.trim();
  if (trimmed.length <= 4) return "••••";
  return `${trimmed.slice(0, 2)}•••${trimmed.slice(-2)}`;
}
