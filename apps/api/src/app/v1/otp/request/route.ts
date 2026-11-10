import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, requestOtp } from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z.object({
  phone: z.string().trim().min(8).max(24),
  purpose: z.string().trim().min(2).max(40).optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const decision = await requestOtp(parsed.data.phone, parsed.data.purpose ?? "login");
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
  return json(
    {
      ok: true,
      channel: "skeleton",
      note: "WhatsApp OTP gönderimi henüz bağlı değil; sınırlama altyapısı çalışır.",
    },
    202,
    headers,
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
