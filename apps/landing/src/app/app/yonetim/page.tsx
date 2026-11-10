import { app } from "@ada-merkez/copy";
import { DekorNavCorner } from "@ada-merkez/ui";
import { EmptyState } from "../../../components/app/EmptyState";
import { requireRole } from "../../../lib/app-auth";

export default async function YonetimPage() {
  await requireRole("admin", "/app/yonetim");
  return (
    <>
      <nav className="side-nav" aria-label={app.admin}>
        <DekorNavCorner />
      </nav>
      <header className="am-head">
        <p className="t-label">{app.admin}</p>
        <h1>{app.adminStub}</h1>
      </header>
      <EmptyState kind="onay-bekliyor" />
    </>
  );
}
