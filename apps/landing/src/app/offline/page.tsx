import Link from "next/link";
import { offline } from "@ada-merkez/copy";

export default function OfflinePage() {
  return (
    <main id="icerik" className="legal-page wrap">
      <h1>{offline.title}</h1>
      <p>{offline.body}</p>
      <p>
        <Link className="btn btn-coral" href="/">
          {offline.retry}
        </Link>
      </p>
    </main>
  );
}
