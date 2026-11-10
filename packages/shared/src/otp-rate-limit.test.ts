import { describe, expect, it } from "vitest";
import {
  OTP_POLICY,
  evaluateOtpSend,
  evaluateOtpVerify,
} from "./otp-rate-limit.js";

const PHONE = "+905338000000";

describe("OTP rate limit and attempt cap", () => {
  it("allows up to max sends in a window then blocks", () => {
    const t0 = 1_000_000;
    let state = null;
    for (let i = 0; i < OTP_POLICY.maxSendsPerWindow; i += 1) {
      const result = evaluateOtpSend(state, t0 + i * 1000, PHONE);
      expect(result.ok).toBe(true);
      state = result.next;
    }
    const blocked = evaluateOtpSend(state, t0 + 5_000, PHONE);
    expect(blocked.ok).toBe(false);
    if (!blocked.ok) {
      expect(blocked.code).toBe("RATE_LIMITED");
      expect(blocked.retryAfterMs).toBeGreaterThan(0);
    }
  });

  it("resets send window after windowMs", () => {
    const t0 = 1_000_000;
    let state = null;
    for (let i = 0; i < OTP_POLICY.maxSendsPerWindow; i += 1) {
      state = evaluateOtpSend(state, t0, PHONE).next;
    }
    const after = evaluateOtpSend(state, t0 + OTP_POLICY.windowMs + 1, PHONE);
    expect(after.ok).toBe(true);
    expect(after.next.sendCount).toBe(1);
  });

  it("locks after max verify attempts", () => {
    const t0 = 2_000_000;
    const sent = evaluateOtpSend(null, t0, PHONE);
    expect(sent.ok).toBe(true);
    let state = sent.next;
    for (let i = 0; i < OTP_POLICY.maxVerifyAttempts - 1; i += 1) {
      const result = evaluateOtpVerify(state, t0 + 1000, false);
      expect(result.ok).toBe(false);
      if (!result.ok) expect(result.code).toBe("INVALID");
      state = result.next;
    }
    const locked = evaluateOtpVerify(state, t0 + 2000, false);
    expect(locked.ok).toBe(false);
    if (!locked.ok) {
      expect(locked.code).toBe("MAX_ATTEMPTS");
      expect(locked.next.lockedUntil).toBe(t0 + 2000 + OTP_POLICY.lockMs);
    }
    const stillLocked = evaluateOtpVerify(locked.next, t0 + 3000, true);
    expect(stillLocked.ok).toBe(false);
    if (!stillLocked.ok) expect(stillLocked.code).toBe("LOCKED");
  });

  it("accepts a matching code before the cap", () => {
    const t0 = 3_000_000;
    const sent = evaluateOtpSend(null, t0, PHONE);
    const ok = evaluateOtpVerify(sent.next, t0 + 500, true);
    expect(ok.ok).toBe(true);
  });

  it("rejects verify after code ttl", () => {
    const t0 = 4_000_000;
    const sent = evaluateOtpSend(null, t0, PHONE);
    const expired = evaluateOtpVerify(
      sent.next,
      t0 + OTP_POLICY.codeTtlMs + 1,
      true,
    );
    expect(expired.ok).toBe(false);
    if (!expired.ok) expect(expired.code).toBe("EXPIRED");
  });
});
