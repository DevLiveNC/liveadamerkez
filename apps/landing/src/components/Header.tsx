"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const variant =
    pathname.startsWith("/basvuru") || pathname.startsWith("/bekleme") || pathname.startsWith("/q")
      ? "form"
      : "landing";

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    queueMicrotask(() => menuBtnRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const first = panelRef.current?.querySelector<HTMLElement>("a, button");
    first?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
      }
    };
    const onPointer = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (headerRef.current?.contains(target)) return;
      setMenuOpen(false);
      const el = target instanceof Element ? target : null;
      if (el?.closest("a, button, input, select, textarea")) return;
      window.setTimeout(() => menuBtnRef.current?.focus(), 0);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [menuOpen, closeMenu]);

  return (
    <>
      {variant === "landing" ? <UtilBar /> : null}
      <header className="nav" ref={headerRef}>
        <div className="wrap nav-in am-land-nav">
          <Link href="/" aria-label={nav.homeAria}>
            <Logo className="logo-h" height={32} />
          </Link>
          {variant === "form" ? (
            <nav className="nav-links form-nav-links" aria-label="Formlar">
              <Link href="/bekleme-listesi">{nav.waitlist}</Link>
              <Link href="/basvuru">{nav.apply}</Link>
            </nav>
          ) : (
            <nav className="nav-links am-land-links desk-only" aria-label={nav.sections}>
              {LANDING_LINKS.map((item) => (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          )}
          {variant === "landing" ? (
            <div className="am-land-actions">
              <div className="seg lang nav-lang desk-only" role="group" aria-label={nav.lang}>
                <button type="button" aria-pressed="true">
                  TR
                </button>
                <button type="button" disabled aria-disabled="true" aria-label={nav.enLabel} title={nav.enSoon}>
                  EN
                  <span className="lang-soon">{nav.enSoon}</span>
                </button>
              </div>
              <Link className="am-btn am-btn--ghost am-btn--sm desk-only" href="/app/giris">
                {cta.signIn}
              </Link>
              <Link className="am-btn am-btn--primary am-btn--sm desk-only" href="/app">
                {cta.openApp}
              </Link>
              <Link className="am-btn am-btn--ghost am-btn--sm desk-only" href="/app/giris?rol=isletme&kayit=1">
                {cta.business}
              </Link>
              <button
                ref={menuBtnRef}
                className="am-icon-btn am-land-mob-nav"
                type="button"
                aria-label={nav.menu}
                aria-expanded={menuOpen}
                aria-controls="am-land-menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                <svg className="am-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
              </button>
            </div>
          ) : null}
        </div>
        {variant === "landing" ? (
          <div
            id="am-land-menu"
            ref={panelRef}
            className={`am-land-panel${menuOpen ? " is-open" : ""}`}
            hidden={!menuOpen}
          >
            {LANDING_LINKS.map((item) => (
              <Link key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </Link>
            ))}
            <Link href="/app/giris" onClick={closeMenu}>
              {cta.signIn}
            </Link>
            <Link href="/app" onClick={closeMenu}>
              {cta.openApp}
            </Link>
            <Link href="/app/giris?rol=isletme&kayit=1" onClick={closeMenu}>
              {cta.business}
            </Link>
          </div>
        ) : null}
      </header>
    </>
  );
}
