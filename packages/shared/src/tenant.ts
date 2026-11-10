export class TenantAccessError extends Error {
  readonly status = 404;
  readonly code = "TENANT_MISMATCH";

  constructor(message = "Kayıt bulunamadı.") {
    super(message);
    this.name = "TenantAccessError";
  }
}

export function assertSameTenant(
  resourceTenantId: string | null | undefined,
  actorTenantId: string | null | undefined,
): void {
  if (!actorTenantId || !resourceTenantId || resourceTenantId !== actorTenantId) {
    throw new TenantAccessError();
  }
}

export function belongsToTenant(
  resourceTenantId: string | null | undefined,
  actorTenantId: string | null | undefined,
): boolean {
  return Boolean(
    actorTenantId && resourceTenantId && resourceTenantId === actorTenantId,
  );
}

export function filterByTenant<T extends { tenantId: string }>(
  rows: T[],
  actorTenantId: string,
): T[] {
  return rows.filter((row) => row.tenantId === actorTenantId);
}
