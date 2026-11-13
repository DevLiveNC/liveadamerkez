"use client";

import { useId, useState } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import { BottomSheet } from "@ada-merkez/ui";
import { patchBooking } from "../../lib/isletme-api";
import { nicosiaInputToUtc } from "../../lib/panel-workflow";
import { PanelFeedback } from "../panel/PanelKit";
import { useOnline, usePanelMutation } from "../panel/use-panel-data";

export function SuggestSlotButton({
  id,
  busy,
  onDone,
}: {
  id: string;
  busy: boolean;
  onDone: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const mutation = usePanelMutation();
  const online = useOnline();
  const fieldId = useId();
  const titleId = useId();
  const close = () => {
    if (!mutation.busy) setOpen(false);
  };
  async function send() {
    const date = nicosiaInputToUtc(value);
    if (!date || date.getTime() <= Date.now()) {
      mutation.setError(panel.suggestionFuture);
      return;
    }
    const ok = await mutation.run(async () => {
      await patchBooking(id, { suggestStartsAt: date.toISOString() });
    }, panel.suggestionSent);
    if (ok) {
      setOpen(false);
      setValue("");
      await onDone();
    }
  }
  return (
    <>
      <button
        className="am-btn am-btn--ghost am-btn--sm"
        type="button"
        disabled={busy || mutation.busy || !online}
        onClick={() => {
          mutation.setError(null);
          setOpen(true);
        }}
      >
        {isletmeApp.suggestSlot}
      </button>
      <BottomSheet
        open={open}
        onClose={close}
        title={isletmeApp.suggestSlot}
        titleId={titleId}
        closeLabel={panel.close}
        className="pn-confirm-sheet"
      >
        <div className="pn-field">
          <label htmlFor={fieldId}>{isletmeApp.suggestWhen}</label>
          <input
            id={fieldId}
            type="datetime-local"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={mutation.busy}
          />
          <small>{panel.suggestionZone}</small>
        </div>
        <PanelFeedback error={mutation.error} />
        <div className="pn-confirm-actions">
          <button
            type="button"
            className="am-btn am-btn--ghost"
            disabled={mutation.busy}
            onClick={close}
          >
            {panel.cancel}
          </button>
          <button
            type="button"
            className="am-btn am-btn--primary"
            disabled={!value || mutation.busy || !online}
            onClick={() => {
              void send();
            }}
          >
            {mutation.busy ? panel.sending : isletmeApp.suggestSend}
          </button>
        </div>
      </BottomSheet>
    </>
  );
}
