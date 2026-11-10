import { formatInNicosia } from "@ada-merkez/shared";

export function formatWhen(iso: string | Date) {
  const date = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(date.getTime())) return "—";
  return formatInNicosia(date);
}
