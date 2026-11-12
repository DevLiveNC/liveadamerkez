import { describe, expect, it } from "vitest";
import {
  APP_ROOT,
  MAX_ENTRIES,
  canGoBack,
  isAppPathLike,
  lastDiscoverPath,
  normalizeKey,
  parentOf,
  parseStack,
  recordNavigation,
  recordVisit,
  rememberDiscover,
  resolveBack,
  safeAppPath,
  serializeStack,
} from "./app-nav";

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = new Map(Object.entries(initial));
  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key: string) => data.get(key) ?? null,
    key: (index: number) => [...data.keys()][index] ?? null,
    removeItem: (key: string) => void data.delete(key),
    setItem: (key: string, value: string) => void data.set(key, value),
  } as Storage;
}

describe("isAppPathLike", () => {
  it("kapsamı /app ve alt yollarıyla sınırlar", () => {
    expect(isAppPathLike("/app")).toBe(true);
    expect(isAppPathLike("/app/randevular")).toBe(true);
    expect(isAppPathLike("/app?q=a")).toBe(true);
    expect(isAppPathLike("/apple")).toBe(false);
    expect(isAppPathLike("/")).toBe(false);
    expect(isAppPathLike("")).toBe(false);
  });
});

describe("recordVisit", () => {
  it("ileri geçişte yeni giriş ekler ve ileri dalları atar", () => {
    let stack = recordVisit(parseStack(null), "/app", "forward");
    stack = recordVisit(stack, "/app/isletmeler/1", "forward");
    stack = recordVisit(stack, "/app/randevular", "tab");
    expect(stack.entries).toEqual(["/app", "/app/isletmeler/1", "/app/randevular"]);
    expect(stack.index).toBe(2);

    stack = recordVisit(stack, "/app/randevular", "back");
    expect(stack.index).toBe(2);

    stack = recordVisit(stack, "/app/isletmeler/1", "back");
    expect(stack.index).toBe(1);
    stack = recordVisit(stack, "/app/favoriler", "forward");
    expect(stack.entries).toEqual(["/app", "/app/isletmeler/1", "/app/favoriler"]);
    expect(stack.index).toBe(2);
  });

  it("aynı rota iki kez eklenmez (çift geri hatası yok)", () => {
    const first = recordVisit(parseStack(null), "/app", "forward");
    expect(recordVisit(first, "/app", "forward")).toEqual(first);
    expect(recordVisit(first, "/app", "tab")).toEqual(first);
  });

  it("bilinmeyen geri hedefte döngü kurmaz", () => {
    let stack = recordVisit(parseStack(null), "/app", "forward");
    stack = recordVisit(stack, "/app/hesap", "forward");
    stack = recordVisit(stack, "/dis-baglanti", "back");
    expect(stack.entries[stack.index]).toBe("/dis-baglanti");
    expect(stack.index).toBeGreaterThan(0);
  });

  it("yığını MAX_ENTRIES ile sınırlar", () => {
    let stack = parseStack(null);
    for (let i = 0; i < MAX_ENTRIES + 10; i += 1) {
      stack = recordVisit(stack, `/app/rota-${i}`, "forward");
    }
    expect(stack.entries.length).toBe(MAX_ENTRIES);
    expect(stack.index).toBe(MAX_ENTRIES - 1);
    expect(stack.entries[stack.index]).toBe(`/app/rota-${MAX_ENTRIES + 9}`);
  });
});

describe("canGoBack / resolveBack", () => {
  const stack = recordVisit(recordVisit(parseStack(null), "/app", "forward"), "/app/isletmeler/1", "forward");

  it("uygulama içi önceki ekran varsa tarayıcı geri kullanılır", () => {
    expect(canGoBack(stack)).toBe(true);
    expect(canGoBack(stack, "/app/isletmeler/1")).toBe(true);
    expect(resolveBack({ stack, current: "/app/isletmeler/1" })).toEqual({ type: "back" });
  });

  it("doğrudan girişte üst rotaya yönlendirir", () => {
    const direct = recordVisit(parseStack(null), "/app/isletmeler/1", "forward");
    expect(canGoBack(direct)).toBe(false);
    expect(resolveBack({ stack: direct, current: "/app/isletmeler/1" })).toEqual({
      type: "replace",
      href: "/app",
    });
  });

  it("kök sekmede geri kararı üretmez", () => {
    const root = recordVisit(parseStack(null), "/app", "forward");
    expect(resolveBack({ stack: root, current: "/app" })).toEqual({ type: "none" });
  });

  it("geri hedefi mevcut rota ile aynıysa üst rotaya iner", () => {
    const direct = recordVisit(parseStack(null), "/app/isletme/talepler", "forward");
    expect(resolveBack({ stack: direct, current: "/app/isletme/talepler", fallback: "/app/isletme/talepler" })).toEqual({
      type: "replace",
      href: "/app/isletme",
    });
  });

  it("açık yönlendirmeye izin vermez", () => {
    const direct = parseStack(null);
    expect(
      resolveBack({ stack: direct, current: "/app/hesap", fallback: "https://evil.test/steal" }),
    ).toEqual({ type: "replace", href: "/app" });
    expect(safeAppPath("//evil.test")).toBe(APP_ROOT);
    expect(safeAppPath("https://evil.test")).toBe(APP_ROOT);
    expect(safeAppPath("/app/hesap")).toBe("/app/hesap");
  });
});

describe("parentOf", () => {
  it("müşteri detayını keşfe, panel alt sayfasını panele bağlar", () => {
    expect(parentOf("/app/isletmeler/abc")).toBe("/app");
    expect(parentOf("/app/randevular/abc")).toBe("/app/randevular");
    expect(parentOf("/app/isletme/talepler")).toBe("/app/isletme");
    expect(parentOf("/app")).toBe("/app");
    expect(parentOf("/app/yonetim/denetim")).toBe("/app/yonetim");
  });
});

describe("stack serileştirme", () => {
  it("bozuk kaydı yok sayar", () => {
    expect(parseStack(null).entries).toEqual([]);
    expect(parseStack("{").entries).toEqual([]);
    expect(parseStack("[]").entries).toEqual([]);
    expect(parseStack(JSON.stringify({ entries: ["/app", 5], index: 0 })).entries).toEqual([]);
  });

  it("indeksi sınırlar", () => {
    const parsed = parseStack(JSON.stringify({ entries: ["/app", "/app/hesap"], index: 9 }));
    expect(parsed.index).toBe(1);
    expect(parseStack(serializeStack(parsed))).toEqual(parsed);
  });
});

describe("oturum yardımcıları", () => {
  it("rota geçmişini ve keşif sorgusunu saklar", () => {
    const storage = memoryStorage();
    recordNavigation("/app", "forward", storage);
    const stack = recordNavigation("/app?q=kuaf%C3%B6r", "forward", storage);
    expect(stack.entries).toEqual(["/app", "/app?q=kuaf%C3%B6r"]);

    rememberDiscover("/app?q=kuaf%C3%B6r", storage);
    expect(lastDiscoverPath(storage)).toBe("/app?q=kuaf%C3%B6r");

    rememberDiscover("/app/hesap", storage);
    expect(lastDiscoverPath(storage)).toBe("/app?q=kuaf%C3%B6r");
  });

  it("normalizeKey sorguyu tek biçimde ekler", () => {
    expect(normalizeKey("/app", "?q=a")).toBe("/app?q=a");
    expect(normalizeKey("/app", "q=a")).toBe("/app?q=a");
    expect(normalizeKey("/app")).toBe("/app");
  });
});
