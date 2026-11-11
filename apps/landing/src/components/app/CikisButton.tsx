"use client";

import { useRouter } from "next/navigation";
import { app } from "@ada-merkez/copy";
import { clearAppCaches } from "../../lib/clear-app-caches";

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
