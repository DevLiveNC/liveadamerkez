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
    `INSERT INTO business (name, slug, status, timezone, sample)
     VALUES ('Örnek Kuaför', $1, 'published', 'Europe/Nicosia', true)
     ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, status = EXCLUDED.status, sample = true
     RETURNING id`,
    [`ornek-kuafor-${randomInt(1000, 9999)}`],
  );
  const tenantId = business.rows[0]?.id;
  if (!tenantId) throw new Error("Örnek işletme oluşturulamadı.");
  const category = await pool.query<{ id: string }>(
    `SELECT id FROM category WHERE slug = 'kuafor' LIMIT 1`,
  );
  const categoryId = category.rows[0]?.id ?? null;
  if (categoryId) {
    await pool.query(`UPDATE business SET category_id = $2 WHERE id = $1`, [tenantId, categoryId]);
  }
  const staff = await pool.query<{ id: string }>(
    `INSERT INTO staff (tenant_id, name, active) VALUES ($1, 'Örnek personel', true) RETURNING id`,
    [tenantId],
  );
  const staffId = staff.rows[0]?.id;
  await pool.query(
    `INSERT INTO service (tenant_id, name, duration_minutes, staff_id)
     VALUES ($1, 'Kesim ve bakım', 60, $2)`,
    [tenantId, staffId ?? null],
  );
  await pool.query(
    `INSERT INTO availability_rule (tenant_id, staff_id, weekday, starts_at_minutes, ends_at_minutes)
     VALUES ($1, $2, NULL, 540, 1080)`,
    [tenantId, staffId ?? null],
  );

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
