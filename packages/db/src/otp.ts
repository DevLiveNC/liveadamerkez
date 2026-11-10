import { and, desc, eq } from "drizzle-orm";
import {
  evaluateOtpSend,
  evaluateOtpVerify,
  type OtpChallengeState,
} from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { otpChallenge } from "./schema.js";

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

async function persist(phone: string, purpose: string, state: OtpChallengeState) {
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

export async function requestOtp(phone: string, purpose = "login", now = Date.now()) {
  const [existing] = await getDb()
    .select()
    .from(otpChallenge)
    .where(and(eq(otpChallenge.phone, phone), eq(otpChallenge.purpose, purpose)))
    .orderBy(desc(otpChallenge.updatedAt))
    .limit(1);
  const decision = evaluateOtpSend(existing ? toState(existing) : null, now, phone, purpose);
  await persist(phone, purpose, decision.next);
  return decision;
}

export async function verifyOtp(
  phone: string,
  purpose: string,
  codeMatches: boolean,
  now = Date.now(),
) {
  const [existing] = await getDb()
    .select()
    .from(otpChallenge)
    .where(and(eq(otpChallenge.phone, phone), eq(otpChallenge.purpose, purpose)))
    .orderBy(desc(otpChallenge.updatedAt))
    .limit(1);
  const decision = evaluateOtpVerify(existing ? toState(existing) : null, now, codeMatches);
  if (existing) {
    await persist(phone, purpose, decision.next);
  }
  return decision;
}
