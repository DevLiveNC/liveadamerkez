import Link from "next/link";
import { cta, nav, site } from "@ada-merkez/copy";

export function Header() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand-link" href="/" aria-label={site.name}>
          {/* SVG marka kilidi; next/image raster varsayımıyla gerekmez */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-yatay-acik.svg" alt={site.name} width={188} height={32} />
        </Link>
        <nav className="nav" aria-label="Ana">
          <a className="nav-hide" href="#kapsam">
            {nav.features}
          </a>
          <a className="nav-hide" href="#isletmeler">
            {nav.business}
          </a>
          <a className="nav-cta" href="#waitlist">
            {cta.customer}
          </a>
        </nav>
      </div>
    </header>
  );
}
