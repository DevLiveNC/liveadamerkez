import { z } from "zod";
import { incrementReferralClick, isDatabaseConfigured } from "@ada-merkez/db";
import { corsHeaders, json, readJson } from "../../../../lib/http";
import { dispatchServerEvents } from "../../../../lib/analytics";

export const dynamic = "force-dynamic";

const Body = z.object({
  code: z.string().trim().min(4).max(16),
  eventId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json({ ok: true, skipped: true }, 202, headers);
  }
  const row = await incrementReferralClick(parsed.data.code);
  const eventId = parsed.data.eventId ?? crypto.randomUUID();
  if (row) {
    await dispatchServerEvents({
      eventName: "cta_click",
      eventId,
      params: { event_id: eventId, ref: row.code, channel: "referral" },
    });
  }
  return json({ ok: true, found: Boolean(row) }, 200, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
