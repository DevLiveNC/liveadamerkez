import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { isDatabaseConfigured, processDeletionRequest, verifyOtp } from "@ada-merkez/db";
import { toE164 } from "@ada-merkez/shared";
import { corsHeaders, json, readJson } from "../../../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z.object({
  id: z.string().uuid(),
  phone: z.string().trim().min(8).max(24),
  code: z.string().trim().min(4).max(8),
});

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
  const decision = await verifyOtp(phone, "deletion", parsed.data.code);
  if (!decision.ok) {
    const status =
      decision.code === "LOCKED" || decision.code === "MAX_ATTEMPTS" ? 429 : 401;
    return json(
      { ok: false, code: decision.code, message: apiMessages.otpLimited },
      status,
      headers,
    );
  }
  const row = await processDeletionRequest(parsed.data.id, phone);
  if (!row) {
    return json({ ok: false, code: "NOT_FOUND", message: apiMessages.notFound }, 404, headers);
  }
  return json(
    { ok: true, id: row.id, status: row.status, processedAt: row.processedAt },
    200,
    headers,
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
