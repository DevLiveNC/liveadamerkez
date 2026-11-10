import { z } from "zod";
import { corsHeaders, json, readJson } from "../../../lib/http";
import { dispatchServerEvents } from "../../../lib/analytics";
import { ANALYTICS_EVENTS } from "@ada-merkez/shared";
import { limitRequest } from "../../../lib/rate-limit";

export const dynamic = "force-dynamic";

const allowed = new Set(Object.values(ANALYTICS_EVENTS));

const Body = z.object({
  eventName: z.string(),
  eventId: z.string().uuid().optional(),
  event_id: z.string().uuid().optional(),
  city: z.string().nullable().optional(),
  segment: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  business_id: z.string().nullable().optional(),
  ref: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const limited = await limitRequest(request, "events", 60);
  if (!limited.ok) {
    return json({ ok: false, code: "RATE_LIMITED", retryAfterMs: limited.retryAfterMs }, 429, headers);
  }
  const parsed = Body.safeParse(await readJson(request));
  const eventId = parsed.data?.eventId ?? parsed.data?.event_id;
  if (!parsed.success || !eventId || !allowed.has(parsed.data.eventName as never)) {
    return json({ ok: false, code: "INVALID" }, 400, headers);
  }
  await dispatchServerEvents({
    eventName: parsed.data.eventName,
    eventId,
    params: { ...parsed.data, event_id: eventId },
    request,
  });
  return json({ ok: true }, 202, headers);
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
