"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { waitlist } from "@ada-merkez/copy";
import { channelFromTouch } from "@ada-merkez/shared";
import { apiBase } from "../lib/api";
import { captureAttribution, readAttribution } from "../lib/attribution-client";
import { trackBrowserEvent } from "../lib/browser-analytics";

type FieldErrors = Record<string, boolean>;
const CITIES = ["lefkosa", "girne", "magusa", "diger"] as const;
const SEGMENTS = ["ogrenci", "yerli", "tr_ziyaretci", "diger"] as const;

function digitsOf(phone: string) {
  return phone.replace(/\D/g, "");
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function WaitlistForm() {
  const [state, setState] = useState<"empty" | "error" | "submitting" | "success">("empty");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  const busy = state === "submitting";

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
  const errorClass = (id: string) => (errors[id] ? "field is-error" : "field");

  function validate(form: HTMLFormElement): FieldErrors {
    const data = new FormData(form);
    const name = String(data.get("ad") || "").trim();
    const email = String(data.get("eposta") || "").trim();
    const phone = String(data.get("telefon") || "").trim();
    const sehir = String(data.get("sehir") || "");
    const segment = String(data.get("segment") || "");
    const riza = data.get("riza") === "on" || data.get("riza") === "evet";
    const next: FieldErrors = {};
    if (name && name.length < 2) next.ad = true;
    if (!email && !phone) {
      next.eposta = true;
      next.telefon = true;
    }
    if (email && !validEmail(email)) next.eposta = true;
    if (phone && (digitsOf(phone).length < 10 || digitsOf(phone).length > 15)) next.telefon = true;
    if (!sehir) next.sehir = true;
    if (!segment) next.segment = true;
    if (!riza) next.riza = true;
    return next;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const nextErrors = validate(form);
    setCopied(false);
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setState("error");
      setStatus(waitlist.invalid);
      return;
    }
    setErrors({});
    const data = new FormData(form);
    const eventId = crypto.randomUUID();
    const attribution = captureAttribution();
    const payload = {
      name: String(data.get("ad") || "").trim(),
      email: String(data.get("eposta") || "").trim(),
      phone: String(data.get("telefon") || "").trim(),
      city: String(data.get("sehir") || ""),
      segment: String(data.get("segment") || ""),
      consentGranted: true as const,
      marketingConsent: data.get("pazarlama") === "on" || data.get("pazarlama") === "evet",
      analyticsConsent: data.get("pazarlama") === "on" || data.get("pazarlama") === "evet",
      eventId,
      attribution,
    };
    const base = apiBase();
    if (!base) {
      setState("error");
      setStatus(waitlist.unavailable);
      return;
    }
    setState("submitting");
    setStatus("");
    trackBrowserEvent(
      "waitlist_submit",
      {
        event_id: eventId,
        city: payload.city,
        segment: payload.segment,
        channel: channelFromTouch(attribution.last ?? attribution.first),
        ref: attribution.last?.ref ?? attribution.first?.ref ?? null,
        business_id: attribution.last?.businessId ?? attribution.first?.businessId ?? null,
      },
      { clientOnly: true },
    );
    try {
      const response = await fetch(`${base}/v1/waitlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
        setShareUrl("");
        setState("success");
        return;
      }
      setState("error");
      if (body?.code === "CONSENT_REQUIRED") {
        setErrors({ riza: true });
        setStatus(waitlist.consentRequired);
        return;
      }
      setStatus(body?.message || waitlist.unavailable);
    } catch {
      setState("error");
      setStatus(waitlist.unavailable);
    }
  }

  const attr = useMemo(() => (typeof window === "undefined" ? null : readAttribution()), []);

  return (
    <div className="wrap g12" data-state={state}>
      <div className="span-5">
        <div className="form-intro">
          <p className="t-label">{waitlist.title}</p>
          <h2 className="t-display">{waitlist.heading}</h2>
          <p className="t-lede form-lede form-lede-default">{waitlist.lede}</p>
        </div>
        <div className="thanks" role="status">
          <div className="mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <path d="M5 12.5 10 17l9-10" />
            </svg>
          </div>
          <h2 className="t-display">{waitlist.successTitle}</h2>
          <p className="t-lede form-lede">{waitlist.successBody}</p>
          <p className="form-meta" style={{ marginTop: 20 }}>
            {waitlist.successMeta}
          </p>
          {shareUrl ? (
            <div className="share-box">
              <label className="field-label" htmlFor="share">
                {waitlist.share}
              </label>
              <input id="share" readOnly value={shareUrl} />
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={async () => {
                  await navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                }}
              >
                {copied ? waitlist.shareCopied : waitlist.share}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="span-7">
        {!open ? (
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
        ) : (
        <form className="form-card" onSubmit={onSubmit} noValidate aria-busy={busy}>
          <input type="hidden" name="utm_source" defaultValue={attr?.last?.source ?? attr?.first?.source ?? ""} />
          <input type="hidden" name="utm_medium" defaultValue={attr?.last?.medium ?? ""} />
          <input type="hidden" name="utm_campaign" defaultValue={attr?.last?.campaign ?? ""} />
          <input type="hidden" name="utm_content" defaultValue={attr?.last?.content ?? ""} />
          <input type="hidden" name="utm_term" defaultValue={attr?.last?.term ?? ""} />
          <input type="hidden" name="ref" defaultValue={attr?.last?.ref ?? attr?.first?.ref ?? ""} />

          <div className={errorClass("ad")} id="fld-ad">
            <label className="field-label" htmlFor="ad">
              {waitlist.nameLabel} <span className="field-opt">{waitlist.nameOptional}</span>
            </label>
            <input className="input" id="ad" name="ad" type="text" maxLength={80} autoComplete="name" placeholder={waitlist.namePlaceholder} disabled={busy} />
            <p className="field-error">{waitlist.nameError}</p>
          </div>
          <div className={errorClass("eposta")} id="fld-eposta">
            <label className="field-label" htmlFor="eposta">
              {waitlist.emailLabel}
            </label>
            <input className="input" id="eposta" name="eposta" type="email" autoComplete="email" placeholder={waitlist.emailPlaceholder} aria-invalid={Boolean(errors.eposta)} aria-describedby="hint-iletisim" disabled={busy} />
            <p className="field-error">{waitlist.emailError}</p>
          </div>
          <div className={errorClass("telefon")} id="fld-telefon">
            <label className="field-label" htmlFor="telefon">
              {waitlist.phoneLabel}
            </label>
            <input className="input" id="telefon" name="telefon" type="tel" autoComplete="tel" inputMode="tel" placeholder="+90 548 …" aria-invalid={Boolean(errors.telefon)} disabled={busy} />
            <span className="field-hint" id="hint-iletisim">
              {waitlist.contactHint}
            </span>
            <p className="field-error">{waitlist.contactError}</p>
          </div>
          <div className={errorClass("sehir")} id="fld-sehir">
            <p className="field-label" id="lbl-sehir">
              {waitlist.cityLabel} <span className="field-req">*</span>
            </p>
            <div className="choice-grid" role="radiogroup" aria-labelledby="lbl-sehir">
              {CITIES.map((value) => (
                <label className="choice" key={value}>
                  <input type="radio" name="sehir" value={value} disabled={busy} onChange={() => setCity(value)} />
                  {waitlist.cities[value]}
                </label>
              ))}
            </div>
            <span className="field-hint">{waitlist.cityHint}</span>
            <p className="field-error">{waitlist.choiceError}</p>
          </div>
          <div className="field sehir-diger-wrap" id="fld-sehir-diger" hidden={city !== "diger"}>
            <label className="field-label" htmlFor="sehir_diger">
              {waitlist.cityOtherLabel} <span className="field-opt">{waitlist.nameOptional}</span>
            </label>
            <input className="input" id="sehir_diger" name="sehir_diger" type="text" maxLength={80} disabled={busy} />
          </div>
          <div className={errorClass("segment")} id="fld-segment">
            <p className="field-label" id="lbl-segment">
              {waitlist.segmentLabel} <span className="field-req">*</span>
            </p>
            <div className="choice-grid" role="radiogroup" aria-labelledby="lbl-segment">
              {SEGMENTS.map((value) => (
                <label className={value === "tr_ziyaretci" ? "choice is-tr" : "choice"} key={value}>
                  <input type="radio" name="segment" value={value} disabled={busy} />
                  {waitlist.segments[value]}
                </label>
              ))}
            </div>
            <span className="field-hint">{waitlist.segmentHint}</span>
            <p className="field-error">{waitlist.choiceError}</p>
          </div>
          <div className={errorClass("riza")} id="fld-riza">
            <div className="consent">
              <input id="riza" name="riza" type="checkbox" value="evet" disabled={busy} />
              <div>
                <p>
                  <label htmlFor="riza">
                    {waitlist.consentLabel} <span className="field-req">*</span>
                  </label>
                </p>
                <div className="legal">
                  {waitlist.consentLegal} {waitlist.retentionNote}{" "}
                  <a href="/yasal/kvkk">{waitlist.kvkkPlaceholder}</a>
                </div>
                <p className="field-error">{waitlist.consentError}</p>
              </div>
            </div>
          </div>
          <div className="form-actions">
            <button className={busy ? "btn btn-coral is-busy" : "btn btn-coral"} type="submit" disabled={busy} aria-busy={busy}>
              <span className="spin" aria-hidden="true" />
              <span className="idle-label">{waitlist.submit}</span>
              <span className="busy-label">{waitlist.submitting}</span>
            </button>
            <p className="form-meta">{waitlist.formMeta}</p>
            <div className="consent">
              <input id="pazarlama" name="pazarlama" type="checkbox" value="evet" disabled={busy} />
              <label htmlFor="pazarlama">{waitlist.marketingConsentLabel}</label>
            </div>
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
