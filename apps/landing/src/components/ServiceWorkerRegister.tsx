"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAppPath } from "@ada-merkez/shared";
import { unregisterLegacyAppServiceWorkers } from "../lib/pwa";

export function ServiceWorkerRegister() {
  const pathname = usePathname() ?? "/";
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    const register = isAppPath(pathname)
      ? navigator.serviceWorker.register("/app/sw.js", { scope: "/app" })
      : navigator.serviceWorker.register("/sw.js", { scope: "/" });
    void register.then((active) => unregisterLegacyAppServiceWorkers(active));
  }, [pathname]);
  return null;
}
