"use client";

import { useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { patchBooking } from "../../lib/isletme-api";

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
  const [sending, setSending] = useState(false);

  async function send() {
    if (!value) return;
    setSending(true);
    try {
      await patchBooking(id, { suggestStartsAt: new Date(value).toISOString() });
      setOpen(false);
      setValue("");
      await onDone();
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <button
        className="am-btn am-btn--ghost am-btn--sm"
        type="button"
        disabled={busy || sending}
        onClick={() => setOpen(true)}
      >
        {isletmeApp.suggestSlot}
      </button>
    );
  }

  return (
    <span className="am-suggest">
      <label className="visually-hidden" htmlFor={`suggest-${id}`}>
        {isletmeApp.suggestWhen}
      </label>
      <input
        id={`suggest-${id}`}
        type="datetime-local"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        disabled={sending}
      />
      <button
        className="am-btn am-btn--primary am-btn--sm"
        type="button"
        disabled={!value || sending}
        onClick={() => void send()}
      >
        {isletmeApp.suggestSend}
      </button>
    </span>
  );
}
