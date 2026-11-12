/** Keşif ekranındaki pilot şehirler.
 *  Şehir adları veridir; tanıtım kopyası değildir. */
export type PilotCity = { slug: string; name: string };

export const PILOT_CITIES: readonly PilotCity[] = [
  { slug: "lefkosa", name: "Lefkoşa" },
  { slug: "girne", name: "Girne" },
  { slug: "magusa", name: "Mağusa" },
];

const FOLD: Record<string, string> = {
  ı: "i",
  İ: "i",
  ğ: "g",
  Ğ: "g",
  ş: "s",
  Ş: "s",
  ç: "c",
  Ç: "c",
  ö: "o",
  Ö: "o",
  ü: "u",
  Ü: "u",
  â: "a",
  î: "i",
  û: "u",
};

/** Türkçe harf duyarlı, aksan katlamalı şehir eşleşmesi. */
export function normalizeCity(value: string): string {
  return value
    .trim()
    .replace(/[ıİğĞşŞçÇöÖüÜâîû]/g, (char) => FOLD[char] ?? char)
    .toLocaleLowerCase("tr-TR");
}

export function matchesCity(city: string | null | undefined, wanted: string): boolean {
  if (!wanted) return true;
  if (!city) return false;
  return normalizeCity(city) === normalizeCity(wanted);
}

export function cityName(value: string | undefined): string {
  if (!value) return "";
  const hit = PILOT_CITIES.find((city) => normalizeCity(city.name) === normalizeCity(value));
  return hit ? hit.name : "";
}
