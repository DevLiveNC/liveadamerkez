export const ANALYTICS_EVENTS = {
  page_view: "page_view",
  waitlist_submit: "waitlist_submit",
  business_apply_submit: "business_apply_submit",
  sign_up: "sign_up",
  search: "search",
  view_business: "view_business",
  begin_booking: "begin_booking",
  booking_confirmed: "booking_confirmed",
  booking_cancelled: "booking_cancelled",
  whatsapp_click: "whatsapp_click",
  whatsapp_booking_confirmed: "whatsapp_booking_confirmed",
  qr_landing: "qr_landing",
  cta_click: "cta_click",
  referral_share: "referral_share",
  referral_signup: "referral_signup",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

export const META_EVENT_MAP: Record<string, string> = {
  page_view: "PageView",
  waitlist_submit: "Lead",
  business_apply_submit: "Lead",
  sign_up: "CompleteRegistration",
  booking_confirmed: "Schedule",
  whatsapp_booking_confirmed: "Schedule",
  search: "Search",
  view_business: "ViewContent",
  begin_booking: "InitiateCheckout",
};

export type AnalyticsParams = {
  city?: string | null;
  segment?: string | null;
  channel?: string | null;
  business_id?: string | null;
  ref?: string | null;
  content?: string | null;
  event_id: string;
};
