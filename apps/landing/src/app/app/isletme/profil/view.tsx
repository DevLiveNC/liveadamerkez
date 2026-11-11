"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import {
  createAvailability,
  createService,
  createStaff,
  fetchAvailability,
  fetchMe,
  fetchServices,
  fetchStaff,
  minutesToLabel,
  patchBusiness,
  patchService,
  removeAvailability,
  removeService,
  type AvailabilityRow,
  type BusinessMe,
  type ServiceRow,
  type StaffRow,
} from "../../../../lib/isletme-api";

const WEEKDAYS = [
  { v: 1, l: "Pazartesi" },
  { v: 2, l: "Salı" },
  { v: 3, l: "Çarşamba" },
  { v: 4, l: "Perşembe" },
  { v: 5, l: "Cuma" },
  { v: 6, l: "Cumartesi" },
  { v: 0, l: "Pazar" },
] as const;

export function ProfilView() {
  const [me, setMe] = useState<BusinessMe | null>(null);
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [rules, setRules] = useState<AvailabilityRow[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [mine, svc, people, hours] = await Promise.all([
      fetchMe(),
      fetchServices(),
      fetchStaff(),
      fetchAvailability(),
    ]);
    setMe(mine.me);
    setServices(svc.services);
    setStaff(people.staff);
    setRules(hours.rules);
  }, []);

  useEffect(() => {
    void load().catch(() => undefined);
  }, [load]);

  async function onProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await patchBusiness({
      name: String(form.get("name") ?? ""),
      phone: String(form.get("phone") ?? "") || null,
      email: String(form.get("email") ?? "") || null,
      whatsapp: String(form.get("whatsapp") ?? "") || null,
      address: String(form.get("address") ?? "") || null,
      description: String(form.get("description") ?? "") || null,
    });
    setSaved(true);
    await load();
  }

  async function onService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createService({
      name: String(form.get("serviceName") ?? ""),
      durationMinutes: Number(form.get("durationMinutes") ?? 30),
      staffId: String(form.get("staffId") ?? "") || null,
      priceLabel: String(form.get("priceLabel") ?? "") || null,
    });
    event.currentTarget.reset();
    await load();
  }

  async function onStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await createStaff(String(form.get("staffName") ?? ""));
    event.currentTarget.reset();
    await load();
  }

  async function onHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = String(form.get("start") ?? "09:00");
    const end = String(form.get("end") ?? "18:00");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    await createAvailability({
      staffId: String(form.get("hourStaff") ?? "") || null,
      weekday: Number(form.get("weekday")),
      startsAtMinutes: (sh ?? 9) * 60 + (sm ?? 0),
      endsAtMinutes: (eh ?? 18) * 60 + (em ?? 0),
    });
    event.currentTarget.reset();
    await load();
  }

  const biz = me?.business;

  return (
    <div>
      <div className="isletme-head">
        <h1>{isletmeApp.profileTitle}</h1>
        <p className="t-sm t-muted">{isletmeApp.profileLead}</p>
      </div>

      <section className="isletme-card">
        <form className="isletme-form" onSubmit={(e) => void onProfile(e)}>
          <div className="field">
            <label className="field-label" htmlFor="biz-name">
              İşletme adı
            </label>
            <input className="input" id="biz-name" name="name" defaultValue={biz?.name ?? ""} required />
          </div>
          <div className="row2">
            <div className="field">
              <label className="field-label" htmlFor="biz-phone">
                Telefon
              </label>
              <input className="input" id="biz-phone" name="phone" defaultValue={biz?.phone ?? ""} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="biz-email">
                E-posta
              </label>
              <input className="input" id="biz-email" name="email" defaultValue={biz?.email ?? ""} />
            </div>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="biz-whatsapp">
              WhatsApp hattı
            </label>
            <input className="input" id="biz-whatsapp" name="whatsapp" defaultValue={biz?.whatsapp ?? ""} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="biz-address">
              Adres
            </label>
            <input className="input" id="biz-address" name="address" defaultValue={biz?.address ?? ""} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="biz-desc">
              Kısa açıklama
            </label>
            <textarea className="textarea" id="biz-desc" name="description" rows={3} defaultValue={biz?.description ?? ""} />
          </div>
          <button className="btn btn-navy" type="submit">
            {isletmeApp.save}
          </button>
          {saved ? <p className="t-sm t-muted">{isletmeApp.saved}</p> : null}
        </form>
      </section>

      <section className="isletme-card" id="hizmetler">
        <h2 className="t-h3" style={{ fontSize: 18, marginBottom: 12 }}>
          {isletmeApp.servicesTitle}
        </h2>
        <div className="isletme-list">
          {services.map((row) => (
            <div key={row.id} className="isletme-row">
              <div>
                <strong>{row.name}</strong>
                <p className="t-xs t-muted">
                  {row.durationMinutes} dk · {row.priceLabel?.trim() ? row.priceLabel : isletmeApp.priceMissing}
                </p>
              </div>
              <div className="acts">
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => {
                    const next = window.prompt(isletmeApp.price, row.priceLabel ?? "");
                    if (next == null) return;
                    void patchService(row.id, { priceLabel: next.trim() || null }).then(() => load());
                  }}
                >
                  {isletmeApp.price}
                </button>
                <button className="btn btn-ghost btn-sm" type="button" onClick={() => void removeService(row.id).then(() => load())}>
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
        <form className="isletme-form" style={{ marginTop: 16 }} onSubmit={(e) => void onService(e)}>
          <div className="row2">
            <div className="field">
              <label className="field-label" htmlFor="serviceName">
                {isletmeApp.serviceName}
              </label>
              <input className="input" id="serviceName" name="serviceName" required />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="durationMinutes">
                {isletmeApp.duration}
              </label>
              <input className="input" id="durationMinutes" name="durationMinutes" type="number" min={5} max={480} defaultValue={30} />
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label className="field-label" htmlFor="priceLabel">
                {isletmeApp.price}
              </label>
              <input className="input" id="priceLabel" name="priceLabel" placeholder={isletmeApp.priceHint} />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="staffId">
                {isletmeApp.staffTitle}
              </label>
              <select className="input" id="staffId" name="staffId">
                <option value="">—</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <button className="btn btn-coral" type="submit">
            {isletmeApp.addService}
          </button>
        </form>
      </section>

      <section className="isletme-card" id="personel">
        <h2 className="t-h3" style={{ fontSize: 18, marginBottom: 12 }}>
          {isletmeApp.staffTitle}
        </h2>
        <div className="isletme-list">
          {staff.map((person) => (
            <div key={person.id} className="isletme-row">
              <strong>{person.name}</strong>
            </div>
          ))}
        </div>
        <form className="isletme-form" style={{ marginTop: 16 }} onSubmit={(e) => void onStaff(e)}>
          <div className="field">
            <label className="field-label" htmlFor="staffName">
              {isletmeApp.staffName}
            </label>
            <input className="input" id="staffName" name="staffName" required />
          </div>
          <button className="btn btn-coral" type="submit">
            {isletmeApp.addStaff}
          </button>
        </form>
      </section>

      <section className="isletme-card">
        <h2 className="t-h3" style={{ fontSize: 18, marginBottom: 12 }}>
          {isletmeApp.hoursTitle}
        </h2>
        <div className="isletme-list">
          {rules.map((rule) => (
            <div key={rule.id} className="isletme-row">
              <p>
                {WEEKDAYS.find((d) => d.v === rule.weekday)?.l ?? "Gün"} · {minutesToLabel(rule.startsAtMinutes)}–
                {minutesToLabel(rule.endsAtMinutes)}
              </p>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => void removeAvailability(rule.id).then(() => load())}>
                Sil
              </button>
            </div>
          ))}
        </div>
        <form className="isletme-form" style={{ marginTop: 16 }} onSubmit={(e) => void onHours(e)}>
          <div className="row2">
            <div className="field">
              <label className="field-label" htmlFor="weekday">
                {isletmeApp.weekday}
              </label>
              <select className="input" id="weekday" name="weekday" defaultValue="1">
                {WEEKDAYS.map((day) => (
                  <option key={day.v} value={day.v}>
                    {day.l}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="hourStaff">
                {isletmeApp.staffTitle}
              </label>
              <select className="input" id="hourStaff" name="hourStaff">
                <option value="">—</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="row2">
            <div className="field">
              <label className="field-label" htmlFor="start">
                {isletmeApp.start}
              </label>
              <input className="input" id="start" name="start" type="time" defaultValue="09:00" />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="end">
                {isletmeApp.end}
              </label>
              <input className="input" id="end" name="end" type="time" defaultValue="18:00" />
            </div>
          </div>
          <button className="btn btn-coral" type="submit">
            {isletmeApp.addHours}
          </button>
        </form>
      </section>
    </div>
  );
}
