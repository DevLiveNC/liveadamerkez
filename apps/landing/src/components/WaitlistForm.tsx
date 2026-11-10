"use client";

import { FormEvent, useEffect, useState } from "react";
import { waitlist } from "@ada-merkez/copy";
import { apiBase } from "../lib/api";

type Status = { kind: "ok" | "err"; text: string } | null;

export function WaitlistForm({ defaultRole = "customer" }: { defaultRole?: "customer" | "business" }) {
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const base = apiBase();
    if (!base) {
      setOpen(false);
      return;
    }
    fetch(`${base}/health`)
      .then((response) => response.json())
      .then((body: { waitlistOpen?: boolean }) => {
        setOpen(body.waitlistOpen === true);
      })
      .catch(() => setOpen(false));
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus(null);
    const form = event.currentTarget;
    const data = new FormData(form);
    const consentGranted = data.get("consent") === "on";
    if (!consentGranted) {
      setStatus({ kind: "err", text: waitlist.consentRequired });
      return;
    }

    const payload = {
      role: String(data.get("role") || defaultRole),
      name: String(data.get("name") || "").trim(),
      phone: String(data.get("phone") || "").trim(),
      city: String(data.get("city") || "").trim() || undefined,
      consentGranted: true,
      whatsappUpdatesGranted: data.get("whatsapp") === "on",
    };

    const base = apiBase();
    if (!base) {
      setStatus({ kind: "err", text: waitlist.unavailable });
      return;
    }

    setPending(true);
    try {
      const response = await fetch(`${base}/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        code?: string;
        message?: string;
      } | null;
      if (response.status === 201) {
        setStatus({ kind: "ok", text: waitlist.success });
        form.reset();
        return;
      }
      if (response.status === 503 && body?.code === "waitlist_closed") {
        setOpen(false);
        return;
      }
      if (response.status === 409) {
        setStatus({ kind: "err", text: waitlist.duplicate });
        return;
      }
      if (response.status === 400 && body?.code === "CONSENT_REQUIRED") {
        setStatus({ kind: "err", text: waitlist.consentRequired });
        return;
      }
      setStatus({
        kind: "err",
        text: body?.message || waitlist.unavailable,
      });
    } catch {
      setStatus({ kind: "err", text: waitlist.unavailable });
    } finally {
      setPending(false);
    }
  }

  if (!open) {
    return (
      <div className="form-card" role="status">
        <p>
          <strong>{waitlist.closedTitle}</strong>
        </p>
        <p>{waitlist.closedBody}</p>
        <p>
          {waitlist.retentionNote}{" "}
          <a href="/yasal/kvkk">{waitlist.kvkkPlaceholder}</a>
        </p>
      </div>
    );
  }

  return (
    <form className="form-card" onSubmit={onSubmit} noValidate>
      <div className="field">
        <label htmlFor="role">{waitlist.roleLabel}</label>
        <select id="role" name="role" defaultValue={defaultRole}>
          <option value="customer">{waitlist.roleCustomer}</option>
          <option value="business">{waitlist.roleBusiness}</option>
        </select>
      </div>
      <div className="field">
        <label htmlFor="name">{waitlist.nameLabel}</label>
        <input id="name" name="name" autoComplete="name" required minLength={2} placeholder={waitlist.namePlaceholder} />
      </div>
      <div className="field">
        <label htmlFor="phone">{waitlist.phoneLabel}</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          inputMode="tel"
          required
          placeholder={waitlist.phonePlaceholder}
        />
      </div>
      <div className="field">
        <label htmlFor="city">{waitlist.cityLabel}</label>
        <input id="city" name="city" autoComplete="address-level2" placeholder={waitlist.cityPlaceholder} />
      </div>
      <label className="checkbox">
        <input type="checkbox" name="consent" required />
        <span>{waitlist.consentLabel}</span>
      </label>
      <p>
        {waitlist.retentionNote}{" "}
        <a href="/yasal/kvkk">{waitlist.kvkkPlaceholder}</a>
      </p>
      <label className="checkbox">
        <input type="checkbox" name="whatsapp" />
        <span>{waitlist.whatsappLabel}</span>
      </label>
      <p className="form-status" data-kind={status?.kind} role="status">
        {status?.text}
      </p>
      <button className="button button-primary" type="submit" disabled={pending}>
        {pending ? waitlist.submitting : waitlist.submit}
      </button>
    </form>
  );
}
