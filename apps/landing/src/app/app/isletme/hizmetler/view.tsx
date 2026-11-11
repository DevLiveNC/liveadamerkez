"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { IconPlus } from "../../../../components/panel/icons";
import {
  createService,
  createStaff,
  fetchServices,
  fetchStaff,
  removeService,
  type ServiceRow,
  type StaffRow,
} from "../../../../lib/isletme-api";

export function HizmetlerView() {
  const [services, setServices] = useState<ServiceRow[]>([]);
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [addingService, setAddingService] = useState(false);
  const [addingStaff, setAddingStaff] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [svc, people] = await Promise.all([fetchServices(), fetchStaff()]);
    setServices(svc.services);
    setStaff(people.staff);
  }, []);

  useEffect(() => {
    void load().catch(() => undefined);
  }, [load]);

  async function onService(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFormError(null);
    try {
      await createService({
        name: String(form.get("serviceName") ?? ""),
        durationMinutes: Number(form.get("durationMinutes") ?? 30),
        staffId: String(form.get("staffId") ?? "") || null,
      });
      event.currentTarget.reset();
      setAddingService(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "İstek başarısız.");
    }
  }

  async function onStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setFormError(null);
    try {
      await createStaff(String(form.get("staffName") ?? ""));
      event.currentTarget.reset();
      setAddingStaff(false);
      await load();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "İstek başarısız.");
    }
  }

  function staffName(id: string | null) {
    if (!id) return "";
    return staff.find((person) => person.id === id)?.name ?? "";
  }

  return (
    <div className="am-grid-2">
      {formError ? (
        <p className="am-error" role="alert" style={{ gridColumn: "1 / -1" }}>
          {formError}
        </p>
      ) : null}
      <section className="am-panel-card">
        <h2>{isletmeApp.navServices}</h2>
        <p className="am-chart-caption" style={{ marginTop: -8, marginBottom: 8 }}>
          {isletmeApp.priceAsk}
        </p>
        {services.map((row) => (
          <div key={row.id} className="am-entity">
            <div className="am-entity-body">
              <h3>{row.name}</h3>
              <p>{staffName(row.staffId)}</p>
            </div>
            <span className="am-svc-dur">{row.durationMinutes} dk</span>
            <button className="am-btn am-btn--ghost am-btn--sm" type="button" onClick={() => void removeService(row.id).then(() => load())}>
              Sil
            </button>
          </div>
        ))}
        {addingService ? (
          <form className="am-form-grid" style={{ marginTop: 12 }} onSubmit={(e) => void onService(e)}>
            <div className="am-field">
              <label htmlFor="serviceName">{isletmeApp.serviceName}</label>
              <input className="am-input" id="serviceName" name="serviceName" required />
            </div>
            <div className="am-field">
              <label htmlFor="durationMinutes">{isletmeApp.duration}</label>
              <input className="am-input" id="durationMinutes" name="durationMinutes" type="number" min={5} max={480} defaultValue={45} />
            </div>
            <div className="am-field full">
              <label htmlFor="staffId">{isletmeApp.staffTitle}</label>
              <select className="am-input" id="staffId" name="staffId">
                <option value="">—</option>
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </select>
            </div>
            <button className="am-btn am-btn--primary am-btn--sm" type="submit">
              {isletmeApp.addService}
            </button>
          </form>
        ) : (
          <button className="am-btn am-btn--ghost am-btn--sm mt-3" type="button" onClick={() => setAddingService(true)}>
            <IconPlus /> {isletmeApp.addService}
          </button>
        )}
      </section>
      <section className="am-panel-card">
        <h2>{isletmeApp.staffTitle}</h2>
        {staff.map((person) => (
          <div key={person.id} className="am-entity">
            <div className="am-avatar" aria-hidden="true">
              {person.name.trim().slice(0, 2).toLocaleUpperCase("tr-TR")}
            </div>
            <div className="am-entity-body">
              <h3>{person.name}</h3>
            </div>
          </div>
        ))}
        {addingStaff ? (
          <form style={{ marginTop: 12 }} onSubmit={(e) => void onStaff(e)}>
            <div className="am-field">
              <label htmlFor="staffName">{isletmeApp.staffName}</label>
              <input className="am-input" id="staffName" name="staffName" required />
            </div>
            <button className="am-btn am-btn--primary am-btn--sm" type="submit" style={{ marginTop: 12 }}>
              {isletmeApp.addStaff}
            </button>
          </form>
        ) : (
          <button className="am-btn am-btn--ghost am-btn--sm mt-3" type="button" onClick={() => setAddingStaff(true)}>
            <IconPlus /> {isletmeApp.addStaff}
          </button>
        )}
      </section>
    </div>
  );
}
