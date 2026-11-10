import Link from "next/link";
import { footer, site } from "@ada-merkez/copy";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>{site.name}</strong>
          <div>{footer.companyLine}</div>
        </div>
        <nav className="footer-nav" aria-label="Yasal">
          <Link href="/yasal/aydinlatma">{footer.aydinlatma}</Link>
          <Link href="/yasal/gizlilik">{footer.gizlilik}</Link>
          <Link href="/yasal/kvkk">{footer.kvkk}</Link>
        </nav>
      </div>
    </footer>
  );
}
