"use client";

import { useCallback, useMemo, useState } from "react";
import { panel, yonetimApp } from "@ada-merkez/copy";
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
  fetchBookings,
  fetchBusinesses,
  patchBooking,
  type AdminBookingQuery,
} from "../../../../lib/yonetim-api";
import {
  matchesSearch,
  nicosiaDayRange,
  pageSlice,
  PANEL_PAGE_SIZE,
  validReportRange,
} from "../../../../lib/panel-workflow";
import { formatWhen } from "../../../../lib/nicosia-format";

export function RezervasyonlarView() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [channel, setChannel] = useState("all");
  const [tenantId, setTenantId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [range, setRange] = useState<{ from?: string; to?: string }>({});
  const [rangeError, setRangeError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const loader = useCallback(async () => {
    const query: AdminBookingQuery = {
      ...range,
      status,
      channel,
      tenantId: tenantId || undefined,
    };
    const [bookings, businesses] = await Promise.all([
      fetchBookings(query),
      fetchBusinesses(),
    ]);
    return { ...bookings, businesses: businesses.businesses };
  }, [range, status, channel, tenantId]);
  const query = usePanelData(
    loader,
    `admin-bookings:${JSON.stringify(range)}:${status}:${channel}:${tenantId}`,
  );
  const visible = useMemo(
    () =>
      (query.data?.bookings ?? []).filter((row) =>
        matchesSearch([row.businessName, row.customerName, row.notes], search),
      ),
    [query.data, search],
  );
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(visible.length / PANEL_PAGE_SIZE) - 1),
  );
  function applyRange() {
    if (!from && !to) {
      setRange({});
      setRangeError(null);
      setPage(0);
      return;
    }
    if (!validReportRange(from, to)) {
      setRangeError(panel.invalidRange);
      return;
    }
    const start = nicosiaDayRange(from),
      end = nicosiaDayRange(to);
    if (!start || !end) {
      setRangeError(panel.invalidRange);
      return;
    }
    setRangeError(null);
    setPage(0);
    setRange({ from: start.from, to: end.to });
  }
  return (
    <>
      <PanelIntro
        eyebrow={yonetimApp.panelName}
        title={yonetimApp.bookingsTitle}
      >
        {yonetimApp.bookingsLead}
      </PanelIntro>
      <form
        className="pn-range"
        onSubmit={(event) => {
          event.preventDefault();
          applyRange();
        }}
      >
        <div className="pn-field">
          <label htmlFor="admin-booking-business">{panel.business}</label>
          <select
            id="admin-booking-business"
            value={tenantId}
            onChange={(event) => {
              setTenantId(event.target.value);
              setPage(0);
            }}
          >
            <option value="">{panel.allBusinesses}</option>
            {query.data?.businesses.map((row) => (
              <option key={row.id} value={row.id}>
                {row.name}
              </option>
            ))}
          </select>
        </div>
        <div className="pn-field">
          <label htmlFor="admin-booking-from">{panel.from}</label>
          <input
            id="admin-booking-from"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>
        <div className="pn-field">
          <label htmlFor="admin-booking-to">{panel.to}</label>
          <input
            id="admin-booking-to"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>
        <button type="submit" className="am-btn am-btn--ghost">
          {panel.applyRange}
        </button>
      </form>
      <PanelFeedback error={rangeError} />
      <div className="pn-filters">
        <SearchField
          placeholder={panel.searchLoadedHint}
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(0);
          }}
        />
        <FilterChips
          value={status}
          onChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
          options={[
            ["all", panel.all],
            ["pending", panel.pending],
            ["confirmed", panel.confirmed],
            ["cancelled", panel.cancelledStatus],
            ["no_show", panel.noShow],
          ]}
        />
      </div>
      <FilterChips
        label={panel.channel}
        value={channel}
        onChange={(value) => {
          setChannel(value);
          setPage(0);
        }}
        options={[
          ["all", panel.all],
          ["app", yonetimApp.channelApp],
          ["whatsapp", yonetimApp.channelWhatsapp],
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
              {panel.shownRecords}: {query.data.bookings.length} /{" "}
              {query.data.total ?? query.data.bookings.length}
            </span>
          </DataToolbar>
          {query.data.truncated ? (
            <p className="pn-lead">
              {yonetimApp.listTruncated} {panel.reportFullHint}
            </p>
          ) : null}
          {query.error ? <PanelError compact message={query.error} /> : null}
          <PanelFeedback success={feedback} />
          {!visible.length ? (
            <div className="pn-card">
              <PanelEmpty
                title={search ? panel.noResults : yonetimApp.emptyBookingsTitle}
                body={
                  search ? panel.noResultsBody : yonetimApp.emptyBookingsBody
                }
              />
            </div>
          ) : (
            <div className="pn-list">
              {pageSlice(visible, safePage).map((row) => (
                <article className="pn-record" key={row.id}>
                  <div className="pn-record-head">
                    <div>
                      <h3>{row.businessName}</h3>
                      <p>{row.customerName ?? "—"}</p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="pn-record-meta">
                    <span>{formatWhen(row.startsAt)}</span>
                    <span>
                      {row.channel === "whatsapp"
                        ? yonetimApp.channelWhatsapp
                        : yonetimApp.channelApp}
                    </span>
                    <span>
                      {row.kind === "table" ? panel.table : panel.appointment}
                    </span>
                  </div>
                  {row.notes ? (
                    <p className="pn-record-notes">{row.notes}</p>
                  ) : null}
                  {row.status === "pending" ? (
                    <div className="pn-record-actions">
                      <ConfirmAction
                        label={yonetimApp.approve}
                        title={panel.approveBooking}
                        body={panel.approveBookingBody}
                        className="am-btn am-btn--primary am-btn--sm"
                        action={async () => {
                          await patchBooking(row.id, "confirmed");
                        }}
                        message={panel.approved}
                        onDone={() => {
                          setFeedback(panel.approved);
                          void query.refresh();
                        }}
                      />
                      <ConfirmAction
                        label={panel.cancelBooking}
                        title={panel.cancelBooking}
                        body={panel.cancelBookingBody}
                        action={async () => {
                          await patchBooking(row.id, "cancelled");
                        }}
                        message={panel.cancelled}
                        onDone={() => {
                          setFeedback(panel.cancelled);
                          void query.refresh();
                        }}
                      />
                    </div>
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
