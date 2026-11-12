import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { EmptyState } from "../../../components/app/EmptyState";

/** Rol uyuşmazlığı ekranı. Tek görünür başlık, tek çıkış yolu:
 *  alt gezinme aynı anda iki "geçerli sayfa" göstermez. */
export default function YetkiPage() {
  return (
    <>
      <h1 className="visually-hidden">{app.forbiddenTitle}</h1>
      <div className="atla-glass atla-glass--peach" style={{ marginTop: 16, padding: "20px 16px" }}>
        <EmptyState
          kind="hata"
          title={app.forbiddenTitle}
          body={app.forbiddenBody}
          action={
            <Link className="am-btn am-btn--primary" href="/app">
              {app.discover}
            </Link>
          }
        />
      </div>
    </>
  );
}
