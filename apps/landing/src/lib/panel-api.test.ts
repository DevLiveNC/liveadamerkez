import { afterEach, describe, expect, it, vi } from "vitest";
import {
  PanelApiError,
  panelErrorMessage,
  panelRequest,
  isPanelPath,
} from "./panel-api";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("panel API istemcisi", () => {
  it("özel yanıtları no-store ve same-origin ister", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ ok: true, n: 0 }), { status: 200 }),
      );
    vi.stubGlobal("fetch", fetcher);
    expect(
      await panelRequest<{ n: number }>("/app/api/isletme/business/stats"),
    ).toEqual({ ok: true, n: 0 });
    expect(fetcher.mock.calls[0][1]).toMatchObject({
      cache: "no-store",
      credentials: "same-origin",
    });
  });
  it("boş veya bozuk yanıtı başarı saymaz", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("<html>", { status: 200 })),
    );
    await expect(
      panelRequest("/app/api/yonetim/admin/reports"),
    ).rejects.toBeInstanceOf(PanelApiError);
  });
  it("yetki kaybını, çatışmayı ve geçersiz girdiyi ayırt eder", () => {
    expect(panelErrorMessage(new PanelApiError(401, "x"))).toContain("Oturum");
    expect(panelErrorMessage(new PanelApiError(403, "x"))).toContain("yetkin");
    expect(panelErrorMessage(new PanelApiError(409, "x"))).toContain(
      "yenileyip",
    );
    expect(panelErrorMessage(new PanelApiError(400, "", "INVALID"))).toContain(
      "geçerli değil",
    );
    expect(panelErrorMessage(new Error("raw database detail"))).not.toContain(
      "database",
    );
  });
  it("çevrimdışı yazmayı kuyruğa almadan reddeder", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("navigator", { onLine: false });
    await expect(
      panelRequest("/app/api/isletme/business/me", {
        method: "PATCH",
        body: JSON.stringify({ name: "Taslak" }),
      }),
    ).rejects.toMatchObject({ status: 0 });
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("dış iptal sinyalini dinler ve zaman aşımını temizler", async () => {
    vi.useFakeTimers();
    try {
      const fetcher = vi.fn(
        (_path: string, init: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init.signal?.addEventListener("abort", () =>
              reject(new DOMException("Aborted", "AbortError")),
            );
          }),
      );
      vi.stubGlobal("fetch", fetcher);
      const controller = new AbortController();
      const pending = panelRequest("/app/api/yonetim/admin/reports", {
        signal: controller.signal,
      });
      const assertion = expect(pending).rejects.toBeInstanceOf(PanelApiError);
      controller.abort();
      await assertion;
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
  it("panelleri müşteri işletme detayından ayırır", () => {
    expect(isPanelPath("/app/isletme/talepler")).toBe(true);
    expect(isPanelPath("/app/yonetim")).toBe(true);
    expect(isPanelPath("/app/isletmeler/abc")).toBe(false);
    expect(isPanelPath("/")).toBe(false);
  });
});
