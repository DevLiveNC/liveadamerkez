import { apiMessages } from "@ada-merkez/copy";

export const RECEIVED_RESPONSE = {
  ok: true as const,
  message: apiMessages.received,
};

export function isPublicReceivedBody(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const value = body as Record<string, unknown>;
  const keys = Object.keys(value).sort();
  return (
    value.ok === true &&
    value.message === apiMessages.received &&
    keys.length === 2 &&
    keys[0] === "message" &&
    keys[1] === "ok"
  );
}
