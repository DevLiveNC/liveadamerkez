"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import {
  createAvailability,
  fetchAvailability,
  fetchMe,
  fetchStaff,
  minutesToLabel,
  patchBusiness,
  removeAvailability,
  type AvailabilityRow,
  type BusinessMe,
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

function sectorLabel(sector: string | null | undefined) {
  if (sector === "klinik") return "Klinik";
  if (sector === "restoran") return "Restoran";
  if (sector === "kuafor") return "Kuaför";
  return sector ?? "";
}

export function ProfilView() {
  const [me, setMe] = useState<BusinessMe | null>(null);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [rules, setRules] = useState<AvailabilityRow[]>([]);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const [mine, hours, people] = await Promise.all([fetchMe(), fetchAvailability(), fetchStaff()]);
    setMe(mine.me);
    setRules(hours.rules);
    setStaff(people.staff);
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
    <section className="am-panel-card">
      <h2>{isletmeApp.profileTitle}</h2>
      <form className="am-form-grid mt-3" onSubmit={(e) => void onProfile(e)}>
        <div className="am-field">
          <label htmlFor="biz-name">İşletme adı</label>
          <input className="am-input" id="biz-name" name="name" defaultValue={biz?.name ?? ""} required />
        </div>
        <div className="am-field">
          <label htmlFor="biz-cat">Kategori</label>
          <input className="am-input" id="biz-cat" value={sectorLabel(biz?.sector)} readOnly />
        </div>
        <div className="am-field full">
          <label htmlFor="biz-address">Adres</label>
          <input className="am-input" id="biz-address" name="address" defaultValue={biz?.address ?? ""} />
        </div>
        <div className="am-field">
          <label htmlFor="biz-phone">Telefon</label>
          <input className="am-input" id="biz-phone" name="phone" defaultValue={biz?.phone ?? ""} />
        </div>
        <div className="am-field">
          <label htmlFor="biz-whatsapp">WhatsApp hattı</label>
          <input className="am-input" id="biz-whatsapp" name="whatsapp" defaultValue={biz?.whatsapp ?? ""} />
        </div>
        <div className="am-field full">
          <label htmlFor="biz-email">E-posta</label>
          <input className="am-input" id="biz-email" name="email" defaultValue={biz?.email ?? ""} />
        </div>
        <div className="am-field full">
          <label htmlFor="biz-desc">Kısa açıklama</label>
          <textarea className="am-input" id="biz-desc" name="description" rows={3} defaultValue={biz?.description ?? ""} />
        </div>
        <div className="full">
          <button className="am-btn am-btn--primary" type="submit">
            {isletmeApp.save}
          </button>
          {saved ? <p className="am-muted" style={{ marginTop: 8 }}>{isletmeApp.saved}</p> : null}
        </div>
      </form>

      <h2 className="mt-4">{isletmeApp.hoursTitle}</h2>
      {rules.map((rule) => (
        <div key={rule.id} className="am-entity">
          <div className="am-entity-body">
            <h3>
              {WEEKDAYS.find((d) => d.v === rule.weekday)?.l ?? "Gün"} · {minutesToLabel(rule.startsAtMinutes)}–
              {minutesToLabel(rule.endsAtMinutes)}
            </h3>
          </div>
          <button className="am-btn am-btn--ghost am-btn--sm" type="button" onClick={() => void removeAvailability(rule.id).then(() => load())}>
            Sil
          </button>
        </div>
      ))}
      <form className="am-form-grid mt-3" onSubmit={(e) => void onHours(e)}>
        <div className="am-field">
          <label htmlFor="weekday">{isletmeApp.weekday}</label>
          <select className="am-input" id="weekday" name="weekday" defaultValue="1">
            {WEEKDAYS.map((day) => (
              <option key={day.v} value={day.v}>
                {day.l}
              </option>
            ))}
          </select>
        </div>
        <div className="am-field">
          <label htmlFor="hourStaff">{isletmeApp.staffTitle}</label>
          <select className="am-input" id="hourStaff" name="hourStaff">
            <option value="">—</option>
            {staff.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </div>
        <div className="am-field">
          <label htmlFor="start">{isletmeApp.start}</label>
          <input className="am-input" id="start" name="start" type="time" defaultValue="09:00" />
        </div>
        <div className="am-field">
          <label htmlFor="end">{isletmeApp.end}</label>
          <input className="am-input" id="end" name="end" type="time" defaultValue="18:00" />
        </div>
        <div>
          <button className="am-btn am-btn--ghost am-btn--sm" type="submit">
            {isletmeApp.addHours}
          </button>
        </div>
      </form>
    </section>
  );
}
