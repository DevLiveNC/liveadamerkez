import { describe, expect, it } from "vitest";
import {
  TenantAccessError,
  assertSameTenant,
  belongsToTenant,
  filterByTenant,
} from "./tenant.js";

const A = "11111111-1111-1111-1111-111111111111";
const B = "22222222-2222-2222-2222-222222222222";

describe("tenant authorization", () => {
  it("does not let tenant A see tenant B rows", () => {
    const rows = [
      { id: "1", tenantId: A },
      { id: "2", tenantId: B },
    ];
    expect(filterByTenant(rows, A).map((r) => r.id)).toEqual(["1"]);
    expect(belongsToTenant(B, A)).toBe(false);
    expect(() => assertSameTenant(B, A)).toThrow(TenantAccessError);
  });

  it("allows a tenant to see its own rows", () => {
    expect(belongsToTenant(A, A)).toBe(true);
    expect(() => assertSameTenant(A, A)).not.toThrow();
  });

  it("denies missing tenant context", () => {
    expect(() => assertSameTenant(A, null)).toThrow(TenantAccessError);
  });
});
