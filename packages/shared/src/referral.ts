const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generateReferralCode(randomBytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < 6; i += 1) {
    const n = randomBytes[i % randomBytes.length] ?? 0;
    out += ALPHABET[n % ALPHABET.length];
  }
  return `AM${out}`;
}

export function isReferralCode(value: string | null | undefined): boolean {
  return Boolean(value && /^AM[A-Z0-9]{6}$/i.test(value.trim()));
}
