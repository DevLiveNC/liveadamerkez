"use client";

import { useRouter } from "next/navigation";
import { app } from "@ada-merkez/copy";

export function CikisButton() {
  const router = useRouter();
  return (
    <button
      className="btn btn-ghost"
      type="button"
      onClick={async () => {
        await fetch("/app/api/oturum", { method: "DELETE" });
        router.replace("/app");
        router.refresh();
      }}
    >
      {app.signOut}
    </button>
  );
}
