"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@ada-merkez/ui";
import {
  ReservationSheet,
  type SheetService,
  type SheetSlot,
} from "./ReservationSheet";
import type { NicosiaDay } from "../../lib/nicosia-days";

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

  function close() {
    setOpen(false);
    router.replace(detailPath, { scroll: false });
  }

  function openSheet() {
    setOpen(true);
    router.replace(`${detailPath}?rezervasyon=1`, { scroll: false });
  }

  return (
    <>
      <div aria-hidden="true" style={{ height: 88 }} />
      <div className="am-cta-bar">
        <Button variant="accent" block type="button" onClick={openSheet}>
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
