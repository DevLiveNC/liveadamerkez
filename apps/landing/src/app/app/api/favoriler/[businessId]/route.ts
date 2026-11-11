import { proxyMe } from "../../../../../lib/app-api";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await context.params;
  return proxyMe(request, `/v1/me/favorites/${businessId}`, { method: "DELETE" });
}
