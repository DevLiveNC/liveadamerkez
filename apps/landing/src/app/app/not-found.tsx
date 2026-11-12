import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { EmptyState } from "../../components/app/EmptyState";

/** /app altında bulunmayan rota: kabuk içinde cam yüzey, çıkış kapısı keşif. */
export default function AppNotFound() {
  return (
    <main id="icerik" className="am-main am-ui-main">
      <div className="atla-not-found atla-glass atla-glass--peach">
        <p className="atla-not-found__code" aria-hidden="true">
          404
        </p>
        <EmptyState
          kind="hata"
          action={
            <Link className="am-btn am-btn--primary" href="/app">
              {app.discover}
            </Link>
          }
        />
      </div>
    </main>
  );
}
