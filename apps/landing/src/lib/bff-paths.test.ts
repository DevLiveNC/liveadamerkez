import { describe, expect, it } from "vitest";
import { isAllowedBffUpstream } from "./bff-paths";

describe("isAllowedBffUpstream", () => {
  it("allows yönetici panel paths and rejects the rest of /v1", () => {
    expect(isAllowedBffUpstream("yonetim", "admin/me")).toBe(true);
    expect(
      isAllowedBffUpstream("yonetim", "admin/businesses/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
    ).toBe(true);
    expect(isAllowedBffUpstream("yonetim", "auth/verify")).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "privacy/deletion-requests")).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin/../auth/verify")).toBe(false);
    expect(isAllowedBffUpstream("yonetim", "admin/users/extra")).toBe(false);
  });

  it("allows işletme panel paths and rejects catch-all abuse", () => {
    expect(isAllowedBffUpstream("isletme", "business/me")).toBe(true);
    expect(isAllowedBffUpstream("isletme", "bookings")).toBe(true);
    expect(
      isAllowedBffUpstream("isletme", "business/services/aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee"),
    ).toBe(true);
    expect(isAllowedBffUpstream("isletme", "admin/users")).toBe(false);
    expect(isAllowedBffUpstream("isletme", "otp/request")).toBe(false);
    expect(isAllowedBffUpstream("isletme", "internal/waitlist")).toBe(false);
  });
});
