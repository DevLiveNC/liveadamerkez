"use client";

import { useEffect, useState } from "react";
import { install } from "@ada-merkez/copy";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function InstallHint() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      ("standalone" in navigator && Boolean((navigator as Navigator & { standalone?: boolean }).standalone));
    if (standalone) {
      setHidden(true);
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIos(isIos);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden) return null;
  if (!deferred && !ios) return null;

  return (
    <div className="install-bar">
      <div className="shell install-inner">
        <p>
          <strong>{install.title}.</strong> {ios ? install.ios : install.body}
        </p>
        <div>
          {deferred ? (
            <button
              className="button button-primary"
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
          <button className="ghost" type="button" onClick={() => setHidden(true)}>
            {install.dismiss}
          </button>
        </div>
      </div>
    </div>
  );
}
