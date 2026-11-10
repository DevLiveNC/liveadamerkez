import { createHash, createHmac, randomInt, timingSafeEqual } from "node:crypto";
import { assertProductionSecrets } from "./secrets.js";

function pepper(): string {
  assertProductionSecrets();
  const value = process.env.OTP_PEPPER?.trim() || process.env.AUTH_SECRET?.trim();
  if (!value) {
    return "ada-otp-dev-unconfigured";
  }
  return value;
}

export function generateOtpCode(length = 6): string {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
}

export function hashOtp(phone: string, purpose: string, code: string): string {
  return createHmac("sha256", pepper()).update(`${phone}\0${purpose}\0${code}`).digest("hex");
}

export function otpHashesEqual(left: string | null | undefined, right: string): boolean {
  if (!left) return false;
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) {
    timingSafeEqual(a, Buffer.alloc(a.length));
    return false;
  }
  return timingSafeEqual(a, b);
}

export function hashClientIp(ip: string): string {
  return createHash("sha256").update(ip.trim()).digest("hex");
}

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
