"use client";

import { useState } from "react";
import { onboarding, ui } from "@ada-merkez/copy";
import { BottomSheet, Button } from "@ada-merkez/ui";

const KABUKI = [
  "/app/v3/maskot/kabuki-selam-512.png",
  "/app/v3/maskot/kabuki-goster-512.png",
  "/app/v3/maskot/kabuki-dusunen-512.png",
] as const;

export function AppOnboarding({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const current = onboarding.steps[step];
  const last = step === onboarding.steps.length - 1;

  return (
    <BottomSheet open onClose={onDone} title={onboarding.title} closeLabel={ui.close}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={KABUKI[step] ?? KABUKI[0]}
        alt=""
        width={160}
        height={160}
        style={{ width: 120, height: 120, margin: "0 auto 8px", display: "block", objectFit: "contain" }}
      />
      <p className="am-muted" style={{ textAlign: "center", margin: "0 0 8px", fontSize: 12 }}>
        {step + 1} / {onboarding.steps.length}
      </p>
      <h3 className="t-h3" style={{ textAlign: "center", margin: "0 0 8px" }}>
        {current?.title}
      </h3>
      <p className="am-muted" style={{ textAlign: "center", margin: "0 0 16px" }}>
        {current?.body}
      </p>
      <div style={{ display: "grid", gap: 8 }}>
        {last ? (
          <Button variant="coral" block onClick={onDone}>
            {onboarding.done}
          </Button>
        ) : (
          <Button variant="coral" block onClick={() => setStep((n) => n + 1)}>
            {onboarding.next}
          </Button>
        )}
        <Button variant="ghost" block onClick={onDone}>
          {onboarding.skip}
        </Button>
      </div>
    </BottomSheet>
  );
}
