import Link from "next/link";
import { footer, site } from "@ada-merkez/copy";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot-in">
        <div>
          <Logo className="brand-logo is-sm" height={24} />
          <p>{footer.companyLine}</p>
          <p>
            {site.regionLine} · Saat dilimi {site.timezone}
          </p>
        </div>
        <nav aria-label="Yasal">
          <Link href="/yasal/aydinlatma">{footer.aydinlatma}</Link>
          <Link href="/yasal/gizlilik">{footer.gizlilik}</Link>
          <Link href="/yasal/kvkk">{footer.kvkk}</Link>
        </nav>
      </div>
    </footer>
  );
}
