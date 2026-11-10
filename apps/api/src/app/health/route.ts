import { APP_TIMEZONE } from "@ada-merkez/shared";
import { checkDatabase, isDatabaseConfigured } from "@ada-merkez/db";
import { corsHeaders, json } from "../../lib/http";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = isDatabaseConfigured() ? await checkDatabase() : "disconnected";
  return json(
    {
      ok: true,
      service: "ada-merkez-api",
      db,
      timezone: process.env.APP_TIMEZONE?.trim() || APP_TIMEZONE,
    },
    200,
    corsHeaders(request),
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
