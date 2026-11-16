"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import {
  ConfirmAction,
  PanelEmpty,
  PanelError,
  PanelFeedback,
  PanelIntro,
  PanelLoading,
} from "../../../../components/panel/PanelKit";
import {
  useOnline,
  usePanelData,
  usePanelMutation,
} from "../../../../components/panel/use-panel-data";
import {
  createAvailability,
  fetchAvailability,
  fetchMe,
  fetchStaff,
  labelToMinutes,
  minutesToLabel,
  patchBusiness,
  removeAvailability,
  type BusinessProfile,
} from "../../../../lib/isletme-api";
import { validWorkingHours } from "../../../../lib/panel-workflow";

const WEEKDAYS = [
  { v: 1, l: panel.weekdays.monday },
  { v: 2, l: panel.weekdays.tuesday },
  { v: 3, l: panel.weekdays.wednesday },
  { v: 4, l: panel.weekdays.thursday },
  { v: 5, l: panel.weekdays.friday },
  { v: 6, l: panel.weekdays.saturday },
  { v: 0, l: panel.weekdays.sunday },
];

export function ProfilView() {
  const loader = useCallback(async () => {
    const [me, hours, staff] = await Promise.all([
      fetchMe(),
      fetchAvailability(),
      fetchStaff(),
    ]);
    return { me: me.me, hours: hours.rules, staff: staff.staff };
  }, []);
  const query = usePanelData(loader, "business-profile");
  const profile = usePanelMutation();
  const hoursMutation = usePanelMutation();
  const online = useOnline();
  const [dirty, setDirty] = useState(false);
  const [hoursError, setHoursError] = useState<string | null>(null);
  const biz = query.data?.me.business;
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  async function onProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    let saved: BusinessProfile | undefined;
    const ok = await profile.run(async () => {
      const result = await patchBusiness({
        name: String(form.get("name") ?? "").trim(),
        phone: String(form.get("phone") ?? "").trim() || null,
        email: String(form.get("email") ?? "").trim() || null,
        whatsapp: String(form.get("whatsapp") ?? "").trim() || null,
        address: String(form.get("address") ?? "").trim() || null,
        description: String(form.get("description") ?? "").trim() || null,
      });
      saved = result.business;
    }, panel.saved);
    if (ok) {
      /* Sunucunun normalize ettiği değeri yaz; yenilemede kullanıcı yazısını ezme. */
      for (const key of [
        "name",
        "phone",
        "email",
        "whatsapp",
        "address",
        "description",
      ] as const) {
        const field = element.elements.namedItem(key);
        if (
          field instanceof HTMLInputElement ||
          field instanceof HTMLTextAreaElement
        )
          field.value = saved?.[key] ?? "";
      }
      setDirty(false);
      await query.refresh();
    }
  }

  async function onHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const start = String(form.get("start") ?? "");
    const end = String(form.get("end") ?? "");
    setHoursError(null);
    if (!validWorkingHours(start, end)) {
      setHoursError(panel.invalidHours);
      return;
    }
    const element = event.currentTarget;
    const ok = await hoursMutation.run(async () => {
      await createAvailability({
        staffId: String(form.get("hourStaff") ?? "") || null,
        weekday: Number(form.get("weekday")),
        startsAtMinutes: labelToMinutes(start),
        endsAtMinutes: labelToMinutes(end),
      });
    }, panel.saved);
    if (ok) {
      element.reset();
      await query.refresh();
    }
  }

  return (
    <>
      <PanelIntro
        eyebrow={isletmeApp.loginTitle}
        title={isletmeApp.navSettings}
      >
        {isletmeApp.profileLead}
      </PanelIntro>
      {query.loading ? (
        <PanelLoading />
      ) : !query.data ? (
        <PanelError
          message={query.error ?? ""}
          retry={() => {
            void query.refresh();
          }}
        />
      ) : (
        <div className="pn-stack">
          {query.error ? <PanelError compact message={query.error} /> : null}
          <section className="pn-card">
            <h3>{isletmeApp.profileTitle}</h3>
            <form
              key={biz?.id}
              className="pn-form"
              onInput={() => setDirty(true)}
              onSubmit={(event) => {
                void onProfile(event);
              }}
            >
              <div className="pn-field">
                <label htmlFor="biz-name">{panel.businessName}</label>
                <input
                  id="biz-name"
                  name="name"
                  defaultValue={biz?.name ?? ""}
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="organization"
                />
              </div>
              <div className="pn-field">
                <label htmlFor="biz-cat">{panel.category}</label>
                <input id="biz-cat" value={biz?.sector ?? "—"} readOnly />
              </div>
              <div className="pn-field pn-full">
                <label htmlFor="biz-address">{panel.address}</label>
                <input
                  id="biz-address"
                  name="address"
                  defaultValue={biz?.address ?? ""}
                  maxLength={200}
                  autoComplete="street-address"
                />
              </div>
              <div className="pn-field">
                <label htmlFor="biz-phone">{panel.phone}</label>
                <input
                  id="biz-phone"
                  name="phone"
                  type="tel"
                  defaultValue={biz?.phone ?? ""}
                  maxLength={24}
                  autoComplete="tel"
                />
              </div>
              <div className="pn-field">
                <label htmlFor="biz-whatsapp">{panel.whatsappLine}</label>
                <input
                  id="biz-whatsapp"
                  name="whatsapp"
                  type="tel"
                  defaultValue={biz?.whatsapp ?? ""}
                  maxLength={24}
                />
              </div>
              <div className="pn-field pn-full">
                <label htmlFor="biz-email">{panel.email}</label>
                <input
                  id="biz-email"
                  name="email"
                  type="email"
                  defaultValue={biz?.email ?? ""}
                  maxLength={120}
                  autoComplete="email"
                />
              </div>
              <div className="pn-field pn-full">
                <label htmlFor="biz-desc">{panel.description}</label>
                <textarea
                  id="biz-desc"
                  name="description"
                  rows={3}
                  defaultValue={biz?.description ?? ""}
                  maxLength={500}
                />
              </div>
              <div className="pn-full">
                <PanelFeedback
                  error={profile.error}
                  success={profile.success}
                />
                <div className="pn-form-actions">
                  <button
                    className="am-btn am-btn--primary"
                    type="submit"
                    disabled={profile.busy || !online || !biz}
                  >
                    {profile.busy ? panel.saving : isletmeApp.save}
                  </button>
                  {dirty ? (
                    <span className="pn-setup-count">{panel.unsaved}</span>
                  ) : null}
                </div>
              </div>
            </form>
          </section>
          <section className="pn-card" id="calisma-saatleri">
            <h3>{isletmeApp.hoursTitle}</h3>
            <p className="pn-lead">{panel.suggestionZone}</p>
            {!query.data.hours.length ? (
              <PanelEmpty
                title={isletmeApp.slotsEmptyTitle}
                body={isletmeApp.slotsEmptyBody}
              />
            ) : (
              query.data.hours.map((rule) => (
                <div className="pn-entity" key={rule.id}>
                  <div className="pn-entity-body">
                    <h4>
                      {WEEKDAYS.find((day) => day.v === rule.weekday)?.l ??
                        panel.everyDay}{" "}
                      · {minutesToLabel(rule.startsAtMinutes)}–
                      {minutesToLabel(rule.endsAtMinutes)}
                    </h4>
                    <p>
                      {query.data?.staff.find(
                        (person) => person.id === rule.staffId,
                      )?.name ?? isletmeApp.staffTitle}
                    </p>
                  </div>
                  <ConfirmAction
                    label={panel.remove}
                    title={panel.removeHours}
                    body={panel.removeHoursBody}
                    action={async () => {
                      await removeAvailability(rule.id);
                    }}
                    message={panel.saved}
                    onDone={() => {
                      void query.refresh();
                    }}
                  />
                </div>
              ))
            )}
            <form
              className="pn-form mt-4"
              onSubmit={(event) => {
                void onHours(event);
              }}
            >
              <div className="pn-field">
                <label htmlFor="weekday">{isletmeApp.weekday}</label>
                <select id="weekday" name="weekday" defaultValue="1">
                  {WEEKDAYS.map((day) => (
                    <option key={day.v} value={day.v}>
                      {day.l}
                    </option>
                  ))}
                </select>
              </div>
              <div className="pn-field">
                <label htmlFor="hourStaff">{isletmeApp.staffTitle}</label>
                <select id="hourStaff" name="hourStaff">
                  <option value="">—</option>
                  {query.data.staff
                    .filter((person) => person.active)
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="pn-field">
                <label htmlFor="start">{isletmeApp.start}</label>
                <input
                  id="start"
                  name="start"
                  type="time"
                  defaultValue="09:00"
                  required
                />
              </div>
              <div className="pn-field">
                <label htmlFor="end">{isletmeApp.end}</label>
                <input
                  id="end"
                  name="end"
                  type="time"
                  defaultValue="18:00"
                  required
                />
              </div>
              <div className="pn-full">
                <PanelFeedback
                  error={hoursError || hoursMutation.error}
                  success={hoursMutation.success}
                />
                <button
                  className="am-btn am-btn--ghost"
                  type="submit"
                  disabled={hoursMutation.busy || !online}
                >
                  {hoursMutation.busy ? panel.saving : isletmeApp.addHours}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
