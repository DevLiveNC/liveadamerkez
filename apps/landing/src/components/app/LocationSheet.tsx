"use client";

import { app, ui } from "@ada-merkez/copy";
import { BottomSheet, UiIcon } from "@ada-merkez/ui";
import { PILOT_CITIES, normalizeCity } from "../../lib/pilot-cities";

/** Konum seçici. Seçim URL'e `sehir` olarak yazılır; keşif listesi
 *  bu değere göre süzülür — yeni bir uç nokta gerekmez. */
export function LocationSheet({
  open,
  onClose,
  selected,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  selected: string;
  onSelect: (city: string) => void;
}) {
  const current = selected ? normalizeCity(selected) : "";
  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={app.locationPicker}
      titleId="konum-baslik"
      closeLabel={ui.close}
      className="atla-loc-sheet"
    >
      <div className="atla-loc-list" role="group" aria-label={app.locationPicker}>
        {PILOT_CITIES.map((city) => {
          const on = current === normalizeCity(city.name);
          return (
            <button
              key={city.slug}
              type="button"
              className="atla-loc-option"
              aria-pressed={on}
              onClick={() => onSelect(city.name)}
            >
              <span>{city.name}</span>
              {on ? <UiIcon name="pin" className="am-icon am-icon-sm" /> : null}
            </button>
          );
        })}
        <button
          type="button"
          className="atla-loc-option"
          aria-pressed={!current}
          onClick={() => onSelect("")}
        >
          <span>{app.seeAll}</span>
        </button>
      </div>
    </BottomSheet>
  );
}
