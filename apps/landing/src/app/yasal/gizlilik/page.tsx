import { legal } from "@ada-merkez/copy";

export const metadata = {
  title: `${legal.gizlilikTitle} — Ada Merkez`,
  description: legal.pendingBody,
};

export default function Page() {
  return (
    <main id="icerik" className="legal-page wrap">
      <p className="notice">{legal.pendingTitle}</p>
      <h1>{legal.gizlilikTitle}</h1>
      <p>{legal.pendingBody}</p>
      <p>{legal.retentionNote}</p>
    </main>
  );
}
