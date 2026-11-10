import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import { createDeletionRequest, isDatabaseConfigured } from "@ada-merkez/db";
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
    const row = await createDeletionRequest(parsed.data);
    return json(
      {
        ok: true,
        id: row?.id,
        status: "received",
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
