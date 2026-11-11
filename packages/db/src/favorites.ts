import { and, eq, inArray } from "drizzle-orm";
import { getDb, withCustomerDb } from "./client.js";
import { business, category, favorite, location } from "./schema.js";
import { findApprovedBusinessId } from "./catalog.js";

export class FavoriteDeniedError extends Error {
  readonly status = 404;
  readonly code = "NOT_FOUND";
  constructor() {
    super("Kayıt bulunamadı.");
    this.name = "FavoriteDeniedError";
  }
}

export async function listFavoritesForAccount(accountId: string) {
  const rows = await withCustomerDb(accountId, (db) =>
    db
      .select({
        id: favorite.id,
        businessId: favorite.tenantId,
        createdAt: favorite.createdAt,
      })
      .from(favorite)
      .where(eq(favorite.accountId, accountId)),
  );
  if (!rows.length) return [];
  const metas = await getDb()
    .select({
      id: business.id,
      name: business.name,
      sample: business.sample,
      city: location.cityName,
      category: category.name,
    })
    .from(business)
    .leftJoin(location, eq(business.locationId, location.id))
    .leftJoin(category, eq(business.categoryId, category.id))
    .where(inArray(business.id, rows.map((row) => row.businessId)));
  const byId = new Map(metas.map((meta) => [meta.id, meta]));
  return rows.map((row) => {
    const meta = byId.get(row.businessId);
    return {
      id: row.id,
      businessId: row.businessId,
      name: meta?.name ?? "",
      sample: meta?.sample ?? false,
      city: meta?.city ?? null,
      category: meta?.category ?? null,
      createdAt: row.createdAt,
    };
  });
}

export async function addFavorite(accountId: string, businessId: string) {
  const published = await findApprovedBusinessId(businessId);
  if (!published) throw new FavoriteDeniedError();
  return withCustomerDb(accountId, async (db) => {
    const [row] = await db
      .insert(favorite)
      .values({ accountId, tenantId: published })
      .onConflictDoNothing({ target: [favorite.accountId, favorite.tenantId] })
      .returning();
    if (row) return row;
    const [existing] = await db
      .select()
      .from(favorite)
      .where(and(eq(favorite.accountId, accountId), eq(favorite.tenantId, published)))
      .limit(1);
    return existing ?? null;
  });
}

export async function removeFavorite(accountId: string, businessId: string) {
  const deleted = await withCustomerDb(accountId, (db) =>
    db
      .delete(favorite)
      .where(and(eq(favorite.accountId, accountId), eq(favorite.tenantId, businessId)))
      .returning({ id: favorite.id }),
  );
  if (!deleted.length) throw new FavoriteDeniedError();
}

export async function isFavorite(accountId: string, businessId: string): Promise<boolean> {
  const [row] = await withCustomerDb(accountId, (db) =>
    db
      .select({ id: favorite.id })
      .from(favorite)
      .where(and(eq(favorite.accountId, accountId), eq(favorite.tenantId, businessId)))
      .limit(1),
  );
  return Boolean(row);
}
