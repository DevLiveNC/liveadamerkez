import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { closePool, isDatabaseConfigured, migrate } from "@ada-merkez/db";
import { POST } from "./route";
import { isPublicReceivedBody } from "../../../lib/public-received";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("business apply public response does not leak identity", () => {
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
    const phone = `+90532${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const payload = {
      businessName: "Deneme işletme",
      sector: "kuafor",
      inTurkey: false,
      city: "girne",
      contactName: "Yetkili",
      phone,
      email: `biz-${randomUUID().slice(0, 8)}@example.com`,
      consentGranted: true,
    };
    const ip = `198.51.100.${Math.floor(Math.random() * 200) + 1}`;
    const first = await POST(
      new Request("http://api.test/v1/business-applications", {
        method: "POST",
        headers: { "content-type": "application/json", "x-real-ip": ip },
        body: JSON.stringify(payload),
      }),
    );
    const second = await POST(
      new Request("http://api.test/v1/business-applications", {
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
  });
});
