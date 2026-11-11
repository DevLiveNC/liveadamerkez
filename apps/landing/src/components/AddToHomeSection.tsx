"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { addToHome } from "@ada-merkez/copy";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function AddToHomeSection() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  return (
    <section className="section" id="ana-ekrana">
      <div className="wrap">
        <div className="section-intro">
          <div className="lead">
            <p className="t-label section-kicker">{addToHome.kicker}</p>
            <h2 className="t-h2">{addToHome.title}</h2>
          </div>
          <p className="t-lede">{addToHome.lede}</p>
        </div>
        <picture>
          <source
            media="(max-width: 700px)"
            type="image/webp"
            srcSet="/app/ana-ekrana-ekle/ana-ekrana-ekle-mobil.webp 390w, /app/ana-ekrana-ekle/ana-ekrana-ekle-mobil@2x.webp 780w"
            sizes="100vw"
          />
          <source
            media="(max-width: 700px)"
            srcSet="/app/ana-ekrana-ekle/ana-ekrana-ekle-mobil.png 390w, /app/ana-ekrana-ekle/ana-ekrana-ekle-mobil@2x.png 780w"
            sizes="100vw"
          />
          <source
            type="image/webp"
            srcSet="/app/ana-ekrana-ekle/ana-ekrana-ekle.webp 960w, /app/ana-ekrana-ekle/ana-ekrana-ekle@2x.webp 1920w"
            sizes="min(960px, 100vw)"
          />
          <img
            className="am-add-shot"
            src="/app/ana-ekrana-ekle/ana-ekrana-ekle.png"
            srcSet="/app/ana-ekrana-ekle/ana-ekrana-ekle.png 960w, /app/ana-ekrana-ekle/ana-ekrana-ekle@2x.png 1920w"
            sizes="(max-width: 700px) 390px, min(960px, 100vw)"
            width={960}
            height={640}
            alt={addToHome.shotAlt}
            loading="lazy"
            decoding="async"
          />
        </picture>
        <div className="am-add-grid">
          <div className="am-card">
            <h3 className="t-h3">{addToHome.iosTitle}</h3>
            <ol className="am-add-steps">
              <li>{addToHome.ios1}</li>
              <li>{addToHome.ios2}</li>
              <li>{addToHome.ios3}</li>
            </ol>
          </div>
          <div className="am-card">
            <h3 className="t-h3">{addToHome.androidTitle}</h3>
            <p className="t-sm">{addToHome.androidBody}</p>
            <p className="t-sm t-muted">{addToHome.androidFallback}</p>
          </div>
        </div>
        <div className="am-add-actions">
          {deferred ? (
            <button
              className="btn btn-coral"
              type="button"
              onClick={async () => {
                await deferred.prompt();
                setDeferred(null);
              }}
            >
              {addToHome.androidCta}
            </button>
          ) : (
            <Link className="btn btn-coral" href="/app">
              {addToHome.openApp}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
