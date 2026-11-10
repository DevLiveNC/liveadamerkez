import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, verifyOtp } from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z.object({
  phone: z.string().trim().min(8).max(24),
  purpose: z.string().trim().min(2).max(40).optional(),
  code: z.string().trim().min(4).max(8),
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
  const decision = await verifyOtp(
    parsed.data.phone,
    parsed.data.purpose ?? "login",
    false,
  );
  const status =
    !decision.ok && (decision.code === "LOCKED" || decision.code === "MAX_ATTEMPTS")
      ? 429
      : 401;
  return json(
    {
      ok: false,
      code: decision.ok ? "NOT_ISSUED" : decision.code,
      message: apiMessages.otpLimited,
    },
    status,
    headers,
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
