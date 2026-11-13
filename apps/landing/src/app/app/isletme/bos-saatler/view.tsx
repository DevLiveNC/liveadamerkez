"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import { nicosiaDateKey } from "@ada-merkez/shared";
import {
  DataToolbar,
  FilterChips,
  PanelEmpty,
  PanelError,
  PanelIntro,
  PanelLoading,
} from "../../../../components/panel/PanelKit";
import { usePanelData } from "../../../../components/panel/use-panel-data";
import {
  fetchServices,
  fetchSlots,
  fetchStaff,
  formatNicosiaDate,
} from "../../../../lib/isletme-api";
import { nicosiaDayRange } from "../../../../lib/panel-workflow";

export function BosSaatlerView() {
  const [day, setDay] = useState(() => nicosiaDateKey(new Date()));
  const [serviceId, setServiceId] = useState("");
  const [staffId, setStaffId] = useState("");
  const [freeOnly, setFreeOnly] = useState(true);
  const loader = useCallback(async () => {
    const [services, staff] = await Promise.all([
      fetchServices(),
      fetchStaff(),
    ]);
    const selected =
      serviceId || services.services.find((row) => row.active)?.id;
    const result = await fetchSlots({
      from: nicosiaDayRange(day)!.from,
      days: 7,
      serviceId: selected,
      staffId: staffId || undefined,
    });
    return {
      services: services.services,
      staff: staff.staff,
      slots: result.slots,
      duration: services.services.find((row) => row.id === selected)
        ?.durationMinutes,
    };
  }, [day, serviceId, staffId]);
  const query = usePanelData(
    loader,
    `business-slots:${day}:${serviceId}:${staffId}`,
  );
  const slots = (query.data?.slots ?? []).filter(
    (slot) => !freeOnly || slot.status === "free",
  );
  const days = [
    ...new Set(slots.map((slot) => nicosiaDateKey(new Date(slot.startsAt)))),
  ].sort();
  return (
    <>
      <PanelIntro
        eyebrow={isletmeApp.loginTitle}
        title={isletmeApp.slotsTitle}
        action={
          <Link
            className="am-btn am-btn--ghost"
            href="/app/isletme/profil#calisma-saatleri"
          >
            {isletmeApp.hoursTitle}
          </Link>
        }
      >
        {panel.slotsLead}
      </PanelIntro>
      <div className="pn-calendar-controls">
        <div className="pn-field">
          <label htmlFor="slots-day">{panel.from}</label>
          <input
            id="slots-day"
            type="date"
            value={day}
            onChange={(event) => {
              if (nicosiaDayRange(event.target.value))
                setDay(event.target.value);
            }}
          />
        </div>
        <div className="pn-field">
          <label htmlFor="slots-service">{panel.service}</label>
          <select
            id="slots-service"
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
          >
            <option value="">{panel.serviceCategory}</option>
            {query.data?.services
              .filter((row) => row.active)
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name} · {row.durationMinutes} {panel.minutesShort}
                </option>
              ))}
          </select>
        </div>
        <div className="pn-field">
          <label htmlFor="slots-staff">{isletmeApp.staffTitle}</label>
          <select
            id="slots-staff"
            value={staffId}
            onChange={(event) => setStaffId(event.target.value)}
          >
            <option value="">{panel.allStaff}</option>
            {query.data?.staff
              .filter((row) => row.active)
              .map((row) => (
                <option key={row.id} value={row.id}>
                  {row.name}
                </option>
              ))}
          </select>
        </div>
      </div>
      <FilterChips
        label={isletmeApp.slotsTitle}
        value={freeOnly ? "free" : "all"}
        onChange={(value) => setFreeOnly(value === "free")}
        options={[
          ["free", panel.onlyFree],
          ["all", panel.showAllSlots],
        ]}
      />
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
        <>
          <DataToolbar updated={query.updatedAt} refreshing={query.refreshing}>
            <span>
              {panel.suggestionZone}
              {query.data.duration
                ? ` · ${query.data.duration} ${panel.minutesShort}`
                : ""}
            </span>
          </DataToolbar>
          {query.error ? <PanelError compact message={query.error} /> : null}
          {!days.length ? (
            <div className="pn-card">
              <PanelEmpty
                title={isletmeApp.slotsEmptyTitle}
                body={
                  query.data.slots.length
                    ? panel.noResultsBody
                    : panel.slotsSetup
                }
                href="/app/isletme/profil#calisma-saatleri"
                action={isletmeApp.addHours}
              />
            </div>
          ) : (
            <div className="pn-slot-days">
              {days.map((key) => (
                <section className="pn-card" key={key}>
                  <h3>
                    {formatNicosiaDate(nicosiaDayRange(key)!.from, {
                      weekday: "long",
                      day: "numeric",
                      month: "short",
                    })}
                  </h3>
                  <div className="pn-slot-grid">
                    {slots
                      .filter(
                        (slot) =>
                          nicosiaDateKey(new Date(slot.startsAt)) === key,
                      )
                      .map((slot) => (
                        <div
                          key={`${slot.startsAt}:${slot.staffId}`}
                          className={`pn-slot ${slot.status === "free" ? "is-free" : "is-busy"}`}
                        >
                          <strong>
                            {formatNicosiaDate(slot.startsAt, {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </strong>
                          <span>
                            {slot.status === "free"
                              ? isletmeApp.free
                              : isletmeApp.busy}
                          </span>
                          {slot.staffId ? (
                            <small>
                              {
                                query.data?.staff.find(
                                  (row) => row.id === slot.staffId,
                                )?.name
                              }
                            </small>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </section>
              ))}
            </div>
          )}
          <p className="pn-lead mt-4">{panel.slotsReadOnly}</p>
        </>
      )}
    </>
  );
}
