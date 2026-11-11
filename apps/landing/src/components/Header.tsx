"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cta, nav } from "@ada-merkez/copy";
import { Logo } from "./Logo";
import { UtilBar } from "./UtilBar";

const LANDING_LINKS = [
  { href: "/#kategoriler", label: nav.discover },
  { href: "/#nasil", label: nav.how },
  { href: "/#whatsapp", label: nav.whatsapp },
  { href: "/#isletmeler", label: nav.business },
  { href: "/#pilot", label: nav.pilot },
  { href: "/#sss", label: nav.faq },
] as const;

export function Header() {
  const pathname = usePathname();
  const variant =
    pathname.startsWith("/basvuru") || pathname.startsWith("/bekleme") || pathname.startsWith("/q")
      ? "form"
      : "landing";

  return (
    <>
      {variant === "landing" ? <UtilBar /> : null}
      <header className="nav">
        <div className="wrap nav-in">
          <Link href="/" aria-label={nav.homeAria}>
            <Logo className="logo-h" height={32} />
          </Link>
          {variant === "form" ? (
            <nav className="nav-links form-nav-links" aria-label="Formlar">
              <Link href="/bekleme-listesi">{nav.waitlist}</Link>
              <Link href="/basvuru">{nav.apply}</Link>
            </nav>
          ) : (
            <nav className="nav-links desk-only" aria-label={nav.sections}>
              {LANDING_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          {variant === "landing" ? (
            <div className="seg lang nav-lang" role="group" aria-label={nav.lang}>
              <button type="button" aria-pressed="true">
                TR
              </button>
              <button type="button" disabled aria-disabled="true" aria-label={nav.enLabel} title={nav.enSoon}>
                EN
                <span className="lang-soon">{nav.enSoon}</span>
              </button>
            </div>
          ) : null}
          {variant === "landing" ? (
            <div className="nav-cta">
              <Link className="btn btn-ghost btn-sm" href="/app">
                {cta.openApp}
              </Link>
              <Link className="btn btn-coral btn-sm" href="/app/giris">
                {cta.signIn}
              </Link>
            </div>
          ) : null}
        </div>
      </header>
    </>
  );
}
