"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { addToHome, install, panel, ui } from "@ada-merkez/copy";
import { BottomSheet } from "@ada-merkez/ui";
import { isStandalone } from "../../lib/panel-api";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function AppInstallSheet() {
  const pathname = usePathname() ?? "/app";
  const pathRef = useRef(pathname);
  pathRef.current = pathname;
  const deferredRef = useRef<BeforeInstallPromptEvent | null>(null);
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [ios, setIos] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    // iPadOS may identify as Macintosh; touch points distinguish it.
    const isIos =
      /iphone|ipad|ipod/i.test(navigator.userAgent) ||
      (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);
    setIos(isIos);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      const prompt = event as BeforeInstallPromptEvent;
      deferredRef.current = prompt;
      setDeferred(prompt);
      let dismissed = false;
      try {
        dismissed = Boolean(sessionStorage.getItem("am_app_install"));
      } catch {
        /* storage may be unavailable */
      }
      if (pathRef.current === "/app" && !dismissed) setOpen(true);
    };
    const onRequest = () => {
      setError(null);
      setOpen(true);
    };
    const onInstalled = () => {
      deferredRef.current = null;
      setDeferred(null);
      setOpen(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("am:install-request", onRequest);
    window.addEventListener("appinstalled", onInstalled);
    let dismissed = false;
    try {
      dismissed = Boolean(sessionStorage.getItem("am_app_install"));
    } catch {
      /* storage may be unavailable */
    }
    if (isIos && pathRef.current === "/app" && !dismissed) setOpen(true);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("am:install-request", onRequest);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  function close() {
    if (busy) return;
    setOpen(false);
    try {
      sessionStorage.setItem("am_app_install", "1");
    } catch {
      /* storage may be unavailable */
    }
  }
  async function promptInstall() {
    const prompt = deferredRef.current;
    if (!prompt || busy) return;
    setBusy(true);
    setError(null);
    try {
      await prompt.prompt();
      await prompt.userChoice;
      deferredRef.current = null;
      setDeferred(null);
      setOpen(false);
    } catch {
      setError(panel.installError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet
      open={open}
      onClose={close}
      title={install.title}
      closeLabel={ui.close}
      className="am-pwa-sheet"
    >
      <div className="am-pwa-row">
        {/* eslint-disable-next-line @next/next/no-img-element -- fixed-size PWA icon */}
        <img src="/app/icons/icon-192.png" alt="" width={56} height={56} />
        <div>
          <h3 className="t-h3">{install.title}</h3>
          <p className="t-sm t-muted">
            {deferred
              ? addToHome.androidBody
              : ios
                ? install.ios
                : panel.installUnsupported}
          </p>
        </div>
      </div>
      {error ? (
        <p className="pn-inline-error" role="alert">
          {error}
        </p>
      ) : null}
      {deferred ? (
        <button
          className="am-btn am-btn--primary am-btn--block"
          type="button"
          disabled={busy}
          onClick={() => {
            void promptInstall();
          }}
        >
          {busy ? panel.sending : install.cta}
        </button>
      ) : null}
      <button
        className="am-btn am-btn--ghost am-btn--block mt-3"
        type="button"
        disabled={busy}
        onClick={close}
      >
        {install.dismiss}
      </button>
    </BottomSheet>
  );
}
