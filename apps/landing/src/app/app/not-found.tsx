"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { EmptyState } from "../../components/app/EmptyState";

/**
 * /app altında bulunmayan rota: kabuk içinde cam yüzey, çıkış kapısı keşif.
 *
 * Kabuk (AppChrome) müşteri ekranlarında `main#icerik` öğesini kendisi
 * sağlıyor. Burada ikinci bir `main` üretmek çift landmark ve çift `id`
 * demek olurdu; işletme/yonetim kabuklarında ise içerik ana öğesi yok.
 * Bu yüzden pathname'e göre main/div seçilir.
 */
export default function AppNotFound() {
  const pathname = usePathname() ?? "";
  const panel =
    pathname.startsWith("/app/isletme") ||
    pathname.startsWith("/app/yonetim") ||
    pathname.startsWith("/app/yonetici");
  const Wrapper = panel ? "main" : "div";

  return (
    <Wrapper id={panel ? "icerik" : undefined} className="am-main am-ui-main">
      <div className="atla-not-found atla-glass atla-glass--peach">
        <p className="atla-not-found__code" aria-hidden="true">
          404
        </p>
        <EmptyState
          kind="hata"
          title={app.pageNotFound}
          body={app.pageNotFoundBody}
          action={
            <Link className="am-btn am-btn--primary" href="/app">
              {app.discover}
            </Link>
          }
        />
      </div>
    </Wrapper>
  );
}
