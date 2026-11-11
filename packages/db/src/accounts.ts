import { and, eq } from "drizzle-orm";
import type { SessionRole } from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { appAccount } from "./schema.js";

export type AppAccount = typeof appAccount.$inferSelect;

export async function findAccountByPhoneRole(
  phone: string,
  role: SessionRole,
): Promise<AppAccount | null> {
  const [row] = await getDb()
    .select()
    .from(appAccount)
    .where(and(eq(appAccount.phone, phone), eq(appAccount.role, role)))
    .limit(1);
  return row ?? null;
}

export async function getAccountById(id: string): Promise<AppAccount | null> {
  const [row] = await getDb().select().from(appAccount).where(eq(appAccount.id, id)).limit(1);
  return row ?? null;
}

export async function createAccount(input: {
  phone: string;
  role: SessionRole;
  name?: string | null;
  email?: string | null;
  tenantId?: string | null;
}): Promise<AppAccount> {
  const [row] = await getDb()
    .insert(appAccount)
    .values({
      phone: input.phone,
      role: input.role,
      name: input.name?.trim() || null,
      email: input.email?.trim() || null,
      tenantId: input.tenantId || null,
    })
    .returning();
  if (!row) throw new Error("Hesap oluşturulamadı.");
  return row;
}

export async function updateAccountName(accountId: string, name: string): Promise<AppAccount | null> {
  const trimmed = name.trim();
  if (trimmed.length < 2) return null;
  const [row] = await getDb()
    .update(appAccount)
    .set({ name: trimmed, updatedAt: new Date() })
    .where(eq(appAccount.id, accountId))
    .returning();
  return row ?? null;
}
