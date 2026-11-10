import { describe, expect, it } from "vitest";
import { hashOtp, otpHashesEqual } from "./otp-code.js";
import { toE164 } from "./phone.js";

describe("OTP hash compare and E.164", () => {
  it("hashes codes and compares in constant-time equal length", () => {
    const a = hashOtp("+905331112233", "login", "123456");
    const b = hashOtp("+905331112233", "login", "123456");
    const c = hashOtp("+905331112233", "login", "000000");
    expect(otpHashesEqual(a, b)).toBe(true);
    expect(otpHashesEqual(a, c)).toBe(false);
    expect(otpHashesEqual(null, a)).toBe(false);
  });

  it("normalizes TR/Kuzey Kıbrıs numbers to E.164", () => {
    expect(toE164("0533 111 22 33")).toBe("+905331112233");
    expect(toE164("+90 548 888 23 66")).toBe("+905488882366");
    expect(toE164("905331112233")).toBe("+905331112233");
    expect(toE164("12")).toBeNull();
  });
});
