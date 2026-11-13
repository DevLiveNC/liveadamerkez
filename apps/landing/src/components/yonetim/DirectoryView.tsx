"use client";

import { useMemo, useState } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import {
  DataToolbar,
  FilterChips,
  Pagination,
  PanelEmpty,
  PanelError,
  PanelIntro,
  PanelLoading,
  SearchField,
  StatusBadge,
} from "../panel/PanelKit";
import { usePanelData } from "../panel/use-panel-data";
import {
  matchesSearch,
  pageSlice,
  PANEL_PAGE_SIZE,
} from "../../lib/panel-workflow";
import { formatWhen } from "../../lib/nicosia-format";

export type DirectoryRow = {
  id: string;
  name: string;
  meta: string;
  status: string;
  date: string;
  search?: string;
};

export function DirectoryView({
  title,
  lead,
  loader,
  queryKey,
  filters = [],
  emptyTitle,
  emptyBody,
}: {
  title: string;
  lead: string;
  loader: () => Promise<DirectoryRow[]>;
  queryKey: string;
  filters?: readonly (readonly [string, string])[];
  emptyTitle: string;
  emptyBody: string;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(0);
  const query = usePanelData(loader, queryKey);
  const visible = useMemo(
    () =>
      (query.data ?? []).filter(
        (row) =>
          (filter === "all" || row.status === filter) &&
          matchesSearch([row.name, row.meta, row.search], search),
      ),
    [query.data, search, filter],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(visible.length / PANEL_PAGE_SIZE) - 1),
  );
  return (
    <>
      <PanelIntro eyebrow={yonetimApp.panelName} title={title}>
        {lead}
      </PanelIntro>
      <div className="pn-filters">
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
        />
        {filters.length ? (
          <FilterChips
            value={filter}
            onChange={(value) => {
              setFilter(value);
              setPage(0);
            }}
            options={filters}
          />
        ) : null}
      </div>
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
                title={
                  search || filter !== "all" ? panel.noResults : emptyTitle
                }
                body={
                  search || filter !== "all" ? panel.noResultsBody : emptyBody
                }
              />
            </div>
          ) : (
            <div className="pn-list">
              {pageSlice(visible, safePage).map((row) => (
                <article className="pn-record" key={row.id}>
                  <div className="pn-record-head">
                    <div>
                      <h3>{row.name}</h3>
                      <p>{row.meta}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="pn-record-meta">
                    <span>{formatWhen(row.date)}</span>
                    <span>{row.id.slice(0, 8)}</span>
                  </div>
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
