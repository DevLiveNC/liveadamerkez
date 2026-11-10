import { describe, expect, it } from "vitest";
import { canTransitionBookingStatus } from "./booking-status.js";

describe("booking status transitions", () => {
  it("allows pending to confirmed or cancelled only", () => {
    expect(canTransitionBookingStatus("pending", "confirmed")).toBe(true);
    expect(canTransitionBookingStatus("pending", "cancelled")).toBe(true);
    expect(canTransitionBookingStatus("pending", "no_show")).toBe(false);
    expect(canTransitionBookingStatus("confirmed", "no_show")).toBe(true);
    expect(canTransitionBookingStatus("cancelled", "confirmed")).toBe(false);
  });
});
