import { describe, expect, it } from "vitest";
import { signSession, verifySession } from "./session.js";

const SECRET = "test-auth-secret";

describe("HMAC session", () => {
  it("round-trips tenant claims", () => {
    const token = signSession(
      { tenantId: "11111111-1111-4111-8111-111111111111", role: "business", sub: "owner" },
      { secret: SECRET, ttlMs: 60_000 },
    );
    const claims = verifySession(token, SECRET);
    expect(claims?.tenantId).toBe("11111111-1111-4111-8111-111111111111");
    expect(claims?.role).toBe("business");
  });

  it("signs customer sessions without a tenant", () => {
    const token = signSession({ role: "customer", sub: "cust-1" }, { secret: SECRET, ttlMs: 60_000 });
    const claims = verifySession(token, SECRET);
    expect(claims?.role).toBe("customer");
    expect(claims?.sub).toBe("cust-1");
    expect(claims?.tenantId).toBe("");
  });

  it("allows business sessions before a tenant is bound", () => {
    const token = signSession({ role: "business", sub: "x" }, { secret: SECRET, ttlMs: 60_000 });
    expect(verifySession(token, SECRET)?.role).toBe("business");
    expect(verifySession(token, SECRET)?.tenantId).toBe("");
  });

  it("rejects unknown roles and expired tokens", () => {
    const token = signSession(
      { tenantId: "11111111-1111-4111-8111-111111111111", role: "admin", sub: "a" },
      { secret: SECRET, ttlMs: 60_000 },
    );
    expect(verifySession(`${token}x`, SECRET)).toBeNull();
    expect(verifySession(token, "other")).toBeNull();
    const expired = signSession(
      {
        tenantId: "11111111-1111-4111-8111-111111111111",
        role: "business",
        sub: "a",
        exp: Date.now() - 1000,
      },
      { secret: SECRET },
    );
    expect(verifySession(expired, SECRET)).toBeNull();
  });
});
