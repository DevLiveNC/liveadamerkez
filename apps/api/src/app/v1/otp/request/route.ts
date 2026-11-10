import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, requestOtp } from "@ada-merkez/db";
import { hashClientIp, toE164 } from "@ada-merkez/shared";
import { clientIp, corsHeaders, json, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z.object({
  phone: z.string().trim().min(8).max(24),
  purpose: z.string().trim().min(2).max(40).optional(),
});

function mayReturnCode(): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return process.env.OTP_RETURN_CODE === "true" || process.env.NODE_ENV === "test";
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  const phone = toE164(parsed.data.phone);
  if (!phone) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const ip = hashClientIp(clientIp(request));
  const decision = await requestOtp(phone, parsed.data.purpose ?? "login", Date.now(), ip);
  if (!decision.ok) {
    return json(
      {
        ok: false,
        code: decision.code,
        message: apiMessages.otpLimited,
        retryAfterMs: decision.retryAfterMs,
      },
      429,
      headers,
    );
  }
  const body: Record<string, unknown> = {
    ok: true,
    channel: "skeleton",
    note: "WhatsApp OTP gönderimi henüz bağlı değil; sınırlama altyapısı çalışır.",
  };
  if (mayReturnCode() && decision.otpCode) {
    body.debugCode = decision.otpCode;
  }
  return json(body, 202, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
