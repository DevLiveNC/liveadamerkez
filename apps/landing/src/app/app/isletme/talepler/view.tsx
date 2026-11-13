"use client";

import { useCallback, useMemo, useState } from "react";
import { isletmeApp, panel } from "@ada-merkez/copy";
import { nicosiaDateKey } from "@ada-merkez/shared";
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
import { SuggestSlotButton } from "../../../../components/isletme/SuggestSlotButton";
import {
  IconApp,
  IconCalendar,
  IconMessage,
  IconServices,
} from "../../../../components/panel/icons";
import {
  fetchBookings,
  fetchServices,
  fetchStaff,
  formatNicosiaDate,
  initials,
  patchBooking,
  type BookingRow,
} from "../../../../lib/isletme-api";
import {
  matchesSearch,
  pageSlice,
  PANEL_PAGE_SIZE,
} from "../../../../lib/panel-workflow";

type Filter = "all" | "pending" | "confirmed" | "cancelled";
type Channel = "all" | "app" | "whatsapp";
type When = "all" | "today" | "upcoming" | "past";

export function TaleplerView() {
  const [filter, setFilter] = useState<Filter>("pending");
  const [channel, setChannel] = useState<Channel>("all");
  const [when, setWhen] = useState<When>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const loader = useCallback(async () => {
    const [bookings, services, staff] = await Promise.all([
      fetchBookings({}),
      fetchServices(),
      fetchStaff(),
    ]);
    return {
      rows: bookings.bookings,
      services: services.services,
      staff: staff.staff,
    };
  }, []);
  const query = usePanelData(loader, "business-bookings");
  const visible = useMemo(() => {
    const now = Date.now();
    const today = nicosiaDateKey(new Date());
    return (query.data?.rows ?? [])
      .filter((row) => {
        if (filter !== "all" && row.status !== filter) return false;
        if (channel !== "all" && row.channel !== channel) return false;
        if (
          when === "today" &&
          nicosiaDateKey(new Date(row.startsAt)) !== today
        )
          return false;
        if (when === "upcoming" && Date.parse(row.startsAt) < now) return false;
        if (when === "past" && Date.parse(row.endsAt) >= now) return false;
        const service = query.data?.services.find(
          (item) => item.id === row.serviceId,
        )?.name;
        return matchesSearch([row.customerName, service, row.notes], search);
      })
      .sort((a, b) =>
        when === "past"
          ? b.startsAt.localeCompare(a.startsAt)
          : a.startsAt.localeCompare(b.startsAt),
      );
  }, [query.data, filter, channel, when, search]);
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(visible.length / PANEL_PAGE_SIZE) - 1),
  );
  const rows = pageSlice(visible, safePage);
  const serviceName = (row: BookingRow) =>
    query.data?.services.find((item) => item.id === row.serviceId)?.name ??
    (row.kind === "table" ? panel.tableReservation : panel.appointment);
  const reset = () => {
    setFilter("all");
    setChannel("all");
    setWhen("all");
    setSearch("");
    setPage(0);
  };

  return (
    <>
      <PanelIntro
        eyebrow={isletmeApp.loginTitle}
        title={isletmeApp.navInboxLong}
      >
        {isletmeApp.inboxLead}
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
            ["all", panel.all],
            ["pending", panel.pending],
            ["confirmed", panel.confirmed],
            ["cancelled", panel.cancelledStatus],
          ]}
        />
      </div>
      <div className="pn-filters">
        <FilterChips
          label={panel.channel}
          value={channel}
          onChange={(value) => {
            setChannel(value);
            setPage(0);
          }}
          options={[
            ["all", panel.all],
            ["app", isletmeApp.sourceApp],
            ["whatsapp", isletmeApp.sourceWa],
          ]}
        />
        <FilterChips
          label={panel.date}
          value={when}
          onChange={(value) => {
            setWhen(value);
            setPage(0);
          }}
          options={[
            ["all", panel.allDates],
            ["today", panel.today],
            ["upcoming", panel.upcoming],
            ["past", panel.past],
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
              {visible.length} {panel.records}
            </span>
          </DataToolbar>
          {query.error ? <PanelError compact message={query.error} /> : null}
          <PanelFeedback success={feedback} />
          {!rows.length ? (
            <div className="pn-card">
              <PanelEmpty
                title={
                  search ||
                  filter !== "all" ||
                  channel !== "all" ||
                  when !== "all"
                    ? panel.noResults
                    : isletmeApp.inboxEmptyTitle
                }
                body={
                  search ||
                  filter !== "all" ||
                  channel !== "all" ||
                  when !== "all"
                    ? panel.noResultsBody
                    : isletmeApp.inboxEmptyBody
                }
              />
              <button
                type="button"
                className="am-btn am-btn--ghost am-btn--block"
                onClick={reset}
              >
                {panel.clearFilters}
              </button>
            </div>
          ) : (
            <div className="pn-list">
              {rows.map((row) => (
                <article className="pn-record" key={row.id}>
                  <div className="pn-record-head">
                    <div>
                      <h3>
                        {initials(row.customerName)} · {serviceName(row)}
                      </h3>
                      <p>
                        {row.kind === "table"
                          ? panel.tableReservation
                          : panel.appointment}
                      </p>
                    </div>
                    <StatusBadge status={row.status} />
                  </div>
                  <div className="pn-record-meta">
                    <span>
                      <IconCalendar />
                      {formatNicosiaDate(row.startsAt, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span>
                      <IconServices />
                      {query.data?.staff.find(
                        (person) => person.id === row.staffId,
                      )?.name ?? isletmeApp.staffTitle}
                    </span>
                    <span>
                      {row.channel === "whatsapp" ? (
                        <IconMessage />
                      ) : (
                        <IconApp />
                      )}
                      {row.channel === "whatsapp"
                        ? isletmeApp.sourceWa
                        : isletmeApp.sourceApp}
                    </span>
                  </div>
                  {row.notes ? (
                    <p className="pn-record-notes">
                      <strong>{panel.notes}:</strong> {row.notes}
                    </p>
                  ) : null}
                  {row.status === "pending" ? (
                    <div className="pn-record-actions">
                      <ConfirmAction
                        label={isletmeApp.approve}
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
                        label={isletmeApp.reject}
                        title={panel.cancelBooking}
                        body={panel.cancelBookingBody}
                        confirmLabel={panel.cancelBooking}
                        action={async () => {
                          await patchBooking(row.id, "cancelled");
                        }}
                        message={panel.cancelled}
                        onDone={() => {
                          setFeedback(panel.cancelled);
                          void query.refresh();
                        }}
                      />
                      <SuggestSlotButton
                        id={row.id}
                        busy={false}
                        onDone={async () => {
                          setFeedback(panel.suggestionSent);
                          await query.refresh();
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
