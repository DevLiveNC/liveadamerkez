import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { createDeletionRequest, isDatabaseConfigured } from "@ada-merkez/db";
import { toE164 } from "@ada-merkez/shared";
import { corsHeaders, json, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z
  .object({
    phone: z.string().trim().min(8).max(24).optional(),
    email: z.string().trim().email().optional(),
    details: z.string().trim().max(2000).optional(),
  })
  .refine((value) => Boolean(value.phone || value.email), {
    message: "phone or email required",
  });

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json(
      { ok: false, code: "INVALID", message: "Telefon veya e-posta gerekli." },
      400,
      headers,
    );
  }
  if (!isDatabaseConfigured()) {
    return json(
      {
        ok: false,
        code: "SERVICE_UNAVAILABLE",
        message: apiMessages.dbUnavailable,
      },
      503,
      headers,
    );
  }
  try {
    const phone = parsed.data.phone ? toE164(parsed.data.phone) : null;
    if (parsed.data.phone && !phone) {
      return json({ ok: false, code: "INVALID", message: "Geçerli bir telefon yazın." }, 400, headers);
    }
    const row = await createDeletionRequest({
      phone,
      email: parsed.data.email ?? null,
      details: parsed.data.details ?? null,
    });
    return json(
      {
        ok: true,
        id: row?.id,
        status: "received",
        verifyRequired: true,
        message: apiMessages.deletionReceived,
      },
      201,
      headers,
    );
  } catch {
    return json(
      {
        ok: false,
        code: "SERVICE_UNAVAILABLE",
        message: apiMessages.dbUnavailable,
      },
      503,
      headers,
    );
  }
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
