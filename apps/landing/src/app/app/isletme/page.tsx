import { app } from "@ada-merkez/copy";
import { DekorNavCorner } from "@ada-merkez/ui";
import { EmptyState } from "../../../components/app/EmptyState";
import { requireRole } from "../../../lib/app-auth";

export default async function IsletmePage() {
  await requireRole("business", "/app/isletme");
  return (
    <>
      <nav className="side-nav" aria-label={app.business}>
        <DekorNavCorner />
      </nav>
      <header className="am-head">
        <p className="t-label">{app.business}</p>
        <h1>{app.businessStub}</h1>
      </header>
      <EmptyState kind="onay-bekliyor" />
    </>
  );
}
