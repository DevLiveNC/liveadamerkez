import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";
import { pgSslOption } from "./ssl.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const sqlDir = path.resolve(here, "../drizzle");

export async function migrate(databaseUrl = process.env.DATABASE_URL): Promise<void> {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL tanımlı değil; migration atlandı değil, hata.");
  }
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: pgSslOption(databaseUrl),
  });
  await client.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migration (
        id text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      );
    `);
    const files = fs
      .readdirSync(sqlDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const applied = await client.query(
        "SELECT 1 FROM schema_migration WHERE id = $1",
        [file],
      );
      if (applied.rowCount) continue;
      const sql = fs.readFileSync(path.join(sqlDir, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migration (id) VALUES ($1)", [file]);
        await client.query("COMMIT");
        console.log(`migrated ${file}`);
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

const invokedAsCli = (process.argv[1] ?? "").includes("migrate");
if (invokedAsCli) {
  migrate().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
