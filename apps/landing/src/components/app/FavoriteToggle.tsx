"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { app } from "@ada-merkez/copy";
import { UiIcon } from "@ada-merkez/ui";

export function FavoriteToggle({
  businessId,
  initial,
  icon = false,
}: {
  businessId: string;
  initial: boolean;
  icon?: boolean;
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
    <button
      className={icon ? `am-icon-btn am-icon-btn--light${on ? " is-on" : ""}` : "btn btn-ghost"}
      type="button"
      onClick={() => void toggle()}
      disabled={busy}
      aria-pressed={on}
      aria-label={on ? app.removeFavorite : app.addFavorite}
    >
      {icon ? <UiIcon name="heart" /> : on ? app.removeFavorite : app.addFavorite}
    </button>
  );
}
