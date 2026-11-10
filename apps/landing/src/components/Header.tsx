"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { hero, nav, placeholders, site } from "@ada-merkez/copy";
import { Logo } from "./Logo";

export function Header() {
  const pathname = usePathname();
  const variant = pathname.startsWith("/basvuru") || pathname.startsWith("/bekleme") || pathname.startsWith("/q")
    ? "form"
    : "landing";
  const [open, setOpen] = useState(false);

  return (
    <header className="nav">
      <div className="wrap nav-in">
        <Link href="/" aria-label={`${site.name} ana sayfa`}>
          <Logo height={32} />
        </Link>
        {variant === "form" ? (
          <nav className="nav-links form-nav-links" aria-label="Formlar">
            <Link href="/bekleme-listesi">{nav.waitlist}</Link>
            <Link href="/basvuru">{nav.apply}</Link>
          </nav>
        ) : (
          <nav className="nav-links desk-only" aria-label="Bölümler">
            <Link href="/#nasil">{nav.how}</Link>
            <Link href="/#whatsapp">{nav.whatsapp}</Link>
            <Link href="/#isletmeler">{nav.business}</Link>
            <Link href="/#sonra">{nav.later}</Link>
          </nav>
        )}
        <span className="nav-geo desk-only">{site.regionLine}</span>
        {variant === "landing" ? (
          <div className="nav-cta">
            <Link className="btn btn-ghost btn-sm desk-only" href="/basvuru">
              {hero.secondaryCta}
            </Link>
            <Link className="btn btn-coral btn-sm" href="/#bekleme-listesi">
              {placeholders.cta}
            </Link>
          </div>
        ) : null}
        {variant === "landing" ? (
          <button
            className="nav-menu"
            type="button"
            aria-label={nav.menu}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 5h14M3 10h14M3 15h14" />
            </svg>
          </button>
        ) : null}
      </div>
      {open ? (
        <div className="nav-panel is-open">
          <Link href="/#nasil" onClick={() => setOpen(false)}>
            {nav.how}
          </Link>
          <Link href="/#whatsapp" onClick={() => setOpen(false)}>
            {nav.whatsapp}
          </Link>
          <Link href="/#isletmeler" onClick={() => setOpen(false)}>
            {nav.business}
          </Link>
          <Link href="/bekleme-listesi" onClick={() => setOpen(false)}>
            {nav.waitlist}
          </Link>
          <Link href="/basvuru" onClick={() => setOpen(false)}>
            {nav.apply}
          </Link>
        </div>
      ) : null}
    </header>
  );
}
