"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CikisButton } from "./CikisButton";
import { ProfileNameForm } from "./ProfileNameForm";

const TR = {
  title: "Hesap",
  phoneVerified: "Telefon doğrulandı",
  language: "Dil",
  languageHint: "Uygulama dili",
  currency: "Gösterim",
  currencyHint: "Yalnız biçim; fiyat yazılmaz.",
  notifications: "Bildirimler",
  addToHome: "Ana ekrana ekle",
  whatsapp: "WhatsApp ile yaz",
  legal: "Aydınlatma ve koşullar",
  soon: "Yakında",
} as const;

const EN = {
  title: "Account",
  phoneVerified: "Phone verified",
  language: "Language",
  languageHint: "App language",
  currency: "Display",
  currencyHint: "Display only; prices are not shown.",
  notifications: "Notifications",
  addToHome: "Add to Home Screen",
  whatsapp: "Message on WhatsApp",
  legal: "Privacy and terms",
  soon: "Soon",
} as const;

export function AccountPanel({ name, phone }: { name: string; phone: string }) {
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const t = lang === "en" ? EN : TR;
  const initial = (name || "?").slice(0, 1).toLocaleUpperCase("tr-TR");

  useEffect(() => {
    document.documentElement.lang = lang === "en" ? "en" : "tr";
    document.cookie = `am_lang=${lang}; path=/; max-age=31536000; samesite=lax`;
  }, [lang]);

  return (
    <>
      <header className="am-header am-header--blur">
        <h1 className="am-header-title">{t.title}</h1>
      </header>
      <div className="am-profile-top">
        <div className="am-avatar am-avatar--lg" aria-hidden="true">
          {initial}
        </div>
        <div>
          <h1>{name}</h1>
          <p>{t.phoneVerified}</p>
          <p className="am-muted">{phone}</p>
        </div>
      </div>
      <div className="am-card-block">
        <div className="am-row">
          <div className="am-row-body">
            <h3>{t.language}</h3>
            <p>{t.languageHint}</p>
          </div>
          <div className="am-seg" style={{ width: 148, flex: "none" }} role="group" aria-label={t.language}>
            <button type="button" className={lang === "tr" ? "is-on" : undefined} lang="tr" aria-pressed={lang === "tr"} onClick={() => setLang("tr")}>
              TR
            </button>
            <button type="button" className={lang === "en" ? "is-on" : undefined} lang="en" aria-pressed={lang === "en"} onClick={() => setLang("en")}>
              EN
            </button>
          </div>
        </div>
        <div className="am-row am-row--static">
          <span className="am-row-body">
            <h3>{t.currency}</h3>
            <p>{t.currencyHint}</p>
          </span>
          <span className="am-muted">{t.soon}</span>
        </div>
      </div>
      <div className="am-card-block">
        <Link className="am-row" href="/app/randevular#bildirimler">
          <span className="am-row-body">
            <h3>{t.notifications}</h3>
          </span>
          <span className="am-row-chevron" aria-hidden="true">
            ›
          </span>
        </Link>
        <button
          className="am-row am-row--button"
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("am:install-request"));
          }}
        >
          <span className="am-row-body">
            <h3>{t.addToHome}</h3>
          </span>
          <span className="am-row-chevron" aria-hidden="true">
            ›
          </span>
        </button>
        <div className="am-row am-row--static">
          <span className="am-row-body">
            <h3>{t.whatsapp}</h3>
          </span>
          <span className="am-muted">{t.soon}</span>
        </div>
      </div>
      <div className="am-card-block">
        <Link className="am-row" href="/app/yasal/aydinlatma">
          <span className="am-row-body">
            <h3>{t.legal}</h3>
          </span>
          <span className="am-row-chevron" aria-hidden="true">
            ›
          </span>
        </Link>
      </div>
      <ProfileNameForm initial={name} />
      <CikisButton />
    </>
  );
}
