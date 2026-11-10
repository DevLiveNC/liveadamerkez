import Link from "next/link";

export default function NotFound() {
  return (
    <main id="icerik" className="legal-page wrap">
      <h1>Sayfa bulunamadı</h1>
      <p className="t-lede">Bu QR veya yol tanınmıyor. Ana sayfadan devam edebilirsiniz.</p>
      <p>
        <Link className="btn btn-coral" href="/">
          Ana sayfa
        </Link>
      </p>
    </main>
  );
}
