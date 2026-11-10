import { z } from "zod";
import { incrementReferralClick, isDatabaseConfigured } from "@ada-merkez/db";
import { isReferralCode } from "@ada-merkez/shared";
import { corsHeaders, json, readJson } from "../../../../lib/http";
import { dispatchServerEvents } from "../../../../lib/analytics";
import { limitRequest } from "../../../../lib/rate-limit";

export const dynamic = "force-dynamic";

const Body = z.object({
  code: z.string().trim().min(4).max(16),
  eventId: z.string().uuid().optional(),
  analyticsConsent: z.boolean().optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const limited = await limitRequest(request, "referral-click", 30);
  if (!limited.ok) {
    return json({ ok: false, code: "RATE_LIMITED", retryAfterMs: limited.retryAfterMs }, 429, headers);
  }
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: true }, 202, headers);
  }
  if (!isReferralCode(parsed.data.code) || !isDatabaseConfigured()) {
    return json({ ok: true }, 202, headers);
  }
  const row = await incrementReferralClick(parsed.data.code);
  if (row) {
    const eventId = parsed.data.eventId ?? crypto.randomUUID();
    await dispatchServerEvents({
      eventName: "cta_click",
      eventId,
      params: { event_id: eventId, ref: row.code, channel: "referral" },
      request,
    });
  }
  return json({ ok: true }, 202, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
