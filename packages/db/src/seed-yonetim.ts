import { toE164 } from "@ada-merkez/shared";
import { closePool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import { findAccountByPhoneRole } from "./accounts.js";
import { upsertSeedUser } from "./isletme.js";

/**
 * Test yönetici hesabı.
 * Telefon ortam değişkeninden okunur; şifre veya OTP kodu yazılmaz.
 * SEED_ADMIN_PHONE, ALLOW_ADMIN_SEED=true
 */
export async function seedYonetim(): Promise<{ adminUserId: string | null }> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  await migrate();

  const adminPhone = toE164(process.env.SEED_ADMIN_PHONE ?? "");
  let adminUserId: string | null = null;

  if (!adminPhone) {
    console.info("seed-yonetim: SEED_ADMIN_PHONE yok; yönetici atlandı.");
    return { adminUserId };
  }
  if (process.env.ALLOW_ADMIN_SEED !== "true") {
    console.info("seed-yonetim: ALLOW_ADMIN_SEED=true değil; yönetici atlandı.");
    return { adminUserId };
  }

  const already = await findAccountByPhoneRole(adminPhone, "admin");
  if (already) {
    adminUserId = already.id;
  } else {
    const user = await upsertSeedUser({
      phone: adminPhone,
      role: "admin",
      displayName: "Yönetici",
    });
    adminUserId = user.id;
  }
  return { adminUserId };
}

const invokedAsCli = (process.argv[1] ?? "").includes("seed-yonetim");
if (invokedAsCli) {
  seedYonetim()
    .then((result) => {
      console.info("seed-yonetim: tamam.", { admin: Boolean(result.adminUserId) });
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    })
    .finally(async () => {
      await closePool();
    });
}
