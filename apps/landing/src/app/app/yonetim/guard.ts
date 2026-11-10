import { requireRole } from "../../../lib/app-auth";

export async function requireYonetimPanel(nextPath: string) {
  return requireRole("admin", nextPath);
}
