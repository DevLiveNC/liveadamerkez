/**
 * Test hesapları üretir. Kod ve telefonları stdout'a yazar; dosyaya veya repoya yazmaz.
 * Kullanım: npm run db:seed-test
 */
import { randomInt } from "node:crypto";
import { hashOtp } from "@ada-merkez/shared/node";
import { getPool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";

function randomPhone(prefix: string): string {
  return `${prefix}${String(randomInt(0, 10_000_000)).padStart(7, "0")}`;
}

function randomCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

async function main(): Promise<void> {
  if (!isDatabaseConfigured()) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  await migrate();
  const pool = getPool();
  const customerPhone = randomPhone("+90551");
  const businessPhone = randomPhone("+90552");
  const adminPhone = randomPhone("+90553");
  const customerCode = randomCode();
  const businessCode = randomCode();
  const adminCode = randomCode();
  const now = new Date();
  const expires = new Date(now.getTime() + 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO category (slug, name, kind)
     VALUES ('kuafor', 'Kuaför ve güzellik', 'slot')
     ON CONFLICT (slug) DO NOTHING`,
  );
  const business = await pool.query<{ id: string }>(
    `INSERT INTO business (name, slug, status, timezone)
     VALUES ('Örnek Kuaför', $1, 'published', 'Europe/Nicosia')
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status
     RETURNING id`,
    [`ornek-kuafor-${randomInt(1000, 9999)}`],
  );
  const tenantId = business.rows[0]?.id;
  if (!tenantId) throw new Error("Örnek işletme oluşturulamadı.");

  const accounts = [
    { phone: customerPhone, role: "customer", name: "Örnek müşteri", tenantId: null as string | null, code: customerCode },
    { phone: businessPhone, role: "business", name: "Örnek işletme", tenantId, code: businessCode },
    { phone: adminPhone, role: "admin", name: "Örnek yönetici", tenantId: null, code: adminCode },
  ] as const;

  for (const row of accounts) {
    await pool.query(
      `INSERT INTO app_account (phone, name, role, tenant_id)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (phone, role) DO UPDATE SET name = EXCLUDED.name, tenant_id = EXCLUDED.tenant_id`,
      [row.phone, row.name, row.role, row.tenantId],
    );
    const hash = hashOtp(row.phone, "login", row.code);
    await pool.query(
      `INSERT INTO otp_challenge (phone, purpose, code_hash, send_count, attempt_count, window_started_at, last_sent_at, expires_at)
       VALUES ($1, 'login', $2, 1, 0, $3, $3, $4)`,
      [row.phone, hash, now, expires],
    );
  }

  console.log("Ada Merkez test hesapları (yalnız bu çalıştırma; repoya yazılmaz).");
  console.log(`Müşteri\t${customerPhone}\tOTP ${customerCode}`);
  console.log(`İşletme\t${businessPhone}\tOTP ${businessCode}\tkiracı ${tenantId}`);
  console.log(`Yönetici\t${adminPhone}\tOTP ${adminCode}`);
  console.log("Giriş: /app/giris  ·  kodlar bir saat geçerlidir.");
}

const invoked = (process.argv[1] ?? "").includes("seed-test-accounts");
if (invoked) {
  main()
    .then(async () => {
      const { closePool } = await import("./client.js");
      await closePool();
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
