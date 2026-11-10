import { notFound } from "next/navigation";
import { qrPage, waitlist } from "@ada-merkez/copy";
import { resolveQrPath, type TouchPoint } from "@ada-merkez/shared";
import { WaitlistForm } from "../../../components/WaitlistForm";
import { QrCapture } from "./qr-capture";

const CITY_LABEL: Record<string, string> = {
  lefkosa: "Lefkoşa",
  girne: "Girne",
  magusa: "Mağusa",
};

async function lookupBusinessName(id: string): Promise<string | null> {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) return null;
  try {
    const res = await fetch(`${base}/v1/public/businesses/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const body = (await res.json()) as { business?: { name?: string } };
    return body.business?.name ?? null;
  } catch {
    return null;
  }
}

export default async function QrPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const resolved = resolveQrPath(slug);
  if (!resolved) notFound();

  const businessName = resolved.businessId ? await lookupBusinessName(resolved.businessId) : null;
  const locationLabel = resolved.location ? CITY_LABEL[resolved.location] : null;

  const injected: TouchPoint = {
    source: resolved.channel.source,
    medium: resolved.channel.medium,
    campaign: resolved.channel.campaign,
    content: resolved.channel.content,
    term: resolved.location ?? null,
    ref: null,
    businessId: resolved.businessId ?? null,
    capturedAt: new Date().toISOString(),
  };

  return (
    <main id="icerik" className="qr-hero form-hero">
      <QrCapture injected={injected} />
      <div className="wrap" style={{ marginBottom: 32 }}>
        <p className="t-label">
          {qrPage.kicker} · {resolved.channel.label}
          {locationLabel ? ` · ${locationLabel}` : ""}
        </p>
        <h1 className="t-display">{waitlist.heading}</h1>
        <p className="t-lede">{qrPage.lead}</p>
        {businessName ? <p className="t-sm">{businessName}</p> : null}
      </div>
      <WaitlistForm />
    </main>
  );
}
