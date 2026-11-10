"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { businessApply, waitlist } from "@ada-merkez/copy";
import { channelFromTouch } from "@ada-merkez/shared";
import { apiBase } from "../lib/api";
import { captureAttribution, readAttribution } from "../lib/attribution-client";
import { trackBrowserEvent } from "../lib/browser-analytics";

type FieldErrors = Record<string, boolean>;
const CITIES = ["lefkosa", "girne", "magusa", "diger"] as const;
const SECTORS = ["kuafor", "klinik", "restoran", "diger"] as const;

function digitsOf(phone: string) {
  return phone.replace(/\D/g, "");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function BusinessApplyForm() {
  const [state, setState] = useState<"empty" | "error" | "submitting" | "success">("empty");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [region, setRegion] = useState<"kuzey" | "turkiye" | "">("");
  const [city, setCity] = useState("");
  const [open, setOpen] = useState(false);
  const busy = state === "submitting";
  const errorClass = (id: string) => (errors[id] ? "field is-error" : "field");

  useEffect(() => {
    const base = apiBase();
    if (!base) {
      setOpen(false);
      return;
    }
    fetch(`${base}/health`)
      .then((response) => response.json())
      .then((body: { waitlistOpen?: boolean }) => setOpen(body.waitlistOpen === true))
      .catch(() => setOpen(false));
  }, []);

  function validate(form: HTMLFormElement): FieldErrors {
    const data = new FormData(form);
    const next: FieldErrors = {};
    const isletme = String(data.get("isletme_adi") || "").trim();
    const sektor = String(data.get("sektor") || "");
    const konum = String(data.get("konum_tipi") || "");
    const sehir = String(data.get("sehir") || "");
    const yetkili = String(data.get("yetkili_adi") || "").trim();
    const telefon = String(data.get("telefon") || "").trim();
    const eposta = String(data.get("eposta") || "").trim();
    const not = String(data.get("not") || "");
    const riza = data.get("riza") === "on" || data.get("riza") === "evet";
    if (isletme.length < 2) next.isletme = true;
    if (!sektor) next.sektor = true;
    if (!konum) next.konum = true;
    if (konum === "Kuzey_Kibris" && !sehir) next.konum = true;
    if (yetkili.length < 2) next.yetkili = true;
    if (digitsOf(telefon).length < 10 || digitsOf(telefon).length > 15) next.telefon = true;
    if (!validEmail(eposta)) next.eposta = true;
    if (not.length > 500) next.not = true;
    if (!riza) next.riza = true;
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setState("error");
      setStatus(businessApply.invalid);
      return;
    }
    setErrors({});
    const data = new FormData(form);
    const eventId = crypto.randomUUID();
    const attribution = captureAttribution();
    const inTurkey = String(data.get("konum_tipi")) === "Turkiye";
    const payload = {
      businessName: String(data.get("isletme_adi") || "").trim(),
      sector: String(data.get("sektor") || ""),
      inTurkey,
      city: inTurkey ? undefined : String(data.get("sehir") || ""),
      contactName: String(data.get("yetkili_adi") || "").trim(),
      phone: String(data.get("telefon") || "").trim(),
      email: String(data.get("eposta") || "").trim(),
      whatsapp: String(data.get("whatsapp") || "").trim(),
      notes: String(data.get("not") || "").trim(),
      consentGranted: true as const,
      eventId,
      attribution,
    };
    const base = apiBase();
    if (!base) {
      setState("error");
      setStatus(businessApply.unavailable);
      return;
    }
    setState("submitting");
    setStatus("");
    trackBrowserEvent(
      "business_apply_submit",
      {
        event_id: eventId,
        city: inTurkey ? "turkey" : payload.city,
        channel: channelFromTouch(attribution.last ?? attribution.first),
        ref: attribution.last?.ref ?? attribution.first?.ref ?? null,
      },
      { clientOnly: true },
    );
    try {
      const response = await fetch(`${base}/v1/business-applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await response.json().catch(() => null)) as {
        ok?: boolean;
        message?: string;
        code?: string;
      } | null;
      if (response.status === 503 && body?.code === "waitlist_closed") {
        setOpen(false);
        return;
      }
      if (response.ok && body?.ok) {
        setState("success");
        return;
      }
      setState("error");
      setStatus(body?.message || businessApply.unavailable);
    } catch {
      setState("error");
      setStatus(businessApply.unavailable);
    }
  }

  const attr = useMemo(() => (typeof window === "undefined" ? null : readAttribution()), []);

  return (
    <div className="wrap g12" data-state={state}>
      <div className="span-5">
        <div className="form-intro">
          <p className="t-label">{businessApply.title}</p>
          <h1 className="t-display">{businessApply.heading}</h1>
          <p className="t-lede form-lede form-lede-default">{businessApply.intro}</p>
        </div>
        <div className="thanks" role="status">
          <div className="mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12.5 10 17l9-10" />
            </svg>
          </div>
          <h1 className="t-display">{businessApply.success}</h1>
          <p className="t-lede form-lede">{businessApply.successBody}</p>
          <p className="form-meta" style={{ marginTop: 20 }}>
            {waitlist.successMeta}
          </p>
        </div>
      </div>
      <div className="span-7">
        {!open ? (
          <div className="form-card" role="status">
            <p>
              <strong>{businessApply.closedTitle}</strong>
            </p>
            <p>{businessApply.closedBody}</p>
          </div>
        ) : (
        <form className="form-card" onSubmit={onSubmit} noValidate aria-busy={busy}>
          <input type="hidden" name="utm_source" defaultValue={attr?.last?.source ?? ""} />
          <input type="hidden" name="utm_medium" defaultValue={attr?.last?.medium ?? ""} />
          <input type="hidden" name="utm_campaign" defaultValue={attr?.last?.campaign ?? ""} />
          <input type="hidden" name="utm_content" defaultValue={attr?.last?.content ?? ""} />
          <input type="hidden" name="utm_term" defaultValue={attr?.last?.term ?? ""} />
          <input type="hidden" name="ref" defaultValue={attr?.last?.ref ?? ""} />

          <div className={errorClass("isletme")} id="fld-isletme">
            <label className="field-label" htmlFor="isletme_adi">
              {businessApply.businessName} <span className="field-req">*</span>
            </label>
            <input className="input" id="isletme_adi" name="isletme_adi" type="text" maxLength={120} autoComplete="organization" disabled={busy} />
            <p className="field-error">İşletme adını yazın (en az iki karakter).</p>
          </div>
          <div className={errorClass("sektor")} id="fld-sektor">
            <p className="field-label" id="lbl-sektor">
              {businessApply.sector} <span className="field-req">*</span>
            </p>
            <div className="choice-grid" role="radiogroup" aria-labelledby="lbl-sektor">
              {SECTORS.map((value) => (
                <label className="choice" key={value}>
                  <input type="radio" name="sektor" value={value} disabled={busy} />
                  {businessApply.sectors[value]}
                </label>
              ))}
            </div>
            <p className="field-error">Bir sektör seçin.</p>
          </div>
          <div className={errorClass("konum")} id="fld-konum">
            <p className="field-label" id="lbl-konum">
              {businessApply.locationLabel} <span className="field-req">*</span>
            </p>
            <div className="region" role="radiogroup" aria-labelledby="lbl-konum">
              <label className="region-card" id="card-kk">
                <input type="radio" name="konum_tipi" value="Kuzey_Kibris" disabled={busy} onChange={() => setRegion("kuzey")} />
                <strong>{businessApply.northCyprus}</strong>
                <span>{businessApply.northCyprusHint}</span>
              </label>
              <label className="region-card" id="card-tr">
                <input type="radio" name="konum_tipi" value="Turkiye" disabled={busy} onChange={() => setRegion("turkiye")} />
                <strong>{businessApply.inTurkey}</strong>
                <span>{businessApply.inTurkeyHint}</span>
              </label>
            </div>
            <div id="sehir-wrap" className={region === "kuzey" ? "show-cities" : ""}>
              <div className="region-cities choice-grid" role="radiogroup" aria-label={businessApply.cityLabel}>
                {CITIES.map((value) => (
                  <label className="choice" key={value}>
                    <input type="radio" name="sehir" value={value} disabled={busy} onChange={() => setCity(value)} />
                    {waitlist.cities[value]}
                  </label>
                ))}
              </div>
              <div className="field sehir-diger-wrap" hidden={city !== "diger"}>
                <label className="field-label" htmlFor="sehir_diger">
                  {waitlist.cityOtherLabel}
                </label>
                <input className="input" id="sehir_diger" name="sehir_diger" type="text" maxLength={80} disabled={busy} />
              </div>
            </div>
            {region === "turkiye" ? <span className="field-hint">{businessApply.turkeyHint}</span> : null}
            <p className="field-error">Konum seçin. Kuzey Kıbrıs ise şehir de gerekli.</p>
          </div>
          <div className={errorClass("yetkili")} id="fld-yetkili">
            <label className="field-label" htmlFor="yetkili_adi">
              {businessApply.contactName} <span className="field-req">*</span>
            </label>
            <input className="input" id="yetkili_adi" name="yetkili_adi" type="text" maxLength={80} autoComplete="name" disabled={busy} />
            <p className="field-error">Yetkili adını yazın.</p>
          </div>
          <div className={errorClass("telefon")} id="fld-telefon">
            <label className="field-label" htmlFor="telefon">
              {businessApply.phone} <span className="field-req">*</span>
            </label>
            <input className="input" id="telefon" name="telefon" type="tel" autoComplete="tel" inputMode="tel" placeholder="+90 548 …" disabled={busy} />
            <p className="field-error">{waitlist.phoneError}</p>
          </div>
          <div className={errorClass("eposta")} id="fld-eposta">
            <label className="field-label" htmlFor="eposta">
              {businessApply.email} <span className="field-req">*</span>
            </label>
            <input className="input" id="eposta" name="eposta" type="email" autoComplete="email" placeholder="isletme@posta.com" disabled={busy} />
            <p className="field-error">{waitlist.emailError}</p>
          </div>
          <div className="field" id="fld-whatsapp">
            <label className="field-label" htmlFor="whatsapp">
              {businessApply.whatsapp} <span className="field-opt">{waitlist.nameOptional}</span>
            </label>
            <input className="input" id="whatsapp" name="whatsapp" type="tel" inputMode="tel" placeholder="+90 548 …" disabled={busy} />
          </div>
          <div className={errorClass("not")} id="fld-not">
            <label className="field-label" htmlFor="not">
              {businessApply.notes} <span className="field-opt">{waitlist.nameOptional}</span>
            </label>
            <textarea className="textarea" id="not" name="not" maxLength={500} rows={4} disabled={busy} />
            <span className="field-hint">En fazla 500 karakter.</span>
          </div>
          <div className={errorClass("riza")} id="fld-riza">
            <div className="consent">
              <input id="riza" name="riza" type="checkbox" value="evet" disabled={busy} />
              <div>
                <p>
                  <label htmlFor="riza">
                    {businessApply.consent} <span className="field-req">*</span>
                  </label>
                </p>
                <div className="legal">{waitlist.consentLegal}</div>
                <p className="field-error">{waitlist.consentError}</p>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className={busy ? "btn btn-coral is-busy" : "btn btn-coral"} type="submit" disabled={busy} aria-busy={busy}>
              <span className="spin" aria-hidden="true" />
              <span className="idle-label">{businessApply.submit}</span>
              <span className="busy-label">{businessApply.submitting}</span>
            </button>
            <p className="form-meta">{businessApply.formMeta}</p>
            <p className="form-status" data-kind={state === "error" ? "err" : undefined} role="status">
              {status}
            </p>
          </div>
        </form>
        )}
      </div>
    </div>
  );
}
