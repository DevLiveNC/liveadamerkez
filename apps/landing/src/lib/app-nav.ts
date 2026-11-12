/**
 * Uygulama içi gezinme hafızası.
 *
 * Tarayıcı geçmişi tek başına "anlamlı geri hedefi" anlatmaz: PWA kısayolundan
 * doğrudan bir detay sayfasına girildiğinde `history.length` yanıltıcıdır,
 * `router.back()` kullanıcıyı uygulama dışına atabilir. Bu yüzden kabuk,
 * gördüğü her rota anahtarını kendi yığınında tutar; geri kararı bu yığına,
 * yoksa tanımlı üst rotaya dayanır.
 *
 * Saf fonksiyonlar (stack/karar) test edilebilir; depolama erişimi ayrı
 * yardımcılarda ve tarayıcı yoksa sessizce devre dışı kalır.
 */

export type NavDirection = "forward" | "back" | "tab";

export type NavStack = { entries: string[]; index: number };

export type BackDecision = { type: "back" } | { type: "replace"; href: string } | { type: "none" };

export const APP_ROOT = "/app";
export const NAV_STACK_KEY = "am_nav_stack_v1";
export const SCROLL_MAP_KEY = "am_scroll_map_v1";
export const DISCOVER_KEY = "am_last_discover_v1";
/** Yığın sınırsız büyümesin; en eski girişler düşer. */
export const MAX_ENTRIES = 40;
/** Kaydırma haritasında tutulan en fazla rota. */
export const MAX_SCROLL_ENTRIES = 30;

const EMPTY_STACK: NavStack = { entries: [], index: -1 };

