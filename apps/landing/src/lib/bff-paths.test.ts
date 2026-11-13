import { describe, expect, it } from "vitest";
import { isAllowedBffUpstream } from "./bff-paths";

const uuid = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("isAllowedBffUpstream", () => {
  it("allows yönetici panel path+method pairs and rejects the rest of /v1", () => {
    expect(isAllowedBffUpstream("yonetim", "admin/me", "GET")).toBe(true);
    expect(
      isAllowedBffUpstream("yonetim", `admin/businesses/${uuid}`, "PATCH"),
    ).toBe(true);
    expect(isAllowedBffUpstream("yonetim", "admin/categories", "POST")).toBe(
      true,
    );
    expect(
      isAllowedBffUpstream("yonetim", `admin/categories/${uuid}`, "PATCH"),
    ).toBe(true);
    expect(isAllowedBffUpstream("yonetim", "admin/reports", "GET")).toBe(true);
    expect(
      isAllowedBffUpstream("yonetim", "admin/reports?from=2026-01-01", "GET"),
    ).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin/me", "POST")).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin/users", "DELETE")).toBe(
      false,
    );
    expect(isAllowedBffUpstream("yonetim", "auth/verify", "GET")).toBe(false);
    expect(
      isAllowedBffUpstream("yonetim", "privacy/deletion-requests", "POST"),
    ).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin/../auth/verify", "GET")).toBe(
      false,
    );
    expect(isAllowedBffUpstream("yonetim", "admin/users/extra", "GET")).toBe(
      false,
    );
  });

  it("rejects encoded traversal %2e%2e and %2f", () => {
    expect(
      isAllowedBffUpstream("yonetim", "admin/%2e%2e/auth/verify", "GET"),
    ).toBe(false);
    expect(
      isAllowedBffUpstream("yonetim", "admin/%2E%2E/auth/verify", "GET"),
    ).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin%2fusers", "GET")).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin/%2fusers", "GET")).toBe(
      false,
    );
    expect(isAllowedBffUpstream("isletme", "business/%2e%2e/me", "GET")).toBe(
      false,
    );
    expect(isAllowedBffUpstream("isletme", "business%2fme", "GET")).toBe(false);
  });

  it("allows işletme panel path+method pairs and rejects catch-all abuse", () => {
    expect(isAllowedBffUpstream("isletme", "business/me", "GET")).toBe(true);
    expect(isAllowedBffUpstream("isletme", "business/me", "PATCH")).toBe(true);
    expect(isAllowedBffUpstream("isletme", "bookings", "GET")).toBe(true);
    expect(
      isAllowedBffUpstream("isletme", `business/services/${uuid}`, "DELETE"),
    ).toBe(true);
    expect(
      isAllowedBffUpstream("isletme", `business/staff/${uuid}`, "PATCH"),
    ).toBe(true);
    expect(
      isAllowedBffUpstream("isletme", "business/availability", "POST"),
    ).toBe(true);
    expect(
      isAllowedBffUpstream(
        "isletme",
        `business/availability/${uuid}`,
        "DELETE",
      ),
    ).toBe(true);
    expect(isAllowedBffUpstream("isletme", "business/me", "DELETE")).toBe(
      false,
    );
    expect(isAllowedBffUpstream("isletme", "admin/users", "GET")).toBe(false);
    expect(isAllowedBffUpstream("isletme", "otp/request", "POST")).toBe(false);
    expect(isAllowedBffUpstream("isletme", "internal/waitlist", "GET")).toBe(
      false,
    );
  });
});
