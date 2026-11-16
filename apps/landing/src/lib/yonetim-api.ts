import { panelRequest } from "./panel-api";

export type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  status: string;
  cityName: string | null;
  sector: string | null;
  inTurkey: boolean;
  phone: string | null;
  createdAt: string;
  categoryName: string | null;
};

export type AdminApplication = {
  id: string;
  businessName: string;
  sector: string;
  city: string | null;
  inTurkey: boolean;
  contactName: string;
  status: string;
  createdAt: string;
};

export type AdminUser = {
  id: string;
  phone: string;
  email: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
};

export type AdminBooking = {
  id: string;
  tenantId: string;
  businessName: string;
  status: string;
  kind: string;
  startsAt: string;
  endsAt: string;
  channel: string | null;
  customerName: string | null;
  notes: string | null;
  createdAt: string;
};

export type AdminCategory = {
  id: string;
  slug: string;
  name: string;
  kind: string;
};

export type AdminReports = {
  businessesPending: number;
  businessesApproved: number;
  usersTotal: number;
  bookingsToday: number;
  applicationsTotal: number;
};

export type AdminHealth = {
  api: string;
  db: string;
  timezone: string;
  waitlistOpen: boolean;
  whatsapp: string;
  queue: string;
};

export type AuditRow = {
  id: string;
  action: string;
  entityKind: string;
  entityId: string | null;
  createdAt: string;
  actorName: string | null;
  actorPhone: string | null;
  detail?: unknown;
};

export async function fetchBusinesses(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return panelRequest<{ ok: boolean; businesses: AdminBusiness[] }>(
    `/app/api/yonetim/admin/businesses${q}`,
  );
}

export async function patchBusiness(
  id: string,
  status: "approved" | "rejected",
) {
  return panelRequest<{ ok: boolean }>(
    "/app/api/yonetim" + `/v1/admin/businesses/${id}`.replace(/^\/v1/, ""),
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
}

export async function fetchApplications(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  return panelRequest<{ ok: boolean; applications: AdminApplication[] }>(
    `/app/api/yonetim/admin/applications${q}`,
  );
}

export async function patchApplication(
  id: string,
  status: "approved" | "rejected" | "review",
) {
  return panelRequest<{ ok: boolean }>(
    "/app/api/yonetim" + `/v1/admin/applications/${id}`.replace(/^\/v1/, ""),
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
}

export async function fetchUsers() {
  return panelRequest<{ ok: boolean; users: AdminUser[] }>(
    "/app/api/yonetim/admin/users",
  );
}

export type AdminBookingCounted = {
  total: number;
  wa: number;
  app: number;
};

export type AdminBookingQuery = {
  from?: string;
  to?: string;
  tenantId?: string;
  status?: string;
  channel?: string;
};

export async function fetchBookings(query?: AdminBookingQuery) {
  const params = new URLSearchParams();
  if (query?.from) params.set("from", query.from);
  if (query?.to) params.set("to", query.to);
  if (query?.tenantId) params.set("tenantId", query.tenantId);
  if (query?.status && query.status !== "all")
    params.set("status", query.status);
  if (query?.channel && query.channel !== "all")
    params.set("channel", query.channel);
  const suffix = params.toString() ? `?${params}` : "";
  return panelRequest<{
    ok: boolean;
    bookings: AdminBooking[];
    total?: number;
    truncated?: boolean;
    counted?: AdminBookingCounted;
  }>(`/app/api/yonetim/admin/bookings${suffix}`);
}

export async function patchBooking(
  id: string,
  status: "confirmed" | "cancelled",
) {
  return panelRequest<{ ok: boolean }>(
    "/app/api/yonetim" + `/v1/admin/bookings/${id}`.replace(/^\/v1/, ""),
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
}

export async function fetchCategories() {
  return panelRequest<{ ok: boolean; categories: AdminCategory[] }>(
    "/app/api/yonetim/admin/categories",
  );
}

export async function createCategory(input: {
  name: string;
  kind: string;
  slug?: string;
}) {
  return panelRequest<{ ok: boolean }>(
    "/app/api/yonetim" + "/v1/admin/categories".replace(/^\/v1/, ""),
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}

export type DailyBookingSummary = {
  day: string;
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  noShow: number;
  app: number;
  whatsapp: number;
};
export type BookingReport = {
  from: string;
  to: string;
  days: DailyBookingSummary[];
  total: number;
  active: number;
  app: number;
  whatsapp: number;
};
export async function fetchReports(range?: { from: string; to: string }) {
  const query = range
    ? `?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`
    : "";
  return panelRequest<{
    ok: boolean;
    reports: AdminReports;
    summary?: BookingReport;
  }>(`/app/api/yonetim/admin/reports${query}`);
}

export async function fetchHealth() {
  return panelRequest<{ ok: boolean; health: AdminHealth }>(
    "/app/api/yonetim/admin/health",
  );
}

export async function fetchAudit() {
  return panelRequest<{ ok: boolean; audit: AuditRow[] }>(
    "/app/api/yonetim/admin/audit",
  );
}

export async function patchCategory(
  id: string,
  input: { name: string; kind: string },
) {
  return panelRequest<{ ok: boolean; category: AdminCategory }>(
    `/app/api/yonetim/admin/categories/${id}`,
    {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    },
  );
}