/** `/app` ve alt yolları; `/apple` gibi komşuları kapsamaz. */
export function isAppPathLike(path: string): boolean {
  if (!path) return false;
  const clean = path.split(/[?#]/)[0] || "/";
  return clean === APP_ROOT || clean.startsWith(`${APP_ROOT}/`);
}

export function normalizeKey(pathname: string, search = ""): string {
  const path = pathname || APP_ROOT;
  if (!search) return path;
  return search.startsWith("?") ? `${path}${search}` : `${path}?${search}`;
}

/** Yalnız yol + sorgu; hash ayrı ele alınır (kaydırma hedefi). */
export function routeKeyOf(url: { pathname: string; search?: string }): string {
  return normalizeKey(url.pathname, url.search ?? "");
}

export function parseStack(raw: string | null | undefined): NavStack {
  if (!raw) return EMPTY_STACK;
  try {
    const data = JSON.parse(raw) as unknown;
    if (!data || typeof data !== "object") return EMPTY_STACK;
    const entries = (data as { entries?: unknown }).entries;
    const index = (data as { index?: unknown }).index;
    if (!Array.isArray(entries) || !entries.every((item) => typeof item === "string")) return EMPTY_STACK;
    const list = entries
      .filter((item): item is string => typeof item === "string" && item.startsWith("/"))
      .slice(-MAX_ENTRIES);
    const safeIndex = typeof index === "number" && Number.isFinite(index) ? Math.trunc(index) : list.length - 1;
    if (!list.length) return EMPTY_STACK;
    return { entries: list, index: Math.min(Math.max(safeIndex, 0), list.length - 1) };
  } catch {
    return EMPTY_STACK;
  }
}

export function serializeStack(stack: NavStack): string {
  return JSON.stringify({ entries: stack.entries, index: stack.index });
}

/**
 * Yeni rotayı yığına işler.
 * - ileri/sekme: mevcut konumdan sonrası atılır, yeni giriş eklenir
 * - geri: aynı anahtar geriye doğru aranır (tarayıcı gerçekten geri gitti)
 */
export function recordVisit(stack: NavStack, key: string, direction: NavDirection): NavStack {
  const entries = stack.entries.length ? [...stack.entries] : [];
  const index = stack.entries.length ? stack.index : -1;

  if (direction === "back") {
    for (let i = Math.min(index, entries.length - 1); i >= 0; i -= 1) {
      if (entries[i] === key) return { entries, index: i };
    }
    if (entries.length === 0) return { entries: [key], index: 0 };
    // Beklenmeyen geri hedef (ör. dış bağlantı): geçerli uçtan yeni giriş.
    const kept = entries.slice(0, Math.max(index + 1, 1));
    if (kept[kept.length - 1] === key) return { entries: kept, index: kept.length - 1 };
    kept.push(key);
    return { entries: kept.slice(-MAX_ENTRIES), index: Math.min(kept.length, MAX_ENTRIES) - 1 };
  }

  const base = entries.slice(0, Math.max(index + 1, 0));
  if (base[base.length - 1] === key) return { entries: base, index: base.length - 1 };
  base.push(key);
  const trimmed = base.slice(-MAX_ENTRIES);
  return { entries: trimmed, index: trimmed.length - 1 };
}

/** Yığında uygulama içi, mevcut olandan farklı bir önceki ekran var mı? */
export function canGoBack(stack: NavStack, current?: string): boolean {
  if (stack.index <= 0) return false;
  const previous = stack.entries[stack.index - 1];
  if (!previous || !isAppPathLike(previous)) return false;
  return current === undefined || previous !== current;
}

/** Güvenli, uygulama içi bir yol üretir (açık yönlendirme yok). */
export function safeAppPath(value: string | null | undefined, fallback: string = APP_ROOT): string {
  if (!value || typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//")) return fallback;
  if (value.includes("\\")) return fallback;
  return value;
}

/** Bir rotanın üst ekranı: /app/isletmeler/x → /app, /app/randevular/x → /app/randevular */
export function parentOf(path: string): string {
  const clean = path.split(/[?#]/)[0] || APP_ROOT;
  const parts = clean.split("/").filter(Boolean);
  if (parts.length <= 1) return APP_ROOT;
  if (parts[0] !== "app") return APP_ROOT;
  // Müşteri detayları doğrudan keşfe döner: sekmelerin üstünde ara ekran yok.
  if (parts[1] === "isletmeler") return APP_ROOT;
  if (parts.length === 2) return APP_ROOT;
  const parent = `/${parts.slice(0, -1).join("/")}`;
  return parent === clean ? APP_ROOT : parent;
}

/**
 * Geri düğmesinin kararı: yığın uygunsa tarayıcı geri, değilse üst rota.
 * Aynı rotaya "geri" yapıp sonsuz döngü kurulmaz.
 */
export function resolveBack({
  stack,
  current,
  fallback = APP_ROOT,
}: {
  stack: NavStack;
  current: string;
  fallback?: string;
}): BackDecision {
  if (canGoBack(stack, current)) return { type: "back" };
  let href = safeAppPath(fallback, APP_ROOT);
  const currentPath = current.split("?")[0] || "";
  if (href === current) href = parentOf(currentPath);
  if (href === current || href.split("?")[0] === currentPath) {
    href = parentOf(currentPath);
  }
  if (!href || href === current) return { type: "none" };
  return { type: "replace", href };
}

/* ————————————————————————————————————————————————
   Yön bilgisi (modül belleği)
   ———————————————————————————————————————————————— */

let direction: NavDirection = "forward";

export function setNavDirection(next: NavDirection): void {
  direction = next;
}

export function navDirection(): NavDirection {
  return direction;
}

/* ————————————————————————————————————————————————
   Tarayıcı yardımcıları — depolama yoksa sessizce çalışır
   ———————————————————————————————————————————————— */

function session(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

export function readStack(storage: Storage | null = session()): NavStack {
  if (!storage) return EMPTY_STACK;
  try {
    return parseStack(storage.getItem(NAV_STACK_KEY));
  } catch {
    return EMPTY_STACK;
  }
}

export function writeStack(stack: NavStack, storage: Storage | null = session()): void {
  if (!storage) return;
  try {
    storage.setItem(NAV_STACK_KEY, serializeStack(stack));
  } catch {
    /* gizli sekme / kota */
  }
}

/** Kabuk her rota değişiminde çağırır; yığını güncelleyip yeni hâlini döndürür. */
export function recordNavigation(
  key: string,
  dir: NavDirection = navDirection(),
  storage: Storage | null = session(),
): NavStack {
  const next = recordVisit(readStack(storage), key, dir);
  writeStack(next, storage);
  return next;
}

export function currentRouteKey(): string {
  if (typeof window === "undefined") return APP_ROOT;
  return normalizeKey(window.location.pathname, window.location.search);
}

/** Keşif ekranındaki arama/süzgeç durumu: detaydan geri dönüş hedefi. */
export function rememberDiscover(key: string = currentRouteKey(), storage: Storage | null = session()): void {
  if (!storage) return;
  const path = key.split("?")[0] || "";
  if (path !== APP_ROOT) return;
  try {
    storage.setItem(DISCOVER_KEY, key);
  } catch {
    /* gizli sekme */
  }
}

export function lastDiscoverPath(storage: Storage | null = session()): string {
  if (!storage) return APP_ROOT;
  try {
    return safeAppPath(storage.getItem(DISCOVER_KEY), APP_ROOT);
  } catch {
    return APP_ROOT;
  }
}

/* ————————————————————————————————————————————————
   Kaydırma konumu hafızası (bellekte tutulur, seyrek yazılır)
   ———————————————————————————————————————————————— */

const scrollMemory = new Map<string, number>();
let scrollLoaded = false;

function loadScroll(storage: Storage | null = session()): void {
  if (scrollLoaded || !storage) return;
  scrollLoaded = true;
  try {
    const raw = storage.getItem(SCROLL_MAP_KEY);
    if (!raw) return;
    const data = JSON.parse(raw) as unknown;
    if (!Array.isArray(data)) return;
    for (const item of data) {
      if (!Array.isArray(item) || item.length !== 2) continue;
      const [key, value] = item;
      if (typeof key === "string" && typeof value === "number" && Number.isFinite(value)) {
        scrollMemory.set(key, Math.max(0, Math.round(value)));
      }
    }
  } catch {
    /* bozuk kayıt yok sayılır */
  }
}

export function rememberScroll(key: string, top: number): void {
  if (!key) return;
  loadScroll();
  scrollMemory.delete(key);
  scrollMemory.set(key, Math.max(0, Math.round(top)));
  while (scrollMemory.size > MAX_SCROLL_ENTRIES) {
    const oldest = scrollMemory.keys().next();
    if (oldest.done) break;
    scrollMemory.delete(oldest.value);
  }
}

export function scrollFor(key: string): number | undefined {
  loadScroll();
  return scrollMemory.get(key);
}

/** Bellekteki haritayı oturuma yazar (rota değişiminde / sayfa gizlenince). */
export function flushScroll(storage: Storage | null = session()): void {
  if (!storage) return;
  try {
    storage.setItem(SCROLL_MAP_KEY, JSON.stringify([...scrollMemory.entries()]));
  } catch {
    /* kota */
  }
}

/* ————————————————————————————————————————————————
   Yön ipuçları: tıklama = ileri, geri düğmesi = geri, sekme = sekme
   ———————————————————————————————————————————————— */

/**
 * `pointerdown` yakalama aşamasında yön "forward"a çekilir; geri düğmesi ve
 * sekme düğmeleri kendi `onClick`'lerinde yönü ezer. Böylece eski bir "geri"
 * değeri bir sonraki ileri geçişi yanlış yönde canlandırmaz.
 */
export function installNavIntentListeners(target: Window | null = typeof window === "undefined" ? null : window): () => void {
  if (!target) return () => undefined;
  const onPointerDown = () => setNavDirection("forward");
  const onPopState = () => setNavDirection("back");
  target.addEventListener("pointerdown", onPointerDown, { capture: true, passive: true });
  target.addEventListener("popstate", onPopState);
  return () => {
    target.removeEventListener("pointerdown", onPointerDown, { capture: true } as EventListenerOptions);
    target.removeEventListener("popstate", onPopState);
  };
}
