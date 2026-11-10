import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema.js";
import { pgSslOption } from "./ssl.js";

export type Database = NodePgDatabase<typeof schema>;

let pool: pg.Pool | null = null;
let db: Database | null = null;

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function getPool(): pg.Pool {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    throw new Error("DATABASE_URL tanımlı değil.");
  }
  if (!pool) {
    pool = new pg.Pool({
      connectionString: url,
      max: Number(process.env.DB_POOL_MAX ?? 5),
      ssl: pgSslOption(url),
    });
  }
  return pool;
}

export function getDb(): Database {
  if (!db) {
    db = drizzle(getPool(), { schema });
  }
  return db;
}

export async function checkDatabase(): Promise<"connected" | "disconnected"> {
  if (!isDatabaseConfigured()) return "disconnected";
  try {
    const result = await getPool().query("select 1 as ok");
    return result.rows[0] ? "connected" : "disconnected";
  } catch {
    return "disconnected";
  }
}

export async function withTenant<T>(
  tenantId: string,
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    try {
      await client.query("SET LOCAL ROLE ada_app");
    } catch {
      /* rol yoksa app.tenant_id ile devam */
    }
    const value = await fn(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function withTenantDb<T>(
  tenantId: string,
  fn: (db: Database) => Promise<T>,
): Promise<T> {
  return withTenant(tenantId, async (client) => {
    const scoped = drizzle(client, { schema });
    return fn(scoped);
  });
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}

export { schema };
