import { z } from "zod";
import { apiMessages } from "@ada-merkez/copy";
import {
  createAccount,
  findAccountByPhoneRole,
  isDatabaseConfigured,
  verifyOtp,
} from "@ada-merkez/db";
import { isSessionRole, toE164 } from "@ada-merkez/shared";
import { isAuthConfigured, signSession } from "@ada-merkez/shared/node";
import { corsHeaders, json, readJson } from "../../../../lib/http";

export const dynamic = "force-dynamic";

const Body = z.object({
  phone: z.string().trim().min(8).max(24),
  code: z.string().trim().min(4).max(8),
  role: z.enum(["customer", "business", "admin"]),
  mode: z.enum(["login", "register"]).optional(),
  name: z.string().trim().min(2).max(80).optional(),
  purpose: z.string().trim().min(2).max(40).optional(),
});

export async function POST(request: Request) {
  const headers = corsHeaders(request);
  if (!isAuthConfigured()) {
    return json(
      { ok: false, code: "AUTH_REQUIRED", message: apiMessages.authRequired },
      503,
      headers,
    );
  }
  const parsed = Body.safeParse(await readJson(request));
  if (!parsed.success) {
    return json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, 400, headers);
  }
  const role = parsed.data.role;
  if (!isSessionRole(role)) {
    return json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, 400, headers);
  }
  const mode = parsed.data.mode ?? "login";
  if (mode === "register" && role === "admin") {
    return json(
      { ok: false, code: "ADMIN_REGISTER_DISABLED", message: apiMessages.adminRegisterDisabled },
      403,
      headers,
    );
  }
  const phone = toE164(parsed.data.phone);
  if (!phone) {
    return json({ ok: false, code: "INVALID", message: apiMessages.invalidAuth }, 400, headers);
  }
  if (!isDatabaseConfigured()) {
    return json(
      { ok: false, code: "SERVICE_UNAVAILABLE", message: apiMessages.dbUnavailable },
      503,
      headers,
    );
  }
  const decision = await verifyOtp(phone, parsed.data.purpose ?? "login", parsed.data.code);
  if (!decision.ok) {
    const status = decision.code === "LOCKED" || decision.code === "MAX_ATTEMPTS" ? 429 : 401;
    return json(
      {
        ok: false,
        code: decision.code,
        message: apiMessages.otpLimited,
        retryAfterMs: "retryAfterMs" in decision ? decision.retryAfterMs : undefined,
      },
      status,
      headers,
    );
  }

  let account = await findAccountByPhoneRole(phone, role);
  if (!account && mode === "register") {
    account = await createAccount({
      phone,
      role,
      name: parsed.data.name ?? null,
    });
  }
  if (!account) {
    return json(
      { ok: false, code: "ACCOUNT_NOT_FOUND", message: apiMessages.accountNotFound },
      401,
      headers,
    );
  }

  const token = signSession({
    sub: account.id,
    role: account.role,
    tenantId: account.tenantId ?? "",
  });
  return json(
    {
      ok: true,
      token,
      user: {
        id: account.id,
        role: account.role,
        name: account.name,
        tenantId: account.tenantId,
      },
    },
    200,
    headers,
  );
}

export function OPTIONS(request: Request) {
  return json({ ok: true }, 204, corsHeaders(request));
}
