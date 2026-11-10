import { eq } from "drizzle-orm";
import { getDb, isDatabaseConfigured, rateLimitWindow } from "@ada-merkez/db";
import { clientIp } from "./http";

const memory = new Map<string, { started: number; count: number }>();

export async function consumeRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<{ ok: true } | { ok: false; retryAfterMs: number }> {
  const now = Date.now();
  if (isDatabaseConfigured()) {
    try {
      const db = getDb();
      const [row] = await db
        .select()
        .from(rateLimitWindow)
        .where(eq(rateLimitWindow.key, key))
        .limit(1);
      if (!row || now - row.windowStartedAt.getTime() >= windowMs) {
        await db
          .insert(rateLimitWindow)
          .values({ key, windowStartedAt: new Date(now), hitCount: 1 })
          .onConflictDoUpdate({
            target: rateLimitWindow.key,
            set: { windowStartedAt: new Date(now), hitCount: 1 },
          });
        return { ok: true };
      }
      if (row.hitCount >= limit) {
        return {
          ok: false,
          retryAfterMs: windowMs - (now - row.windowStartedAt.getTime()),
        };
      }
      await db
        .update(rateLimitWindow)
        .set({ hitCount: row.hitCount + 1 })
        .where(eq(rateLimitWindow.key, key));
      return { ok: true };
    } catch {
      /* bellek yedeği */
    }
  }
  const current = memory.get(key);
  if (!current || now - current.started >= windowMs) {
    memory.set(key, { started: now, count: 1 });
    return { ok: true };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfterMs: windowMs - (now - current.started) };
  }
  current.count += 1;
  return { ok: true };
}

export async function limitRequest(
  request: Request,
  bucket: string,
  limit = 20,
  windowMs = 10 * 60 * 1000,
) {
  return consumeRateLimit(`${bucket}:${clientIp(request)}`, limit, windowMs);
}
