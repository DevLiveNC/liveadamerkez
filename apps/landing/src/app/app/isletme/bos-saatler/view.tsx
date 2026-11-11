"use client";

import { useEffect, useMemo, useState } from "react";
import { isletmeApp } from "@ada-merkez/copy";
import { nicosiaWallTimeToUtc, utcToNicosiaParts } from "@ada-merkez/shared";
import { EmptyKabuki } from "../../../../components/isletme/EmptyKabuki";
import { fetchSlots, formatNicosiaDate, type SlotCell } from "../../../../lib/isletme-api";

export function BosSaatlerView() {
  const [slots, setSlots] = useState<SlotCell[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const from = nicosiaWallTimeToUtc(
      utcToNicosiaParts(new Date()).year,
      utcToNicosiaParts(new Date()).month,
      utcToNicosiaParts(new Date()).day,
      0,
      0,
    );
    void fetchSlots({ from: from.toISOString(), days: 6 })
      .then((data) => {
        setSlots(data.slots);
        setLoaded(true);
      })
      .catch(() => {
        setError(true);
        setLoaded(true);
      });
  }, []);

  const grid = useMemo(() => buildGrid(slots), [slots]);

  if (!loaded) return <div className="isletme-head" />;
  if (error) return <EmptyKabuki kind="hata" />;

  return (
    <div>
      <div className="isletme-head">
        <h1>{isletmeApp.slotsTitle}</h1>
        <p className="t-sm t-muted">{isletmeApp.slotsLead}</p>
        <div className="day-nav">
          <span className="chip" style={{ background: "var(--am-status-free-bg)", color: "var(--am-status-free-fg)" }}>
            {isletmeApp.free}
          </span>
          <span className="chip">{isletmeApp.busy}</span>
        </div>
      </div>
      {slots.length === 0 ? (
        <EmptyKabuki
          kind="sonuc-yok"
          title={isletmeApp.slotsEmptyTitle}
          body={isletmeApp.slotsEmptyBody}
        />
      ) : (
        <div className="week">
          <div />
          {grid.days.map((day) => (
            <div key={day} className="dhead">
              {formatNicosiaDate(day, { weekday: "short", day: "numeric" })}
            </div>
          ))}
          {grid.times.map((time) => (
            <SlotRow key={time} time={time} days={grid.days} cells={grid.cells} />
          ))}
        </div>
      )}
    </div>
  );
}

function SlotRow({
  time,
  days,
  cells,
}: {
  time: string;
  days: string[];
  cells: Map<string, "free" | "busy">;
}) {
  return (
    <>
      <div className="dhead" style={{ textAlign: "right", paddingRight: 8 }}>
        {time}
      </div>
      {days.map((day) => {
        const key = `${day}|${time}`;
        const status = cells.get(key);
        if (!status) return <div key={key} className="cell" />;
        return (
          <div key={key} className={`cell ${status}`}>
            {status === "busy" ? "—" : time}
          </div>
        );
      })}
    </>
  );
}

function buildGrid(slots: SlotCell[]) {
  const days: string[] = [];
  const times = new Set<string>();
  const cells = new Map<string, "free" | "busy">();
  for (const slot of slots) {
    const day = new Date(slot.startsAt);
    const dayKey = nicosiaWallTimeToUtc(
      utcToNicosiaParts(day).year,
      utcToNicosiaParts(day).month,
      utcToNicosiaParts(day).day,
      0,
      0,
    ).toISOString();
    if (!days.includes(dayKey)) days.push(dayKey);
    const time = formatNicosiaDate(slot.startsAt, { hour: "2-digit", minute: "2-digit" });
    times.add(time);
    const key = `${dayKey}|${time}`;
    const prev = cells.get(key);
    if (prev === "busy" || slot.status === "busy") cells.set(key, "busy");
    else cells.set(key, "free");
  }
  days.sort();
  return { days: days.slice(0, 6), times: [...times].sort(), cells };
}
