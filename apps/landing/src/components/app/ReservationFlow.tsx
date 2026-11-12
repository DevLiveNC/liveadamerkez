"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@ada-merkez/ui";
import {
  ReservationSheet,
  type SheetService,
  type SheetSlot,
} from "./ReservationSheet";
import { setNavDirection } from "../../lib/app-nav";
import type { NicosiaDay } from "../../lib/nicosia-days";

/**
 * Rezervasyon sheet'i URL ile senkron çalışır:
 * - açılış yeni geçmiş girişidir (donanım/tarayıcı geri = sheet'i kapat),
 * - doğrudan `?rezervasyon=1` girişinde ekstra geçmiş yazılmaz,
 * - kapanış tek yol: kapat düğmesi, scrim, Escape veya geri tuşu.
 */
export function ReservationFlow({
  businessId,
  businessName,
  sample,
  signedIn,
  canSubmit,
  services,
  days,
  slotsByDate,
  detailPath,
  initialOpen,
  bookLabel,
}: {
  businessId: string;
  businessName: string;
  sample: boolean;
  signedIn: boolean;
  canSubmit: boolean;
  services: SheetService[];
  days: NicosiaDay[];
  slotsByDate: Record<string, SheetSlot[]>;
  detailPath: string;
  initialOpen: boolean;
  bookLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(initialOpen);
  const pushed = useRef(false);

  /* Tarayıcı geri tuşuyla URL temizlendiğinde sheet de kapanır. */
  useEffect(() => {
    if (initialOpen) return;
    pushed.current = false;
    setOpen(false);
  }, [initialOpen]);

  const close = useCallback(() => {
    setOpen(false);
    setNavDirection("back");
    if (pushed.current) {
      pushed.current = false;
      router.back();
      return;
    }
    router.replace(detailPath, { scroll: false });
  }, [detailPath, router]);

  function openSheet() {
    setOpen(true);
    pushed.current = true;
    router.push(`${detailPath}?rezervasyon=1`, { scroll: false });
  }

  return (
    <>
      <div aria-hidden="true" style={{ height: 88 }} />
      <div className="am-cta-bar">
        <Button
          variant="accent"
          block
          type="button"
          onClick={() => {
            setNavDirection("forward");
            openSheet();
          }}
        >
          {bookLabel}
        </Button>
      </div>
      <ReservationSheet
        open={open}
        onClose={close}
        businessId={businessId}
        businessName={businessName}
        sample={sample}
        signedIn={signedIn}
        canSubmit={canSubmit}
        services={services}
        days={days}
        slotsByDate={slotsByDate}
        closeHref={detailPath}
      />
    </>
  );
}
