"use client";

import { useEffect, useState } from "react";
import { install } from "@ada-merkez/copy";
import { ICON_SRC } from "./Logo";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) return;
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (isIos) {
      const shown = sessionStorage.getItem("am_install_hint");
      if (!shown) setHidden(false);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;
  if (!deferred && !ios) return null;

  return (
    <div className="install-sheet" role="dialog" aria-labelledby="install-title">
      <div className="wrap install-inner">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="install-mark" src={ICON_SRC} alt="" width={56} height={56} />
        <p id="install-title">
          <strong>{install.title}.</strong> {ios ? install.ios : install.body}
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {deferred ? (
            <button
              className="btn btn-coral btn-sm"
              type="button"
              onClick={async () => {
                await deferred.prompt();
                setDeferred(null);
                setHidden(true);
              }}
            >
              {install.cta}
            </button>
          ) : null}
          <button
            className="btn btn-ghost btn-sm"
            type="button"
            onClick={() => {
              setHidden(true);
              sessionStorage.setItem("am_install_hint", "1");
            }}
          >
            {install.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
