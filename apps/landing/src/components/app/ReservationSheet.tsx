"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { app, ui } from "@ada-merkez/copy";
import { loginUrl } from "@ada-merkez/shared";
import { Badge, BottomSheet, Button } from "@ada-merkez/ui";
import { setNavDirection } from "../../lib/app-nav";
import type { NicosiaDay } from "../../lib/nicosia-days";

export type SheetService = { id: string; name: string; durationMinutes?: number };
export type SheetSlot = { startsAt: string; label: string; serviceId: string | null };

export function ReservationSheet({
  open,
  onClose,
  businessId,
  businessName,
  sample,
  signedIn,
  canSubmit,
  services,
  days,
  slotsByDate,
  closeHref,
}: {
  open: boolean;
  onClose: () => void;
  businessId: string;
  businessName: string;
  sample: boolean;
  signedIn: boolean;
  canSubmit: boolean;
  services: SheetService[];
  days: NicosiaDay[];
  slotsByDate: Record<string, SheetSlot[]>;
  closeHref: string;
}) {
  const router = useRouter();
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [dateKey, setDateKey] = useState(days[1]?.key ?? days[0]?.key ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const service = services.find((item) => item.id === serviceId) ?? services[0];
  const day = days.find((item) => item.key === dateKey) ?? days[0];
  const slots = useMemo(() => (dateKey ? (slotsByDate[dateKey] ?? []) : []), [dateKey, slotsByDate]);
  const slot = slots.find((item) => item.startsAt === startsAt) ?? slots[0];
  const loginHref = loginUrl({ next: closeHref.includes("?") ? closeHref : `${closeHref}?rezervasyon=1` });

  const summary = [service?.name, day ? `${day.dow} ${day.num}` : null, slot?.label].filter(Boolean).join(" · ");

  async function send() {
    setError(null);
    if (!canSubmit || !slot) {
      setError(app.noSlots);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/app/api/randevular", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          businessId,
          startsAt: slot.startsAt,
          serviceId: service && service.id !== "ornek" ? service.id : undefined,
        }),
      });
      const body = (await res.json().catch(() => null)) as
        | { ok?: boolean; message?: string; booking?: { id?: string } }
        | null;
      if (!res.ok || !body?.ok || !body.booking?.id) {
        setError(body?.message ?? app.authUnavailable);
        return;
      }
      setNavDirection("forward");
      router.push(`/app/randevular/${body.booking.id}`);
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title={app.bookingTitle} closeLabel={ui.close}>
      <p className="am-muted" style={{ fontSize: 13, marginBottom: 12 }}>
        {businessName}
        {sample ? (
          <>
            {" · "}
            <Badge tone="sample">{app.example}</Badge>
          </>
        ) : null}
      </p>
      <p className="am-kicker">{app.bookingService}</p>
      {services.length ? (
        services.map((item) => (
          <button
            key={item.id}
            className={item.id === (service?.id ?? "") ? "am-svc is-on mt-2" : "am-svc mt-2"}
            type="button"
            onClick={() => setServiceId(item.id)}
          >
            <span>
              <h3>{item.name}</h3>
              <p>{app.priceAsk}</p>
            </span>
            {item.durationMinutes ? (
              <span className="am-svc-dur">
                {item.durationMinutes} {app.minutes}
              </span>
            ) : null}
          </button>
        ))
      ) : (
        <p className="am-note">{app.priceAsk}</p>
      )}
      <p className="am-kicker mt-4">{app.bookingDate}</p>
      <div className="am-dates">
        {days.map((item) => (
          <button
            key={item.key}
            className={item.key === dateKey ? "am-date is-on" : "am-date"}
            type="button"
            aria-current={item.key === dateKey ? "date" : undefined}
            onClick={() => {
              setDateKey(item.key);
              setStartsAt("");
            }}
          >
            <span className="dow">{item.dow}</span>
            <span className="num">{item.num}</span>
          </button>
        ))}
      </div>
      <p className="am-kicker">{app.bookingSlots}</p>
      <div className="am-slots mt-2">
        {slots.length ? (
          slots.map((item) => (
            <button
              key={item.startsAt}
              className={item.startsAt === (slot?.startsAt ?? "") ? "am-slot is-on" : "am-slot"}
              type="button"
              onClick={() => setStartsAt(item.startsAt)}
            >
              {item.label}
            </button>
          ))
        ) : (
          <p className="am-note">{app.noSlots}</p>
        )}
      </div>
      <div className="am-summary">
        <strong>{summary}</strong>
        <p className="am-muted mt-2">{app.bookingPendingNote}</p>
      </div>
      {error ? (
        <p className="am-error" role="alert">
          {error}
        </p>
      ) : null}
      {signedIn ? (
        <Button variant="accent" block type="button" disabled={busy || !slot || !canSubmit} aria-busy={busy} onClick={() => void send()}>
          {app.bookingSend}
        </Button>
      ) : (
        <Link className="am-btn am-btn--accent am-btn--block" href={loginHref}>
          {app.bookingSend}
        </Link>
      )}
    </BottomSheet>
  );
}
