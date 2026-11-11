import { and, eq } from "drizzle-orm";
import { getDb } from "./client.js";
import { availabilityRule, business, category, location, service } from "./schema.js";

export type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  sample: boolean;
  city: string | null;
  category: string | null;
  categorySlug: string | null;
  serviceName: string | null;
};

export async function listApprovedBusinesses(filters?: {
  q?: string;
  category?: string;
  city?: string;
}): Promise<PublicBusiness[]> {
  const db = getDb();
  const rows = await db
    .select({
      id: business.id,
      name: business.name,
      slug: business.slug,
      sample: business.sample,
      status: business.status,
      city: location.cityName,
      category: category.name,
      categorySlug: category.slug,
    })
    .from(business)
    .leftJoin(location, eq(business.locationId, location.id))
    .leftJoin(category, eq(business.categoryId, category.id))
    .where(eq(business.status, "approved"));

  const q = filters?.q?.trim().toLocaleLowerCase("tr-TR");
  const cat = filters?.category?.trim().toLocaleLowerCase("tr-TR");
  const city = filters?.city?.trim().toLocaleLowerCase("tr-TR");

  const filtered = rows.filter((row) => {
    if (cat && (row.categorySlug ?? "").toLocaleLowerCase("tr-TR") !== cat) return false;
    if (city && (row.city ?? "").toLocaleLowerCase("tr-TR") !== city) return false;
    if (q) {
      const hay = `${row.name} ${row.city ?? ""} ${row.category ?? ""}`.toLocaleLowerCase("tr-TR");
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const services = await db
    .select({ tenantId: service.tenantId, name: service.name })
    .from(service);

  const firstService = new Map<string, string>();
  for (const item of services) {
    if (!firstService.has(item.tenantId)) firstService.set(item.tenantId, item.name);
  }

  return filtered.map((row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    sample: row.sample,
    city: row.city,
    category: row.category,
    categorySlug: row.categorySlug,
    serviceName: firstService.get(row.id) ?? null,
  }));
}

export async function getPublishedBusiness(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      id: business.id,
      name: business.name,
      slug: business.slug,
      sample: business.sample,
      status: business.status,
      timezone: business.timezone,
      city: location.cityName,
      category: category.name,
      categorySlug: category.slug,
    })
    .from(business)
    .leftJoin(location, eq(business.locationId, location.id))
    .leftJoin(category, eq(business.categoryId, category.id))
    .where(and(eq(business.id, id), eq(business.status, "approved")))
    .limit(1);
  if (!row) return null;

  const services = await db
    .select({
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      staffId: service.staffId,
    })
    .from(service)
    .where(and(eq(service.tenantId, row.id), eq(service.active, true)));

  return { ...row, services };
}

export async function listPublicServices(tenantId: string) {
  return getDb()
    .select({
      id: service.id,
      name: service.name,
      durationMinutes: service.durationMinutes,
      staffId: service.staffId,
    })
    .from(service)
    .where(and(eq(service.tenantId, tenantId), eq(service.active, true)));
}

export async function listPublicAvailability(tenantId: string) {
  return getDb().select().from(availabilityRule).where(eq(availabilityRule.tenantId, tenantId));
}

export async function findPublishedBusinessId(id: string): Promise<string | null> {
  const [row] = await getDb()
    .select({ id: business.id })
    .from(business)
    .where(and(eq(business.id, id), eq(business.status, "approved")))
    .limit(1);
  return row?.id ?? null;
}
