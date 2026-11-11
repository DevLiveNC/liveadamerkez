import { and, desc, eq } from "drizzle-orm";
import {
  evaluateOtpIpSend,
  evaluateOtpSend,
  evaluateOtpVerify,
  OTP_POLICY,
  type OtpChallengeState,
  type OtpIpState,
} from "@ada-merkez/shared";
import { generateOtpCode, hashOtp, otpHashesEqual } from "@ada-merkez/shared/node";
import { getDb } from "./client.js";
import { otpChallenge, otpIpWindow } from "./schema.js";

function toState(row: typeof otpChallenge.$inferSelect): OtpChallengeState {
  return {
    phone: row.phone,
    purpose: row.purpose,
    sendCount: row.sendCount,
    attemptCount: row.attemptCount,
    windowStartedAt: row.windowStartedAt.getTime(),
    lastSentAt: row.lastSentAt ? row.lastSentAt.getTime() : null,
    lockedUntil: row.lockedUntil ? row.lockedUntil.getTime() : null,
    expiresAt: row.expiresAt ? row.expiresAt.getTime() : null,
  };
}

function toIpState(row: typeof otpIpWindow.$inferSelect): OtpIpState {
  return {
    ipHash: row.ipHash,
    sendCount: row.sendCount,
    windowStartedAt: row.windowStartedAt.getTime(),
    lockedUntil: row.lockedUntil ? row.lockedUntil.getTime() : null,
  };
}

async function persistIp(state: OtpIpState) {
  const values = {
    ipHash: state.ipHash,
    windowStartedAt: new Date(state.windowStartedAt),
    sendCount: state.sendCount,
    lockedUntil: state.lockedUntil ? new Date(state.lockedUntil) : null,
  };
  await getDb()
    .insert(otpIpWindow)
    .values(values)
    .onConflictDoUpdate({
      target: otpIpWindow.ipHash,
      set: {
        windowStartedAt: values.windowStartedAt,
        sendCount: values.sendCount,
        lockedUntil: values.lockedUntil,
      },
    });
}

async function persist(
  phone: string,
  purpose: string,
  state: OtpChallengeState,
  extra?: { codeHash?: string | null; ipHash?: string | null },
) {
  const values = {
    phone,
    purpose,
    sendCount: state.sendCount,
    attemptCount: state.attemptCount,
    windowStartedAt: new Date(state.windowStartedAt),
    lastSentAt: state.lastSentAt ? new Date(state.lastSentAt) : null,
    lockedUntil: state.lockedUntil ? new Date(state.lockedUntil) : null,
    expiresAt: state.expiresAt ? new Date(state.expiresAt) : null,
    updatedAt: new Date(),
    ...(extra && "codeHash" in extra ? { codeHash: extra.codeHash } : {}),
    ...(extra && "ipHash" in extra ? { ipHash: extra.ipHash } : {}),
  };
  const [existing] = await getDb()
    .select()
    .from(otpChallenge)
    .where(and(eq(otpChallenge.phone, phone), eq(otpChallenge.purpose, purpose)))
    .orderBy(desc(otpChallenge.updatedAt))
    .limit(1);

  if (existing) {
    const [row] = await getDb()
      .update(otpChallenge)
      .set(values)
      .where(eq(otpChallenge.id, existing.id))
      .returning();
    return row;
  }
  const [row] = await getDb().insert(otpChallenge).values(values).returning();
  return row;
}

export async function requestOtp(
  phone: string,
  purpose = "login",
  now = Date.now(),
  ipHash?: string | null,
) {
  if (ipHash) {
    const [ipRow] = await getDb()
      .select()
      .from(otpIpWindow)
      .where(eq(otpIpWindow.ipHash, ipHash))
      .limit(1);
    const ipDecision = evaluateOtpIpSend(ipRow ? toIpState(ipRow) : null, now, ipHash);
    await persistIp(ipDecision.next);
    if (!ipDecision.ok) {
      return { ...ipDecision, otpCode: undefined as string | undefined };
    }
  }

  const [existing] = await getDb()
    .select()
    .from(otpChallenge)
    .where(and(eq(otpChallenge.phone, phone), eq(otpChallenge.purpose, purpose)))
    .orderBy(desc(otpChallenge.updatedAt))
    .limit(1);
  const decision = evaluateOtpSend(existing ? toState(existing) : null, now, phone, purpose);
  if (!decision.ok) {
    await persist(phone, purpose, decision.next, { ipHash: ipHash ?? existing?.ipHash ?? null });
    return { ...decision, otpCode: undefined as string | undefined };
  }

  const otpCode = generateOtpCode(OTP_POLICY.codeLength);
  const codeHash = hashOtp(phone, purpose, otpCode);
  await persist(phone, purpose, decision.next, { codeHash, ipHash: ipHash ?? null });
  return { ...decision, otpCode };
}

export async function verifyOtp(
  phone: string,
  purpose: string,
  code: string,
  now = Date.now(),
) {
  const [existing] = await getDb()
    .select()
    .from(otpChallenge)
    .where(and(eq(otpChallenge.phone, phone), eq(otpChallenge.purpose, purpose)))
    .orderBy(desc(otpChallenge.updatedAt))
    .limit(1);
  const lengthOk = code.length === OTP_POLICY.codeLength && /^\d+$/.test(code);
  const expected = hashOtp(phone, purpose, code);
  const codeMatches = Boolean(lengthOk && existing && otpHashesEqual(existing.codeHash, expected));
  const decision = evaluateOtpVerify(existing ? toState(existing) : null, now, codeMatches);
  if (existing) {
    await persist(phone, purpose, decision.next, {
      codeHash: decision.ok ? null : existing.codeHash,
    });
  }
  return decision;
}
