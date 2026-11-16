"use client";

import { useCallback, useState, type FormEvent } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import { BottomSheet } from "@ada-merkez/ui";
import {
  ConfirmAction,
  PanelEmpty,
  PanelError,
  PanelFeedback,
  PanelIntro,
  PanelLoading,
  StatusBadge,
} from "../../../../components/panel/PanelKit";
import {
  useOnline,
  usePanelData,
  usePanelMutation,
} from "../../../../components/panel/use-panel-data";
import { IconPlus } from "../../../../components/panel/icons";
import {
  createService,
  createStaff,
  fetchServices,
  fetchStaff,
  patchService,
  patchStaff,
  type ServiceRow,
  type StaffRow,
} from "../../../../lib/isletme-api";

type Editor =
  | { kind: "service"; row?: ServiceRow }
  | { kind: "staff"; row?: StaffRow }
  | null;

export function HizmetlerView() {
  const loader = useCallback(async () => {
    const [services, staff] = await Promise.all([
      fetchServices(),
      fetchStaff(),
    ]);
    return { services: services.services, staff: staff.staff };
  }, []);
  const query = usePanelData(loader, "business-catalog");
  const mutation = usePanelMutation();
  const online = useOnline();
  const [editor, setEditor] = useState<Editor>(null);
  const close = () => {
    if (!mutation.busy) {
      setEditor(null);
      mutation.setError(null);
    }
  };
  function open(value: Editor) {
    mutation.setError(null);
    mutation.setSuccess(null);
    setEditor(value);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editor) return;
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const ok = await mutation.run(async () => {
      if (editor.kind === "staff") {
        if (editor.row) await patchStaff(editor.row.id, { name });
        else await createStaff(name);
      } else {
        const input = {
          name,
          durationMinutes: Number(form.get("duration")),
          staffId: String(form.get("staffId") ?? "") || null,
          priceLabel: String(form.get("price") ?? "").trim() || null,
          description: String(form.get("description") ?? "").trim() || null,
        };
        if (editor.row) await patchService(editor.row.id, input);
        else await createService(input);
      }
    }, panel.saved);
    if (ok) {
      setEditor(null);
      await query.refresh();
    }
  }

  const services = query.data?.services ?? [];
  const staff = query.data?.staff ?? [];
  return (
    <>
      <PanelIntro
        eyebrow={isletmeApp.loginTitle}
        title={isletmeApp.servicesTitle}
        action={
          <button
            type="button"
            className="am-btn am-btn--primary"
            disabled={!online || !query.data}
            onClick={() => open({ kind: "service" })}
          >
            <IconPlus />
            {isletmeApp.addService}
          </button>
        }
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
        <>
          {query.error ? <PanelError compact message={query.error} /> : null}
          <PanelFeedback
            success={mutation.success}
            error={!editor ? mutation.error : null}
          />
          <div className="am-grid-2">
            <section className="pn-card">
              <div className="pn-card-head">
                <h3>
                  {isletmeApp.navServices}{" "}
                  <span className="pn-setup-count">({services.length})</span>
                </h3>
              </div>
              {!services.length ? (
                <PanelEmpty
                  title={isletmeApp.servicesTitle}
                  body={isletmeApp.priceHint}
                />
              ) : (
                services.map((row) => (
                  <div className="pn-entity" key={row.id}>
                    <div className="pn-entity-body">
                      <h4>{row.name}</h4>
                      <p>
                        {row.durationMinutes} {panel.minutesShort} ·{" "}
                        {row.priceLabel || isletmeApp.priceMissing}
                        {row.staffId
                          ? ` · ${staff.find((person) => person.id === row.staffId)?.name ?? ""}`
                          : ""}
                      </p>
                      {row.description ? <p>{row.description}</p> : null}
                    </div>
                    <StatusBadge status={row.active ? "active" : "inactive"} />
                    <div className="pn-entity-actions">
                      <button
                        type="button"
                        className="am-btn am-btn--ghost am-btn--sm"
                        disabled={!online}
                        onClick={() => open({ kind: "service", row })}
                      >
                        {panel.edit}
                      </button>
                      <ConfirmAction
                        label={row.active ? panel.deactivate : panel.activate}
                        title={
                          row.active ? panel.deactivateService : panel.activate
                        }
                        body={
                          row.active
                            ? panel.deactivateServiceBody
                            : isletmeApp.servicesTitle
                        }
                        action={async () => {
                          await patchService(row.id, { active: !row.active });
                        }}
                        message={panel.saved}
                        onDone={() => {
                          void query.refresh();
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </section>
            <section className="pn-card">
              <div className="pn-card-head">
                <h3>
                  {isletmeApp.staffTitle}{" "}
                  <span className="pn-setup-count">({staff.length})</span>
                </h3>
                <button
                  type="button"
                  className="am-btn am-btn--ghost am-btn--sm"
                  disabled={!online}
                  onClick={() => open({ kind: "staff" })}
                >
                  <IconPlus />
                  {isletmeApp.addStaff}
                </button>
              </div>
              {!staff.length ? (
                <PanelEmpty
                  title={isletmeApp.staffTitle}
                  body={panel.setupStaff}
                />
              ) : (
                staff.map((row) => (
                  <div className="pn-entity" key={row.id}>
                    <div className="pn-entity-body">
                      <h4>{row.name}</h4>
                    </div>
                    <StatusBadge status={row.active ? "active" : "inactive"} />
                    <div className="pn-entity-actions">
                      <button
                        type="button"
                        className="am-btn am-btn--ghost am-btn--sm"
                        disabled={!online}
                        onClick={() => open({ kind: "staff", row })}
                      >
                        {panel.edit}
                      </button>
                      <ConfirmAction
                        label={row.active ? panel.deactivate : panel.activate}
                        title={
                          row.active ? panel.deactivateStaff : panel.activate
                        }
                        body={
                          row.active
                            ? panel.deactivateStaffBody
                            : isletmeApp.staffTitle
                        }
                        action={async () => {
                          await patchStaff(row.id, { active: !row.active });
                        }}
                        message={panel.saved}
                        onDone={() => {
                          void query.refresh();
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
        </>
      )}
      <BottomSheet
        open={Boolean(editor)}
        onClose={close}
        title={
          editor?.kind === "staff"
            ? editor.row
              ? panel.edit
              : isletmeApp.addStaff
            : editor?.row
              ? panel.edit
              : isletmeApp.addService
        }
        closeLabel={panel.close}
        className="pn-edit-sheet"
      >
        <form
          key={editor?.row?.id ?? editor?.kind}
          className="pn-form"
          onSubmit={(event) => {
            void submit(event);
          }}
        >
          <div className="pn-field">
            <label htmlFor="pn-entity-name">
              {editor?.kind === "staff"
                ? isletmeApp.staffName
                : isletmeApp.serviceName}
            </label>
            <input
              id="pn-entity-name"
              name="name"
              required
              minLength={2}
              maxLength={80}
              defaultValue={editor?.row?.name ?? ""}
              autoFocus
            />
          </div>
          {editor?.kind === "service" ? (
            <>
              <div className="pn-field">
                <label htmlFor="pn-duration">{isletmeApp.duration}</label>
                <input
                  id="pn-duration"
                  name="duration"
                  type="number"
                  inputMode="numeric"
                  min={5}
                  max={480}
                  step={5}
                  required
                  defaultValue={editor.row?.durationMinutes ?? 45}
                />
              </div>
              <div className="pn-field">
                <label htmlFor="pn-price">{isletmeApp.price}</label>
                <input
                  id="pn-price"
                  name="price"
                  maxLength={40}
                  defaultValue={editor.row?.priceLabel ?? ""}
                />
                <small>{isletmeApp.priceHint}</small>
              </div>
              <div className="pn-field">
                <label htmlFor="pn-staff">{isletmeApp.staffTitle}</label>
                <select
                  id="pn-staff"
                  name="staffId"
                  defaultValue={editor.row?.staffId ?? ""}
                >
                  <option value="">—</option>
                  {staff
                    .filter(
                      (person) =>
                        person.active || person.id === editor.row?.staffId,
                    )
                    .map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                        {!person.active ? ` · ${panel.inactive}` : ""}
                      </option>
                    ))}
                </select>
              </div>
              <div className="pn-field">
                <label htmlFor="pn-description">
                  {panel.serviceDescription}
                </label>
                <textarea
                  id="pn-description"
                  name="description"
                  rows={3}
                  maxLength={200}
                  defaultValue={editor.row?.description ?? ""}
                />
              </div>
            </>
          ) : null}
          <PanelFeedback error={mutation.error} />
          <div className="pn-form-actions">
            <button
              type="button"
              className="am-btn am-btn--ghost"
              disabled={mutation.busy}
              onClick={close}
            >
              {panel.cancel}
            </button>
            <button
              type="submit"
              className="am-btn am-btn--primary"
              disabled={mutation.busy || !online}
            >
              {mutation.busy ? panel.saving : isletmeApp.save}
            </button>
          </div>
        </form>
      </BottomSheet>
    </>
  );
}
