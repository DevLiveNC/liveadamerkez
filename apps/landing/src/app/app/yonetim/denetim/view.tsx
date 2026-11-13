"use client";

import { useCallback, useMemo, useState } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import {
  DataToolbar,
  Pagination,
  PanelEmpty,
  PanelError,
  PanelIntro,
  PanelLoading,
  SearchField,
} from "../../../../components/panel/PanelKit";
import { usePanelData } from "../../../../components/panel/use-panel-data";
import { fetchAudit } from "../../../../lib/yonetim-api";
import {
  matchesSearch,
  pageSlice,
  PANEL_PAGE_SIZE,
} from "../../../../lib/panel-workflow";
import { formatWhen } from "../../../../lib/nicosia-format";

const ACTION_LABELS: Record<string, string> = panel.auditActions;

export function DenetimView() {
  const loader = useCallback(async () => (await fetchAudit()).audit, []);
  const query = usePanelData(loader, "admin-audit");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const visible = useMemo(
    () =>
      (query.data ?? []).filter((row) =>
        matchesSearch(
          [
            row.action,
            ACTION_LABELS[row.action],
            row.actorName,
            row.actorPhone,
            row.entityKind,
            row.entityId,
          ],
          search,
        ),
      ),
    [query.data, search],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(visible.length / PANEL_PAGE_SIZE) - 1),
  );
  return (
    <>
      <PanelIntro eyebrow={yonetimApp.panelName} title={yonetimApp.auditTitle}>
        {yonetimApp.auditLead} {panel.auditLimit}
      </PanelIntro>
      <SearchField
        value={search}
        onChange={(value) => {
          setSearch(value);
          setPage(0);
        }}
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
              {visible.length} {panel.records}
            </span>
          </DataToolbar>
          {query.error ? <PanelError compact message={query.error} /> : null}
          {!visible.length ? (
            <div className="pn-card">
              <PanelEmpty
                title={search ? panel.noResults : yonetimApp.emptyAuditTitle}
                body={search ? panel.noResultsBody : yonetimApp.emptyAuditBody}
              />
            </div>
          ) : (
            <div className="pn-list">
              {pageSlice(visible, safePage).map((row) => (
                <article className="pn-record" key={row.id}>
                  <div className="pn-record-head">
                    <div>
                      <h3>{ACTION_LABELS[row.action] ?? row.action}</h3>
                      <p>
                        {row.actorName ?? yonetimApp.roleAdmin}
                        {row.actorPhone ? ` · ${row.actorPhone}` : ""}
                      </p>
                    </div>
                    <time className="pn-setup-count" dateTime={row.createdAt}>
                      {formatWhen(row.createdAt)}
                    </time>
                  </div>
                  <div className="pn-record-meta">
                    <span>{row.entityKind}</span>
                    <span>{row.entityId?.slice(0, 8) ?? "—"}</span>
                    <span>{row.action}</span>
                  </div>
                  {row.detail ? (
                    <details className="pn-audit-detail">
                      <summary>{panel.details}</summary>
                      <pre>{JSON.stringify(row.detail, null, 2)}</pre>
                    </details>
                  ) : null}
                </article>
              ))}
            </div>
          )}
          {visible.length > PANEL_PAGE_SIZE ? (
            <Pagination
              page={safePage}
              total={visible.length}
              pageSize={PANEL_PAGE_SIZE}
              onChange={setPage}
            />
          ) : null}
        </>
      )}
    </>
  );
}
