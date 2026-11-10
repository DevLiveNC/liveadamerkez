import { TenantAccessError, getBookingForTenant, isDatabaseConfigured } from "@ada-merkez/db";
import { apiMessages } from "@ada-merkez/copy";
import { corsHeaders, json } from "../../../../lib/http";
import { readTenantId } from "../../../../lib/tenant-header";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const headers = corsHeaders(request);
  const tenantId = readTenantId(request);
  if (!tenantId) {
    return json({ ok: false, code: "TENANT_REQUIRED" }, 401, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const { id } = await context.params;
  try {
    const row = await getBookingForTenant(tenantId, id);
    return json({ ok: true, booking: row }, 200, headers);
  } catch (error: unknown) {
    if (error instanceof TenantAccessError) {
      return json({ ok: false, code: error.code, message: apiMessages.notFound }, 404, headers);
    }
    return json({ ok: false, code: "ERROR" }, 500, headers);
  }
}
