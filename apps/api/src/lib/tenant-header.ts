export function readTenantId(request: Request): string | null {
  const header = request.headers.get("x-tenant-id")?.trim();
  return header || null;
}
