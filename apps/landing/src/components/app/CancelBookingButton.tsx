"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { app } from "@ada-merkez/copy";

export function CancelBookingButton({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <button
      className="btn btn-ghost"
      type="button"
      disabled={busy}
      onClick={async () => {
        setBusy(true);
        try {
          const res = await fetch(`/app/api/randevular/${bookingId}`, { method: "DELETE" });
          if (res.ok) router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      {app.cancelBooking}
    </button>
  );
}
