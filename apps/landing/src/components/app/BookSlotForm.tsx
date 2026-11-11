"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { app } from "@ada-merkez/copy";

export function BookSlotForm({
  businessId,
  slots,
}: {
  businessId: string;
  slots: { startsAt: string; label: string; serviceId: string | null }[];
}) {
  const router = useRouter();
  const [startsAt, setStartsAt] = useState(slots[0]?.startsAt ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!slots.length) return null;

  async function book() {
    setError(null);
    setBusy(true);
    try {
      const slot = slots.find((item) => item.startsAt === startsAt) ?? slots[0];
      if (!slot) {
        setError(app.noSlots);
        return;
      }
      const res = await fetch("/app/api/randevular", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId,
          startsAt: slot.startsAt,
          serviceId: slot.serviceId ?? undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!res.ok || !body?.ok) {
        setError(body?.message ?? app.authUnavailable);
        return;
      }
      router.push("/app/randevular");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      className="am-auth"
      onSubmit={(event) => {
        event.preventDefault();
        void book();
      }}
    >
      <div className="am-field">
        <label htmlFor="slot">{app.slotsTitle}</label>
        <select id="slot" value={startsAt} onChange={(event) => setStartsAt(event.target.value)}>
          {slots.map((slot) => (
            <option key={slot.startsAt} value={slot.startsAt}>
              {slot.label}
            </option>
          ))}
        </select>
      </div>
      {error ? (
        <p className="am-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="btn btn-coral" type="submit" disabled={busy} aria-busy={busy}>
        {app.book}
      </button>
    </form>
  );
}
