import { OTP_POLICY } from "./constants.js";

export type OtpChallengeState = {
  phone: string;
  purpose: string;
  sendCount: number;
  attemptCount: number;
  windowStartedAt: number;
  lastSentAt: number | null;
  lockedUntil: number | null;
  expiresAt: number | null;
};

export type OtpSendDecision =
  | { ok: true; next: OtpChallengeState }
  | { ok: false; code: "RATE_LIMITED"; retryAfterMs: number; next: OtpChallengeState };

export type OtpVerifyDecision =
  | { ok: true; next: OtpChallengeState }
  | {
      ok: false;
      code: "LOCKED" | "EXPIRED" | "INVALID" | "MAX_ATTEMPTS";
      retryAfterMs?: number;
      next: OtpChallengeState;
    };

function freshState(
  phone: string,
  purpose: string,
  now: number,
): OtpChallengeState {
  return {
    phone,
    purpose,
    sendCount: 0,
    attemptCount: 0,
    windowStartedAt: now,
    lastSentAt: null,
    lockedUntil: null,
    expiresAt: null,
  };
}

function inLock(state: OtpChallengeState, now: number): boolean {
  return state.lockedUntil !== null && now < state.lockedUntil;
}

function windowElapsed(state: OtpChallengeState, now: number): boolean {
  return now - state.windowStartedAt >= OTP_POLICY.windowMs;
}

export function evaluateOtpSend(
  current: OtpChallengeState | null,
  now: number,
  phone: string,
  purpose = "login",
): OtpSendDecision {
  let state = current ?? freshState(phone, purpose, now);

  if (inLock(state, now)) {
    return {
      ok: false,
      code: "RATE_LIMITED",
      retryAfterMs: (state.lockedUntil ?? now) - now,
      next: state,
    };
  }

  if (windowElapsed(state, now)) {
    state = {
      ...freshState(phone, purpose, now),
    };
  }

  if (state.sendCount >= OTP_POLICY.maxSendsPerWindow) {
    const retryAfterMs = OTP_POLICY.windowMs - (now - state.windowStartedAt);
    const locked: OtpChallengeState = {
      ...state,
      lockedUntil: now + Math.max(retryAfterMs, 0),
    };
    return {
      ok: false,
      code: "RATE_LIMITED",
      retryAfterMs: Math.max(retryAfterMs, 0),
      next: locked,
    };
  }

  const next: OtpChallengeState = {
    ...state,
    sendCount: state.sendCount + 1,
    lastSentAt: now,
    expiresAt: now + OTP_POLICY.codeTtlMs,
    attemptCount: 0,
  };
  return { ok: true, next };
}

export function evaluateOtpVerify(
  current: OtpChallengeState | null,
  now: number,
  codeMatches: boolean,
): OtpVerifyDecision {
  if (!current) {
    return {
      ok: false,
      code: "EXPIRED",
      next: freshState("unknown", "login", now),
    };
  }

  if (inLock(current, now)) {
    return {
      ok: false,
      code: "LOCKED",
      retryAfterMs: (current.lockedUntil ?? now) - now,
      next: current,
    };
  }

  if (!current.expiresAt || now > current.expiresAt) {
    return { ok: false, code: "EXPIRED", next: current };
  }

  if (codeMatches) {
    return {
      ok: true,
      next: {
        ...current,
        attemptCount: 0,
        expiresAt: now,
        lockedUntil: null,
      },
    };
  }

  const attemptCount = current.attemptCount + 1;
  if (attemptCount >= OTP_POLICY.maxVerifyAttempts) {
    const next: OtpChallengeState = {
      ...current,
      attemptCount,
      lockedUntil: now + OTP_POLICY.lockMs,
    };
    return {
      ok: false,
      code: "MAX_ATTEMPTS",
      retryAfterMs: OTP_POLICY.lockMs,
      next,
    };
  }

  return {
    ok: false,
    code: "INVALID",
    next: { ...current, attemptCount },
  };
}

export { OTP_POLICY };
