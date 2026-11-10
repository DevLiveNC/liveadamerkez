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

  it("rejects tampered tokens and missing secret", () => {
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
