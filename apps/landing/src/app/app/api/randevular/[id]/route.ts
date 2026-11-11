import { proxyMe } from "../../../../../lib/app-api";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxyMe(request, `/v1/me/bookings/${id}`, { method: "DELETE" });
}
