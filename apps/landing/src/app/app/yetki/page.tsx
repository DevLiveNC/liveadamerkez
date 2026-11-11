import Link from "next/link";
import { app } from "@ada-merkez/copy";
import { EmptyState } from "../../../components/app/EmptyState";

export default function YetkiPage() {
  return (
    <>
      <header className="am-head">
        <h1>{app.forbiddenTitle}</h1>
      </header>
      <EmptyState kind="hata" />
      <p className="am-note">{app.forbiddenBody}</p>
      <p>
        <Link className="btn btn-coral" href="/app">
          {app.discover}
        </Link>
      </p>
    </>
  );
}
