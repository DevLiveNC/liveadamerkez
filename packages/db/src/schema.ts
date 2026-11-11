import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "no_show",
]);

export const bookingKindEnum = pgEnum("booking_kind", ["slot", "table"]);

export const waitlistRoleEnum = pgEnum("waitlist_role", [
  "customer",
  "business",
]);

export const appRoleEnum = pgEnum("app_role", ["customer", "business", "admin"]);

export const businessStatusEnum = pgEnum("business_status", [
  "draft",
  "pending",
  "approved",
  "rejected",
]);

export const category = pgTable("category", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  kind: text("kind").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const location = pgTable("location", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id"),
  name: text("name").notNull(),
  cityName: text("city_name"),
  kind: text("kind").notNull().default("city"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const business = pgTable("business", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  categoryId: uuid("category_id").references(() => category.id),
  locationId: uuid("location_id").references(() => location.id),
  status: businessStatusEnum("status").notNull().default("draft"),
  timezone: text("timezone").notNull().default("Europe/Nicosia"),
  sample: boolean("sample").notNull().default(false),
  phone: text("phone"),
  email: text("email"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  description: text("description"),
  cityName: text("city_name"),
  sector: text("sector"),
  inTurkey: boolean("in_turkey").notNull().default(false),
  ownerUserId: uuid("owner_user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const staff = pgTable("staff", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => business.id),
  locationId: uuid("location_id").references(() => location.id),
  name: text("name").notNull(),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const service = pgTable("service", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => business.id),
  name: text("name").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  staffId: uuid("staff_id").references(() => staff.id),
  priceLabel: text("price_label"),
  description: text("description"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const resource = pgTable("resource", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => business.id),
  locationId: uuid("location_id").references(() => location.id),
  name: text("name").notNull(),
  kind: text("kind").notNull().default("table"),
  seats: integer("seats"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const availabilityRule = pgTable(
  "availability_rule",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => business.id),
    staffId: uuid("staff_id").references(() => staff.id),
    resourceId: uuid("resource_id").references(() => resource.id),
    weekday: smallint("weekday"),
    startsAtMinutes: integer("starts_at_minutes").notNull(),
    endsAtMinutes: integer("ends_at_minutes").notNull(),
    timezone: text("timezone").notNull().default("Europe/Nicosia"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check(
      "availability_minutes",
      sql`${t.startsAtMinutes} >= 0 AND ${t.endsAtMinutes} > ${t.startsAtMinutes} AND ${t.endsAtMinutes} <= 1440`,
    ),
  ],
);

export const appAccount = pgTable(
  "app_account",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").notNull(),
    email: text("email"),
    name: text("name"),
    role: appRoleEnum("role").notNull(),
    tenantId: uuid("tenant_id").references(() => business.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("app_account_phone_role").on(t.phone, t.role),
    uniqueIndex("app_account_email_role").on(t.email, t.role),
  ],
);

export const businessMember = pgTable(
  "business_member",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => appAccount.id),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => business.id),
    memberRole: text("member_role").notNull().default("owner"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("business_member_user_tenant").on(t.userId, t.tenantId)],
);

export const customer = pgTable(
  "customer",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => business.id),
    phone: text("phone").notNull(),
    name: text("name"),
    firstTouch: jsonb("first_touch"),
    lastTouch: jsonb("last_touch"),
    referralCode: text("referral_code"),
    referredByCode: text("referred_by_code"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("customer_tenant_phone").on(t.tenantId, t.phone)],
);

export const consent = pgTable("consent", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => business.id),
  subjectType: text("subject_type").notNull(),
  subjectId: uuid("subject_id"),
  purpose: text("purpose").notNull(),
  granted: boolean("granted").notNull(),
  grantedAt: timestamp("granted_at", { withTimezone: true }).notNull().defaultNow(),
  textVersion: text("text_version").notNull(),
  channel: text("channel").notNull().default("web"),
  retentionDays: integer("retention_days").notNull(),
  retainUntil: timestamp("retain_until", { withTimezone: true }).notNull(),
  withdrawnAt: timestamp("withdrawn_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const booking = pgTable(
  "booking",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => business.id),
    locationId: uuid("location_id").references(() => location.id),
    kind: bookingKindEnum("kind").notNull(),
    staffId: uuid("staff_id").references(() => staff.id),
    serviceId: uuid("service_id").references(() => service.id),
    resourceId: uuid("resource_id").references(() => resource.id),
    customerId: uuid("customer_id").references(() => customer.id),
    accountId: uuid("account_id").references(() => appAccount.id),
    status: bookingStatusEnum("status").notNull().default("pending"),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    displayTimezone: text("display_timezone").notNull().default("Europe/Nicosia"),
    notes: text("notes"),
    channel: text("channel").notNull().default("app"),
    customerName: text("customer_name"),
    customerPhone: text("customer_phone"),
    firstTouch: jsonb("first_touch"),
    lastTouch: jsonb("last_touch"),
    referredByCode: text("referred_by_code"),
    eventId: text("event_id"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    check("booking_time_order", sql`${t.endsAt} > ${t.startsAt}`),
    index("booking_tenant_starts_idx").on(t.tenantId, t.startsAt),
    index("booking_account_idx").on(t.accountId),
  ],
);

export const favorite = pgTable(
  "favorite",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => appAccount.id),
    tenantId: uuid("tenant_id")
      .notNull()
      .references(() => business.id),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("favorite_account_tenant").on(t.accountId, t.tenantId)],
);

export const waitlistEntry = pgTable("waitlist_entry", {
  id: uuid("id").primaryKey().defaultRandom(),
  role: waitlistRoleEnum("role").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  city: text("city"),
  segment: text("segment"),
  consentId: uuid("consent_id")
    .notNull()
    .references(() => consent.id),
  firstTouch: jsonb("first_touch"),
  lastTouch: jsonb("last_touch"),
  referralCode: text("referral_code"),
  referredByCode: text("referred_by_code"),
  eventId: text("event_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const businessApplication = pgTable("business_application", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  sector: text("sector").notNull(),
  city: text("city"),
  inTurkey: boolean("in_turkey").notNull().default(false),
  includeInDiscovery: boolean("include_in_discovery").notNull().default(false),
  contactName: text("contact_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  whatsapp: text("whatsapp"),
  notes: text("notes"),
  consentId: uuid("consent_id")
    .notNull()
    .references(() => consent.id),
  firstTouch: jsonb("first_touch"),
  lastTouch: jsonb("last_touch"),
  referralCode: text("referral_code"),
  referredByCode: text("referred_by_code"),
  eventId: text("event_id"),
  status: text("status").notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const referral = pgTable("referral", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code").notNull().unique(),
  ownerKind: text("owner_kind").notNull(),
  ownerId: uuid("owner_id").notNull(),
  clickCount: integer("click_count").notNull().default(0),
  signupCount: integer("signup_count").notNull().default(0),
  firstBookingAt: timestamp("first_booking_at", { withTimezone: true }),
  hookStatus: text("hook_status").notNull().default("issued"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const analyticsDispatch = pgTable(
  "analytics_dispatch",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventName: text("event_name").notNull(),
    eventId: text("event_id").notNull(),
    channel: text("channel"),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("analytics_dispatch_event_id").on(t.eventId, t.eventName)],
);

export const deletionRequest = pgTable("deletion_request", {
  id: uuid("id").primaryKey().defaultRandom(),
  phone: text("phone"),
  email: text("email"),
  status: text("status").notNull().default("received"),
  details: text("details"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  processedAt: timestamp("processed_at", { withTimezone: true }),
});

export const appNotification = pgTable(
  "app_notification",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    accountId: uuid("account_id")
      .notNull()
      .references(() => appAccount.id),
    type: text("type").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    bookingId: uuid("booking_id").references(() => booking.id),
    payload: jsonb("payload"),
    channel: text("channel").notNull().default("in_app"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("app_notification_account_idx").on(t.accountId, t.createdAt)],
);

export const otpChallenge = pgTable(
  "otp_challenge",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    phone: text("phone").notNull(),
    purpose: text("purpose").notNull().default("login"),
    codeHash: text("code_hash"),
    ipHash: text("ip_hash"),
    sendCount: integer("send_count").notNull().default(0),
    attemptCount: integer("attempt_count").notNull().default(0),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    lastSentAt: timestamp("last_sent_at", { withTimezone: true }),
    lockedUntil: timestamp("locked_until", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("otp_phone_purpose_idx").on(t.phone, t.purpose)],
);

export const otpIpWindow = pgTable("otp_ip_window", {
  ipHash: text("ip_hash").primaryKey(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  sendCount: integer("send_count").notNull().default(0),
  lockedUntil: timestamp("locked_until", { withTimezone: true }),
});

export const rateLimitWindow = pgTable("rate_limit_window", {
  key: text("key").primaryKey(),
  windowStartedAt: timestamp("window_started_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  hitCount: integer("hit_count").notNull().default(0),
});

export const auditLog = pgTable(
  "audit_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    actorUserId: uuid("actor_user_id").references(() => appAccount.id),
    action: text("action").notNull(),
    entityKind: text("entity_kind").notNull(),
    entityId: uuid("entity_id"),
    detail: jsonb("detail"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("audit_log_created_idx").on(t.createdAt)],
);
