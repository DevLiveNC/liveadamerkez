import type { SessionRole } from "@ada-merkez/shared";

export type BusinessMe = {
  user: {
    id: string;
    phone: string;
    email: string | null;
    displayName: string | null;
    role: SessionRole;
  };
  membership: { tenantId: string; memberRole: string } | null;
  business: {
    id: string;
    name: string;
    slug: string;
    status: string;
    timezone: string;
    phone: string | null;
    email: string | null;
    whatsapp: string | null;
    address: string | null;
    description: string | null;
    cityName: string | null;
    sector: string | null;
    inTurkey: boolean;
    categoryId: string | null;
    locationId: string | null;
  } | null;
};

export type ServiceRow = {
  id: string;
  name: string;
  durationMinutes: number;
  staffId: string | null;
  priceLabel: string | null;
  description: string | null;
  active: boolean;
};

export type StaffRow = {
  id: string;
  name: string;
  active: boolean;
};

export type AvailabilityRow = {
  id: string;
  staffId: string | null;
  weekday: number | null;
  startsAtMinutes: number;
  endsAtMinutes: number;
};

export type BookingRow = {
  id: string;
  status: "pending" | "confirmed" | "cancelled" | "no_show";
  kind: "slot" | "table";
  startsAt: string;
  endsAt: string;
  channel: "app" | "whatsapp";
  customerName: string | null;
  notes: string | null;
  serviceId: string | null;
  staffId: string | null;
};

export type SlotCell = {
  startsAt: string;
  endsAt: string;
  status: "free" | "busy";
  staffId: string | null;
};

export type StatsRow = {
  todayConfirmed: number;
  todayPending: number;
  weekConfirmed: number;
  pendingIncoming: number;
};

import { panel } from "@ada-merkez/copy";
import { panelRequest } from "./panel-api";

function request<T>(path: string, init?: RequestInit): Promise<T> {
  return panelRequest<T>(`/app/api/isletme${path.replace(/^\/v1/, "")}`, init);
}

export async function fetchMe() {
  return request<{ ok: true; me: BusinessMe }>(`/v1/business/me`);
}

export async function registerBusiness(input: {
  name: string;
  sector: "kuafor" | "klinik" | "restoran" | "diger";
  city?: "lefkosa" | "girne" | "magusa" | "diger";
  inTurkey: boolean;
  contactName: string;
  phone: string;
  email?: string;
  whatsapp?: string;
  notes?: string;
}) {
  return request<{ ok: true; me: BusinessMe; token?: string }>(
    `/v1/business/register`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export type BusinessProfile = NonNullable<BusinessMe["business"]>;

export async function patchBusiness(input: Record<string, unknown>) {
  return request<{ ok: true; business: BusinessProfile }>(`/v1/business/me`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function fetchServices() {
  return request<{ ok: true; services: ServiceRow[] }>(`/v1/business/services`);
}

export async function createService(input: {
  name: string;
  durationMinutes: number;
  staffId?: string | null;
  priceLabel?: string | null;
  description?: string | null;
}) {
  return request<{ ok: true; service: ServiceRow }>(`/v1/business/services`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function patchService(id: string, input: Record<string, unknown>) {
  return request<{ ok: true; service: ServiceRow }>(
    `/v1/business/services/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function removeService(id: string) {
  return request<{ ok: true }>(`/v1/business/services/${id}`, {
    method: "DELETE",
  });
}

export async function fetchStaff() {
  return request<{ ok: true; staff: StaffRow[] }>(`/v1/business/staff`);
}

export async function createStaff(name: string) {
  return request<{ ok: true; staff: StaffRow }>(`/v1/business/staff`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function patchStaff(
  id: string,
  input: { name?: string; active?: boolean },
) {
  return request<{ ok: true; staff: StaffRow }>(`/v1/business/staff/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function fetchAvailability() {
  return request<{ ok: true; rules: AvailabilityRow[] }>(
    `/v1/business/availability`,
  );
}

export async function createAvailability(input: {
  staffId?: string | null;
  weekday: number;
  startsAtMinutes: number;
  endsAtMinutes: number;
}) {
  return request<{ ok: true; rule: AvailabilityRow }>(
    `/v1/business/availability`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function removeAvailability(id: string) {
  return request<{ ok: true }>(`/v1/business/availability/${id}`, {
    method: "DELETE",
  });
}

export async function fetchBookings(query: {
  from?: string;
  to?: string;
  channel?: "app" | "whatsapp";
  status?: BookingRow["status"];
}) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  if (query.channel) params.set("channel", query.channel);
  if (query.status) params.set("status", query.status);
  const suffix = params.toString() ? `?${params}` : "";
  return request<{ ok: true; bookings: BookingRow[] }>(`/v1/bookings${suffix}`);
}

export async function patchBooking(
  id: string,
  status: "confirmed" | "cancelled" | { suggestStartsAt: string },
) {
  const body = typeof status === "string" ? { status } : status;
  return request<{ ok: true; booking: BookingRow }>(`/v1/bookings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchSlots(query: {
  from?: string;
  days?: number;
  staffId?: string;
  serviceId?: string;
}) {
  const params = new URLSearchParams();
  if (query.from) params.set("from", query.from);
  if (query.days) params.set("days", String(query.days));
  if (query.staffId) params.set("staffId", query.staffId);
  if (query.serviceId) params.set("serviceId", query.serviceId);
  const suffix = params.toString() ? `?${params}` : "";
  return request<{ ok: true; slots: SlotCell[] }>(
    `/v1/business/slots${suffix}`,
  );
}

export async function fetchStats() {
  return request<{ ok: true; stats: StatsRow }>(`/v1/business/stats`);
}

export function initials(name: string | null | undefined): string {
  if (!name?.trim()) return panel.customer;
  return name
    .trim()
    .split(/\s+/)
    .map((part) => `${part[0]?.toLocaleUpperCase("tr-TR") ?? ""}.`)
    .join(" ");
}

export function formatNicosiaDate(
  iso: string,
  options?: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Nicosia",
    ...options,
  }).format(new Date(iso));
}

export function minutesToLabel(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function labelToMinutes(value: string): number {
  const [h, m] = value.split(":").map((part) => Number(part));
  return (h ?? 0) * 60 + (m ?? 0);
}
