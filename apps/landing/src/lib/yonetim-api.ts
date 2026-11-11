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
};

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json()) as T & { ok?: boolean };
  if (!res.ok) throw new Error("İstek başarısız.");
  return body;
}

function yonetimFetch(path: string, init?: RequestInit) {
  return fetch(`/app/api/yonetim${path.replace(/^\/v1/, "")}`, {
    ...init,
    credentials: "same-origin",
    cache: "no-store",
  });
}

export async function fetchBusinesses(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await yonetimFetch(`/v1/admin/businesses${q}`);
  return parse<{ ok: boolean; businesses: AdminBusiness[] }>(res);
}

export async function patchBusiness(id: string, status: "approved" | "rejected") {
  const res = await yonetimFetch(`/v1/admin/businesses/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parse<{ ok: boolean }>(res);
}

export async function fetchApplications(status?: string) {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await yonetimFetch(`/v1/admin/applications${q}`);
  return parse<{ ok: boolean; applications: AdminApplication[] }>(res);
}

export async function patchApplication(id: string, status: "approved" | "rejected" | "review") {
  const res = await yonetimFetch(`/v1/admin/applications/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parse<{ ok: boolean }>(res);
}

export async function fetchUsers() {
  const res = await yonetimFetch("/v1/admin/users");
  return parse<{ ok: boolean; users: AdminUser[] }>(res);
}

export async function fetchBookings(query?: { from?: string; to?: string }) {
  const params = new URLSearchParams();
  if (query?.from) params.set("from", query.from);
  if (query?.to) params.set("to", query.to);
  const suffix = params.toString() ? `?${params}` : "";
  const res = await yonetimFetch(`/v1/admin/bookings${suffix}`);
  return parse<{ ok: boolean; bookings: AdminBooking[] }>(res);
}

export async function patchBooking(id: string, status: "confirmed" | "cancelled") {
  const res = await yonetimFetch(`/v1/admin/bookings/${id}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
  return parse<{ ok: boolean }>(res);
}

export async function fetchCategories() {
  const res = await yonetimFetch("/v1/admin/categories");
  return parse<{ ok: boolean; categories: AdminCategory[] }>(res);
}

export async function createCategory(input: { name: string; kind: string; slug?: string }) {
  const res = await yonetimFetch("/v1/admin/categories", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<{ ok: boolean }>(res);
}

export async function fetchReports() {
  const res = await yonetimFetch("/v1/admin/reports");
  return parse<{ ok: boolean; reports: AdminReports }>(res);
}

export async function fetchHealth() {
  const res = await yonetimFetch("/v1/admin/health");
  return parse<{ ok: boolean; health: AdminHealth }>(res);
}

export async function fetchAudit() {
  const res = await yonetimFetch("/v1/admin/audit");
  return parse<{ ok: boolean; audit: AuditRow[] }>(res);
}
