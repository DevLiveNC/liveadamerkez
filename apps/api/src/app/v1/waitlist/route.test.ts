import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closePool, isDatabaseConfigured, listWaitlistForExport, migrate } from "@ada-merkez/db";
import { POST } from "./route";
import { isPublicReceivedBody } from "../../../lib/public-received";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("waitlist public response does not leak identity", () => {
  const prevOpen = process.env.WAITLIST_OPEN;

  beforeAll(async () => {
    process.env.WAITLIST_OPEN = "true";
    await migrate();
  });

  afterAll(async () => {
    process.env.WAITLIST_OPEN = prevOpen;
    await closePool();
  });

  it("returns the same generic body for first and repeat submits", async () => {
    const email = `liste-${randomUUID().slice(0, 8)}@example.com`;
    const payload = {
      name: "Deneme",
      email,
      city: "lefkosa",
      segment: "yerli",
      consentGranted: true,
    };
    const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
    const first = await POST(
      new Request("http://api.test/v1/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": ip },
        body: JSON.stringify(payload),
      }),
    );
    const second = await POST(
      new Request("http://api.test/v1/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": ip },
        body: JSON.stringify(payload),
      }),
    );
    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    const firstBody = await first.json();
    const secondBody = await second.json();
    expect(isPublicReceivedBody(firstBody)).toBe(true);
    expect(secondBody).toEqual(firstBody);
    expect(firstBody).not.toHaveProperty("id");
    expect(firstBody).not.toHaveProperty("referralCode");
    expect(firstBody).not.toHaveProperty("created");
    const rows = (await listWaitlistForExport()).filter((row) => row.email === email);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.referralCode).toMatch(/^AM/);
  });
});
