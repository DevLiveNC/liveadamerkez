"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { addToHome, install } from "@ada-merkez/copy";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function AppInstallSheet() {
  const pathname = usePathname() ?? "/app";
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
      if (pathname === "/app") setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (isIos && pathname === "/app" && !sessionStorage.getItem("am_app_install")) {
      setHidden(false);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, [pathname]);

  if (hidden || pathname !== "/app") return null;
  if (!deferred && !ios) return null;

  return (
    <div className="am-pwa-sheet" role="dialog" aria-labelledby="app-install-title">
      <div className="am-pwa-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/app/icons/icon-192.png" alt="" width={56} height={56} />
        <div>
          <h2 id="app-install-title" className="t-h3" style={{ fontSize: 18 }}>
            {install.title}
          </h2>
          <p className="t-sm t-muted">{ios ? install.ios : addToHome.androidBody}</p>
        </div>
      </div>
      {deferred ? (
        <button
          className="btn btn-coral"
          type="button"
          style={{ width: "100%" }}
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
        className="btn btn-ghost"
        type="button"
        style={{ width: "100%", marginTop: 8 }}
        onClick={() => {
          setHidden(true);
          sessionStorage.setItem("am_app_install", "1");
        }}
      >
        {install.dismiss}
      </button>
    </div>
  );
}
