"use client";

import { useCallback, useMemo, useState } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
import { BottomSheet } from "@ada-merkez/ui";
import {
  ConfirmAction,
  DataToolbar,
  FilterChips,
  Pagination,
  PanelEmpty,
  PanelError,
  PanelFeedback,
  PanelIntro,
  PanelLoading,
  SearchField,
  StatusBadge,
} from "../../../../components/panel/PanelKit";
import { usePanelData } from "../../../../components/panel/use-panel-data";
import {
  fetchApplications,
  fetchBusinesses,
  patchApplication,
  patchBusiness,
} from "../../../../lib/yonetim-api";
import {
  isApprovalPending,
  matchesSearch,
  pageSlice,
  PANEL_PAGE_SIZE,
} from "../../../../lib/panel-workflow";
import { formatWhen } from "../../../../lib/nicosia-format";

type Filter = "pending" | "approved" | "rejected" | "all";
type Row = {
  key: string;
  id: string;
  kind: "business" | "application";
  name: string;
  category: string;
  place: string;
  contact: string | null;
  status: string;
  createdAt: string;
};

export function OnaylarView() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [detail, setDetail] = useState<Row | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const loader = useCallback(async () => {
    const [businesses, applications] = await Promise.all([
      fetchBusinesses(),
      fetchApplications(),
    ]);
    const rows: Row[] = [
      ...businesses.businesses.map((row) => ({
        key: `b-${row.id}`,
        id: row.id,
        kind: "business" as const,
        name: row.name,
        category: row.categoryName ?? row.sector ?? "—",
        place: row.inTurkey ? panel.turkey : (row.cityName ?? "—"),
        contact: null,
        status: row.status,
        createdAt: row.createdAt,
      })),
      ...applications.applications.map((row) => ({
        key: `a-${row.id}`,
        id: row.id,
        kind: "application" as const,
        name: row.businessName,
        category: row.sector,
        place: row.inTurkey ? panel.turkey : (row.city ?? "—"),
        contact: row.contactName,
        status: row.status,
        createdAt: row.createdAt,
      })),
    ];
    return rows.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  }, []);
  const query = usePanelData(loader, "admin-approvals");
  const visible = useMemo(
    () =>
      (query.data ?? []).filter(
        (row) =>
          (filter === "all" ||
            (filter === "pending"
              ? isApprovalPending(row.status)
              : row.status === filter)) &&
          matchesSearch(
            [row.name, row.category, row.place, row.contact],
            search,
          ),
      ),
    [query.data, filter, search],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(visible.length / PANEL_PAGE_SIZE) - 1),
  );
  const rows = pageSlice(visible, safePage);
  async function act(row: Row, status: "approved" | "rejected" | "review") {
    if (row.kind === "business") {
      if (status !== "review") await patchBusiness(row.id, status);
    } else await patchApplication(row.id, status);
    setDetail(null);
  }
  function actions(row: Row) {
    if (!isApprovalPending(row.status)) return null;
    return (
      <>
        <ConfirmAction
          label={yonetimApp.approve}
          title={panel.approveBusiness}
          body={
            row.kind === "application"
              ? panel.applicationNote
              : panel.approveBusinessBody
          }
          className="am-btn am-btn--primary am-btn--sm"
          action={() => act(row, "approved")}
          message={panel.approved}
          onDone={() => {
            setFeedback(panel.approved);
            void query.refresh();
          }}
        />
        <ConfirmAction
          label={yonetimApp.reject}
          title={panel.rejectBusiness}
          body={panel.rejectBusinessBody}
          action={() => act(row, "rejected")}
          message={panel.rejected}
          onDone={() => {
            setFeedback(panel.rejected);
            void query.refresh();
          }}
        />
        {row.kind === "application" && row.status !== "review" ? (
          <ConfirmAction
            label={yonetimApp.statusReview}
            title={panel.reviewApplication}
            body={panel.reviewApplicationBody}
            action={() => act(row, "review")}
            message={panel.reviewed}
            onDone={() => {
              setFeedback(panel.reviewed);
              void query.refresh();
            }}
          />
        ) : null}
      </>
    );
  }
  return (
    <>
      <PanelIntro
        eyebrow={yonetimApp.panelName}
        title={yonetimApp.approvalsTitle}
      >
        {yonetimApp.approvalsLead}
      </PanelIntro>
      <div className="pn-filters">
        <SearchField
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
        />
        <FilterChips
          value={filter}
          onChange={(value) => {
            setFilter(value);
            setPage(0);
          }}
          options={[
            ["pending", panel.pending],
            ["approved", panel.confirmed],
            ["rejected", panel.rejectedFilter],
            ["all", panel.all],
          ]}
        />
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
              {visible.length} {panel.records} · {panel.oldestFirst}
            </span>
          </DataToolbar>
          {query.error ? <PanelError compact message={query.error} /> : null}
          <PanelFeedback success={feedback} />
          {!rows.length ? (
            <div className="pn-card">
              <PanelEmpty
                title={
                  filter === "pending" && !search
                    ? yonetimApp.emptyApprovalsTitle
                    : panel.noResults
                }
                body={
                  filter === "pending" && !search
                    ? yonetimApp.emptyApprovalsBody
                    : panel.noResultsBody
                }
              />
            </div>
          ) : (
            <div className="pn-list">
              {rows.map((row) => (
                <article className="pn-record" key={row.key}>
                  <div className="pn-record-head">
                    <div>
                      <h3>{row.name}</h3>
                      <p>
                        {row.kind === "business"
                          ? panel.businessRecord
                          : panel.applicationRecord}
                      </p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="pn-record-meta">
                    <span>{row.place}</span>
                    <span>{row.category}</span>
                    <span>{formatWhen(row.createdAt)}</span>
                  </div>
                  {row.kind === "application" ? (
                    <p className="pn-record-notes">{panel.applicationNote}</p>
                  ) : null}
                  <div className="pn-record-actions">
                    <button
                      type="button"
                      className="am-btn am-btn--ghost am-btn--sm"
                      onClick={() => setDetail(row)}
                    >
                      {panel.details}
                    </button>
                    {actions(row)}
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
      <BottomSheet
        open={Boolean(detail)}
        onClose={() => setDetail(null)}
        title={detail?.name ?? panel.details}
        closeLabel={panel.close}
        className="pn-confirm-sheet"
      >
        {detail ? (
          <>
            <dl className="pn-record-details">
              <div>
                <dt>{panel.source}</dt>
                <dd>
                  {detail.kind === "business"
                    ? panel.businessRecord
                    : panel.applicationRecord}
                </dd>
              </div>
              <div>
                <dt>{panel.status}</dt>
                <dd>
                  <StatusBadge status={detail.status} />
                </dd>
              </div>
              <div>
                <dt>{yonetimApp.colCity}</dt>
                <dd>{detail.place}</dd>
              </div>
              <div>
                <dt>{yonetimApp.colCategory}</dt>
                <dd>{detail.category}</dd>
              </div>
              <div>
                <dt>{panel.contact}</dt>
                <dd>{detail.contact ?? "—"}</dd>
              </div>
              <div>
                <dt>{yonetimApp.colDate}</dt>
                <dd>{formatWhen(detail.createdAt)}</dd>
              </div>
            </dl>
            {detail.kind === "application" ? (
              <p className="pn-lead">{panel.applicationNote}</p>
            ) : null}
            <div className="pn-record-actions">{actions(detail)}</div>
          </>
        ) : null}
      </BottomSheet>
    </>
  );
}
