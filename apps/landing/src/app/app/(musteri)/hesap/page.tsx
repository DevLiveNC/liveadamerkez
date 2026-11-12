import { app } from "@ada-merkez/copy";
import { AccountPanel } from "../../../../components/app/AccountPanel";
import { requireRole } from "../../../../lib/app-auth";

export default async function HesapPage() {
  const session = await requireRole("customer", "/app/hesap");
  return <AccountPanel name={session.name || app.customer} phone={session.phone} />;
}
