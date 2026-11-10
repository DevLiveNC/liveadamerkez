"use client";

import { useEffect } from "react";

export function AppSwRegister() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    void navigator.serviceWorker.register("/app/sw.js", { scope: "/app/" });
  }, []);
  return null;
}
