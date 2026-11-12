import { and, eq } from "drizzle-orm";
import type { SessionRole } from "@ada-merkez/shared";
import { getDb } from "./client.js";
import { appAccount, business, businessMember } from "./schema.js";

/** Caller must validate the test phone allowlist before provisioning. */
export async function provisionTestAccount(phone: string, role: SessionRole) {
  return getDb().transaction(async (tx) => {
    for (const accountRole of ["customer", "business", "admin"] as const) {
      await tx.insert(appAccount).values({ phone, role: accountRole, name: "Test hesabı" })
        .onConflictDoNothing();
    }
    const [owner] = await tx.select().from(appAccount)
      .where(and(eq(appAccount.phone, phone), eq(appAccount.role, "business")));
    if (!owner) throw new Error("Test hesabı oluşturulamadı.");
    const slug = `test-isletme-${owner.id}`;
    if (!owner.tenantId) {
      await tx.insert(business).values({
        slug, name: "Test işletmesi", status: "approved", ownerUserId: owner.id,
        timezone: "Europe/Nicosia", cityName: "Lefkoşa", sector: "kuafor",
        description: "Test kaydı. Gerçek işletme değildir.",
      }).onConflictDoNothing();
      const [tenant] = await tx.select().from(business).where(eq(business.slug, slug));
      if (!tenant) throw new Error("Test işletmesi oluşturulamadı.");
      await tx.insert(businessMember).values({ userId: owner.id, tenantId: tenant.id, memberRole: "owner" })
        .onConflictDoNothing();
      await tx.update(appAccount).set({ tenantId: tenant.id }).where(eq(appAccount.id, owner.id));
    }
    const [account] = await tx.select().from(appAccount)
      .where(and(eq(appAccount.phone, phone), eq(appAccount.role, role)));
    if (!account) throw new Error("Test hesabı bulunamadı.");
    return account;
  });
}
