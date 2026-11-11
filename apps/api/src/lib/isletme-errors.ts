import {
  BusinessPendingError,
  ForbiddenRoleError,
  TenantAccessError,
} from "@ada-merkez/db";
import { apiMessages } from "@ada-merkez/copy";
import { json } from "./http";

export function isletmeErrorResponse(
  error: unknown,
  cors: Record<string, string>,
): ReturnType<typeof json> | null {
  if (error instanceof TenantAccessError) {
    return json({ ok: false, code: error.code, message: apiMessages.notFound }, 404, cors);
  }
  if (error instanceof ForbiddenRoleError) {
    return json({ ok: false, code: error.code, message: error.message }, 403, cors);
  }
  if (error instanceof BusinessPendingError) {
    return json({ ok: false, code: error.code, message: error.message }, 409, cors);
  }
  return null;
}
