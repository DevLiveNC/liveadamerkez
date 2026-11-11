"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { app } from "@ada-merkez/copy";

export function FavoriteToggle({
  businessId,
  initial,
}: {
  businessId: string;
  initial: boolean;
}) {
  const router = useRouter();
  const [on, setOn] = useState(initial);
  const [busy, setBusy] = useState(false);

  async function toggle() {
    setBusy(true);
    try {
      const res = await fetch(on ? `/app/api/favoriler/${businessId}` : "/app/api/favoriler", {
        method: on ? "DELETE" : "POST",
        headers: on ? undefined : { "content-type": "application/json" },
        body: on ? undefined : JSON.stringify({ businessId }),
      });
      if (!res.ok) return;
      setOn(!on);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <button className="btn btn-ghost" type="button" onClick={() => void toggle()} disabled={busy} aria-pressed={on}>
      {on ? app.removeFavorite : app.addFavorite}
    </button>
  );
}
