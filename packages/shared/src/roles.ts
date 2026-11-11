export const SESSION_ROLES = ["customer", "business", "admin"] as const;
export type SessionRole = (typeof SESSION_ROLES)[number];

export function isSessionRole(value: unknown): value is SessionRole {
  return value === "customer" || value === "business" || value === "admin";
}
