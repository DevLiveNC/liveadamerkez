import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { TenantAccessError } from "@ada-merkez/shared";
import { closePool, isDatabaseConfigured } from "./client.js";
import { migrate } from "./migrate.js";
import {
  createServiceForTenant,
  findOrCreateUser,
  registerBusiness,
  updateServiceForTenant,
} from "./isletme.js";

const hasDb = isDatabaseConfigured();

describe.skipIf(!hasDb)("işletme kiracı ayrımı", () => {
  beforeAll(async () => {
    await migrate();
  });

  afterAll(async () => {
    await closePool();
  });

  it("hizmet başka kiracıdan okunamaz veya güncellenemez", async () => {
    const phoneA = `+90535${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const phoneB = `+90536${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const userA = await findOrCreateUser({ phone: phoneA, displayName: "A" });
    const userB = await findOrCreateUser({ phone: phoneB, displayName: "B" });
    const snapA = await registerBusiness({
      userId: userA.id,
      name: "İşletme A",
      sector: "kuafor",
      city: "lefkosa",
      inTurkey: false,
      contactName: "A",
      phone: phoneA,
    });
    const snapB = await registerBusiness({
      userId: userB.id,
      name: "İşletme B",
      sector: "klinik",
      city: "girne",
      inTurkey: false,
      contactName: "B",
      phone: phoneB,
    });
    const tenantA = snapA?.membership?.tenantId;
    const tenantB = snapB?.membership?.tenantId;
    expect(tenantA).toBeTruthy();
    expect(tenantB).toBeTruthy();
    const service = await createServiceForTenant(tenantA!, userA.id, {
      name: "Kesim",
      durationMinutes: 30,
      priceLabel: "250 TL",
    });
    expect(service.priceLabel).toBe("250 TL");
    await expect(
      updateServiceForTenant(tenantB!, userB.id, service.id, { name: "Ele geçirme" }),
    ).rejects.toBeInstanceOf(TenantAccessError);
    await expect(
      createServiceForTenant(tenantA!, userB.id, { name: "Kaçak", durationMinutes: 15 }),
    ).rejects.toBeInstanceOf(TenantAccessError);
  });

  it("kayıtta admin rolü yazılmaz", async () => {
    const phone = `+90537${Math.floor(Math.random() * 1_000_000)
      .toString()
      .padStart(7, "0")}`;
    const user = await findOrCreateUser({ phone, displayName: "C" });
    expect(user.role).toBe("customer");
    const snap = await registerBusiness({
      userId: user.id,
      name: `Kayıt ${randomUUID().slice(0, 6)}`,
      sector: "restoran",
      city: "magusa",
      inTurkey: false,
      contactName: "C",
      phone,
    });
    expect(snap?.user.role).toBe("business");
    expect(snap?.user.role).not.toBe("admin");
    expect(snap?.business?.status).toBe("pending");
  });
});
