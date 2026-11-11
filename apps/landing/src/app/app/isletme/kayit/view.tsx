"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { businessApply, isletmeApp } from "@ada-merkez/copy";
import { fetchMe, registerBusiness } from "../../../../lib/isletme-api";

export function KayitView() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inTurkey, setInTurkey] = useState(false);

  useEffect(() => {
    void fetchMe()
      .then((data) => {
        if (data.me.membership) router.replace("/app/isletme");
      })
      .catch(() => undefined);
  }, [router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setBusy(true);
    setError(null);
    try {
      await registerBusiness({
        name: String(form.get("name") ?? ""),
        sector: String(form.get("sector") ?? "kuafor") as "kuafor" | "klinik" | "restoran" | "diger",
        inTurkey,
        city: inTurkey ? undefined : (String(form.get("city") ?? "lefkosa") as "lefkosa" | "girne" | "magusa" | "diger"),
        contactName: String(form.get("contactName") ?? ""),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? "") || undefined,
        whatsapp: String(form.get("whatsapp") ?? "") || undefined,
        notes: String(form.get("notes") ?? "") || undefined,
      });
      router.replace("/app/isletme");
    } catch {
      setError(businessApply.invalid);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="isletme-head">
        <p className="t-label">{isletmeApp.region}</p>
        <h1>{isletmeApp.registerTitle}</h1>
        <p className="t-sm t-muted">{isletmeApp.registerLead}</p>
      </div>
      <form className="isletme-form form-card" onSubmit={onSubmit}>
        <div className="field">
          <label className="field-label" htmlFor="name">
            {businessApply.businessName}
          </label>
          <input className="input" id="name" name="name" required minLength={2} maxLength={120} />
        </div>
        <div className="field">
          <p className="field-label">{businessApply.sector}</p>
          <div className="choice-grid" role="radiogroup">
            <label className="choice">
              <input type="radio" name="sector" value="kuafor" defaultChecked /> {businessApply.sectors.kuafor}
            </label>
            <label className="choice">
              <input type="radio" name="sector" value="klinik" /> {businessApply.sectors.klinik}
            </label>
            <label className="choice">
              <input type="radio" name="sector" value="restoran" /> {businessApply.sectors.restoran}
            </label>
            <label className="choice">
              <input type="radio" name="sector" value="diger" /> {businessApply.sectors.diger}
            </label>
          </div>
        </div>
        <div className="field">
          <p className="field-label">{businessApply.locationLabel}</p>
          <div className="region" role="radiogroup">
            <label className="region-card">
              <input
                type="radio"
                name="region"
                checked={!inTurkey}
                onChange={() => setInTurkey(false)}
              />
              <strong>{businessApply.northCyprus}</strong>
              <span>{businessApply.northCyprusHint}</span>
            </label>
            <label className="region-card">
              <input type="radio" name="region" checked={inTurkey} onChange={() => setInTurkey(true)} />
              <strong>{businessApply.inTurkey}</strong>
              <span>{businessApply.inTurkeyHint}</span>
            </label>
          </div>
        </div>
        {!inTurkey ? (
          <div className="field">
            <p className="field-label">{businessApply.cityLabel}</p>
            <div className="choice-grid" role="radiogroup">
              <label className="choice">
                <input type="radio" name="city" value="lefkosa" defaultChecked /> Lefkoşa
              </label>
              <label className="choice">
                <input type="radio" name="city" value="girne" /> Girne
              </label>
              <label className="choice">
                <input type="radio" name="city" value="magusa" /> Mağusa
              </label>
              <label className="choice">
                <input type="radio" name="city" value="diger" /> Diğer
              </label>
            </div>
          </div>
        ) : null}
        <div className="field">
          <label className="field-label" htmlFor="contactName">
            {businessApply.contactName}
          </label>
          <input className="input" id="contactName" name="contactName" required minLength={2} />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="phone">
            {businessApply.phone}
          </label>
          <input className="input" id="phone" name="phone" type="tel" required />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="email">
            {businessApply.email}
          </label>
          <input className="input" id="email" name="email" type="email" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="whatsapp">
            {businessApply.whatsapp}
          </label>
          <input className="input" id="whatsapp" name="whatsapp" type="tel" />
        </div>
        <div className="field">
          <label className="field-label" htmlFor="notes">
            {businessApply.notes}
          </label>
          <textarea className="textarea" id="notes" name="notes" maxLength={500} rows={3} />
        </div>
        {error ? (
          <p className="field-error" role="alert" style={{ display: "block" }}>
            {error}
          </p>
        ) : null}
        <button className="btn btn-coral" type="submit" disabled={busy} aria-busy={busy}>
          {busy ? businessApply.submitting : isletmeApp.registerSubmit}
        </button>
      </form>
    </div>
  );
}
