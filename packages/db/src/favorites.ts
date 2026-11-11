import { and, eq } from "drizzle-orm";
import { getDb } from "./client.js";
import { business, category, favorite, location } from "./schema.js";
import { findPublishedBusinessId } from "./catalog.js";

export class FavoriteDeniedError extends Error {
  readonly status = 404;
  readonly code = "NOT_FOUND";
  constructor() {
    super("Kayıt bulunamadı.");
    this.name = "FavoriteDeniedError";
  }
}

export async function listFavoritesForAccount(accountId: string) {
  return getDb()
    .select({
      id: favorite.id,
      businessId: favorite.tenantId,
      name: business.name,
      sample: business.sample,
      city: location.cityName,
      category: category.name,
      createdAt: favorite.createdAt,
    })
    .from(favorite)
    .innerJoin(business, eq(favorite.tenantId, business.id))
    .leftJoin(location, eq(business.locationId, location.id))
    .leftJoin(category, eq(business.categoryId, category.id))
    .where(eq(favorite.accountId, accountId));
}

export async function addFavorite(accountId: string, businessId: string) {
  const published = await findPublishedBusinessId(businessId);
  if (!published) throw new FavoriteDeniedError();
  const [row] = await getDb()
    .insert(favorite)
    .values({ accountId, tenantId: published })
    .onConflictDoNothing({ target: [favorite.accountId, favorite.tenantId] })
    .returning();
  if (row) return row;
  const [existing] = await getDb()
    .select()
    .from(favorite)
    .where(and(eq(favorite.accountId, accountId), eq(favorite.tenantId, published)))
    .limit(1);
  return existing ?? null;
}

export async function removeFavorite(accountId: string, businessId: string) {
  const deleted = await getDb()
    .delete(favorite)
    .where(and(eq(favorite.accountId, accountId), eq(favorite.tenantId, businessId)))
    .returning({ id: favorite.id });
  if (!deleted.length) throw new FavoriteDeniedError();
}

export async function isFavorite(accountId: string, businessId: string): Promise<boolean> {
  const [row] = await getDb()
    .select({ id: favorite.id })
    .from(favorite)
    .where(and(eq(favorite.accountId, accountId), eq(favorite.tenantId, businessId)))
    .limit(1);
  return Boolean(row);
}
