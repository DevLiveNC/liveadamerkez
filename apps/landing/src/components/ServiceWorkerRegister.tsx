"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isAppPath } from "@ada-merkez/shared";

export function ServiceWorkerRegister() {
  const pathname = usePathname() ?? "/";
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    if (isAppPath(pathname)) {
      void navigator.serviceWorker.register("/app/sw.js", { scope: "/app" });
      return;
    }
    void navigator.serviceWorker.register("/sw.js", { scope: "/" });
  }, [pathname]);
  return null;
}
