"use client";

import { useRouter } from "next/navigation";
import { app } from "@ada-merkez/copy";

async function clearAppCaches(): Promise<void> {
  const dropAll = async () => {
    if (!("caches" in window)) return;
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  };
  if (!("serviceWorker" in navigator)) {
    await dropAll();
    return;
  }
  const reg = await navigator.serviceWorker.ready.catch(() => null);
  const worker = reg?.active ?? navigator.serviceWorker.controller;
  if (!worker) {
    await dropAll();
    return;
  }
  await new Promise<void>((resolve) => {
    const channel = new MessageChannel();
    const timer = window.setTimeout(resolve, 2000);
    channel.port1.onmessage = () => {
      window.clearTimeout(timer);
      resolve();
    };
    worker.postMessage({ type: "CLEAR_CACHES" }, [channel.port2]);
  });
}

export function CikisButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost"
      type="button"
      onClick={async () => {
        await fetch("/app/api/oturum", { method: "DELETE" });
        await clearAppCaches();
        router.replace("/app");
        router.refresh();
      }}
    >
      {app.signOut}
    </button>
  );
}
