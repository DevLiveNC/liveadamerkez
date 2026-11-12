import { notFound } from "next/navigation";
import { app, legal } from "@ada-merkez/copy";
import { AppHeader } from "@ada-merkez/ui";
import { BackButton } from "../../../../components/app/BackButton";

/** Uygulama içi yasal metinler.
 *  Pazarlama sitesindeki `/yasal/*` sayfaları başlıklı/alt menülü kabuğa
 *  götürür; PWA'da bu, uygulamadan çıkmak gibi hissettiriyordu. Burada aynı
 *  metin uygulama kabuğunda, tek geri düğmesiyle gösterilir. */
const DOCS = {
  aydinlatma: legal.aydinlatmaTitle,
  gizlilik: legal.gizlilikTitle,
  kvkk: legal.kvkkTitle,
} as const;

type DocKey = keyof typeof DOCS;

export default async function AppLegalPage({ params }: { params: Promise<{ tur: string }> }) {
  const { tur } = await params;
  if (!(tur in DOCS)) notFound();
  const title = DOCS[tur as DocKey];

  return (
    <main id="icerik" className="am-main am-ui-main">
      <AppHeader title={title} leading={<BackButton label={app.back} fallback="/app/hesap" />} />
      <div className="atla-glass atla-glass--peach am-legal">
        <p className="notice">{legal.pendingTitle}</p>
        <p>{legal.pendingBody}</p>
        <p>{legal.retentionNote}</p>
      </div>
    </main>
  );
}
