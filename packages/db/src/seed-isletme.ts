import { eq } from "drizzle-orm";
import { toE164 } from "@ada-merkez/shared";
import { closePool, getDb, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import { appAccount, business, businessMember, category, location } from "./schema.js";
import { findUserByPhone, membershipForUser, upsertSeedUser } from "./isletme.js";

/**
 * Test işletme / yönetici hesapları.
 * Telefonlar ortam değişkeninden okunur; şifre veya OTP kodu yazılmaz.
 * SEED_BUSINESS_PHONE, SEED_ADMIN_PHONE, ALLOW_ADMIN_SEED=true
 */
export async function seedIsletme(): Promise<{
  businessUserId: string | null;
  adminUserId: string | null;
  tenantId: string | null;
}> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  await migrate();

  const businessPhone = toE164(process.env.SEED_BUSINESS_PHONE ?? "");
  const adminPhone = toE164(process.env.SEED_ADMIN_PHONE ?? "");
  let businessUserId: string | null = null;
  let adminUserId: string | null = null;
  let tenantId: string | null = null;

  if (businessPhone) {
    const user = await upsertSeedUser({
      phone: businessPhone,
      role: "business",
      displayName: "Örnek işletme yetkilisi",
    });
    businessUserId = user.id;
    const existing = await membershipForUser(user.id);
    if (existing) {
      tenantId = existing.tenantId;
    } else {
      const [kuafor] = await getDb()
        .select()
        .from(category)
        .where(eq(category.slug, "kuafor"))
        .limit(1);
      const [lefkosa] = await getDb()
        .select()
        .from(location)
        .where(eq(location.id, "a0000000-0000-4000-8000-000000000001"))
        .limit(1);
      const [created] = await getDb()
        .insert(business)
        .values({
          name: "Örnek işletme",
          slug: `ornek-isletme-${user.id.slice(0, 8)}`,
          status: "approved",
          timezone: "Europe/Nicosia",
          cityName: "Lefkoşa",
          sector: "kuafor",
          inTurkey: false,
          categoryId: kuafor?.id ?? null,
          locationId: lefkosa?.id ?? null,
          ownerUserId: user.id,
          description: "Örnek işletme — test kaydı. Gerçek işletme değildir.",
        })
        .returning();
      if (!created) throw new Error("Örnek işletme yazılamadı.");
      tenantId = created.id;
      await getDb().insert(businessMember).values({
        userId: user.id,
        tenantId: created.id,
        memberRole: "owner",
      });
      await getDb()
        .update(appAccount)
        .set({ tenantId: created.id, updatedAt: new Date() })
        .where(eq(appAccount.id, user.id));
    }
  } else {
    console.info("seed-isletme: SEED_BUSINESS_PHONE yok; işletme kullanıcısı atlandı.");
  }

  if (adminPhone) {
    if (process.env.ALLOW_ADMIN_SEED !== "true") {
      console.info("seed-isletme: ALLOW_ADMIN_SEED=true değil; yönetici atlandı.");
    } else {
      const already = await findUserByPhone(adminPhone);
      if (already?.role === "admin") {
        adminUserId = already.id;
      } else {
        const user = await upsertSeedUser({
          phone: adminPhone,
          role: "admin",
          displayName: "Yönetici",
        });
        adminUserId = user.id;
      }
    }
  } else {
    console.info("seed-isletme: SEED_ADMIN_PHONE yok; yönetici kullanıcısı atlandı.");
  }

  return { businessUserId, adminUserId, tenantId };
}

const invokedAsCli = (process.argv[1] ?? "").includes("seed-isletme");
if (invokedAsCli) {
  seedIsletme()
    .then((result) => {
      console.info("seed-isletme: tamam.", {
        business: Boolean(result.businessUserId),
        admin: Boolean(result.adminUserId),
        tenant: Boolean(result.tenantId),
      });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await closePool();
    });
}
