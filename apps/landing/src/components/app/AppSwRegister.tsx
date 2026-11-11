"use client";

import { useEffect } from "react";
import { unregisterLegacyAppServiceWorkers } from "../../lib/pwa";

export function AppSwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker
      .register("/app/sw.js", { scope: "/app", updateViaCache: "none" })
      .then((active) => unregisterLegacyAppServiceWorkers(active));
  }, []);
  return null;
}
