"use client";

import { useCallback, useState, type FormEvent } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import { BottomSheet } from "@ada-merkez/ui";
import {
  PanelEmpty,
  PanelError,
  PanelFeedback,
  PanelIntro,
  PanelLoading,
  SearchField,
} from "../../../../components/panel/PanelKit";
import {
  useOnline,
  usePanelData,
  usePanelMutation,
} from "../../../../components/panel/use-panel-data";
import {
  createCategory,
  fetchCategories,
  patchCategory,
  type AdminCategory,
} from "../../../../lib/yonetim-api";
import { matchesSearch } from "../../../../lib/panel-workflow";

export function IcerikView() {
  const loader = useCallback(
    async () => (await fetchCategories()).categories,
    [],
  );
  const query = usePanelData(loader, "admin-categories");
  const mutation = usePanelMutation();
  const online = useOnline();
  const [search, setSearch] = useState("");
  const [editor, setEditor] = useState<AdminCategory | "new" | null>(null);
  const row = editor && editor !== "new" ? editor : null;
  const visible = (query.data ?? []).filter((item) =>
    matchesSearch([item.name, item.slug, item.kind], search),
  );
  const close = () => {
    if (!mutation.busy) {
      setEditor(null);
      mutation.setError(null);
    }
  };
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input = {
      name: String(form.get("name") ?? "").trim(),
      kind: String(form.get("kind") ?? "service"),
    };
    const ok = await mutation.run(async () => {
      if (row) await patchCategory(row.id, input);
      else await createCategory(input);
    }, panel.saved);
    if (ok) {
      setEditor(null);
      await query.refresh();
    }
  }
  return (
    <>
      <PanelIntro
        eyebrow={yonetimApp.panelName}
        title={yonetimApp.contentTitle}
        action={
          <button
            type="button"
            className="am-btn am-btn--primary"
            disabled={!online || !query.data}
            onClick={() => {
              mutation.setError(null);
              setEditor("new");
            }}
          >
            {yonetimApp.addCategory}
          </button>
        }
      >
        {yonetimApp.contentLead}
      </PanelIntro>
      <SearchField value={search} onChange={setSearch} />
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
        <section className="pn-card mt-4">
          <PanelFeedback
            success={mutation.success}
            error={!editor ? mutation.error : null}
          />
          {query.error ? <PanelError compact message={query.error} /> : null}
          {!visible.length ? (
            <PanelEmpty
              title={search ? panel.noResults : yonetimApp.emptyContentTitle}
              body={search ? panel.noResultsBody : yonetimApp.emptyContentBody}
            />
          ) : (
            visible.map((item) => (
              <div className="pn-entity" key={item.id}>
                <div className="pn-entity-body">
                  <h4>{item.name}</h4>
                  <p>
                    {item.slug} · {item.kind}
                  </p>
                </div>
                <button
                  type="button"
                  className="am-btn am-btn--ghost am-btn--sm"
                  disabled={!online}
                  onClick={() => {
                    mutation.setError(null);
                    setEditor(item);
                  }}
                >
                  {panel.edit}
                </button>
              </div>
            ))
          )}
        </section>
      )}
      <BottomSheet
        open={Boolean(editor)}
        onClose={close}
        title={row ? panel.edit : yonetimApp.addCategory}
        closeLabel={panel.close}
        className="pn-edit-sheet"
      >
        <form
          key={row?.id ?? "new"}
          className="pn-form"
          onSubmit={(event) => {
            void submit(event);
          }}
        >
          <div className="pn-field">
            <label htmlFor="category-name">{yonetimApp.categoryName}</label>
            <input
              id="category-name"
              name="name"
              defaultValue={row?.name ?? ""}
              minLength={2}
              maxLength={80}
              required
            />
          </div>
          <div className="pn-field">
            <label htmlFor="category-kind">{yonetimApp.categoryKind}</label>
            <select
              id="category-kind"
              name="kind"
              defaultValue={row?.kind ?? "service"}
            >
              <option value="service">{panel.serviceCategory}</option>
              <option value="table">{panel.tableCategory}</option>
              {row && !["service", "table"].includes(row.kind) ? (
                <option value={row.kind}>{row.kind}</option>
              ) : null}
            </select>
          </div>
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
              {mutation.busy ? panel.saving : panel.save}
            </button>
          </div>
        </form>
      </BottomSheet>
    </>
  );
}
