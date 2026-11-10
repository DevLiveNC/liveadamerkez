export function readInternalToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (header?.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }
  return request.headers.get("x-internal-token")?.trim() || null;
}

export function assertInternalAccess(request: Request): boolean {
  const expected = process.env.INTERNAL_EXPORT_TOKEN?.trim();
  if (!expected) return false;
  const provided = readInternalToken(request);
  return Boolean(provided && provided === expected);
}
