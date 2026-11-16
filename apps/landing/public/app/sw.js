const CACHE = "ada-merkez-app-v6";
const STATIC_CACHE = "ada-merkez-app-static-v1";
const OFFLINE = "/app/offline.html";
const PRECACHE = [
  OFFLINE,
  "/app/manifest.json",
  "/app/icons/icon-192.png",
  "/app/icons/icon-512.png",
  "/app/icons/maskable-512.png",
  "/app/icons/apple-touch-180.png",
];

const OFFLINE_HTML =
  "<!doctype html><html lang=\"tr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"><title>Ada Merkez — Çevrimdışı</title></head><body><h1>Çevrimdışı</h1><p>Bağlantı gelince uygulamayı yenile.</p></body></html>";

function isAppPath(pathname) {
  return pathname === "/app" || pathname.startsWith("/app/");
}

function isPublicStatic(url) {
  const path = url.pathname;
  if (path === "/app/manifest.json" || path === OFFLINE) return true;
  return (
    path.startsWith("/app/icons/") ||
    path.startsWith("/app/splash/") ||
    path.startsWith("/app/bos-durum/") ||
    path.startsWith("/app/v3/") ||
    path.startsWith("/app/ana-ekrana-ekle/")
  );
}

/** Next'in hash'li derleme çıktısı: içerik değişmez, güvenle önbelleklenir. */
function isImmutableAsset(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isHtmlOrRsc(request, url) {
  if (request.mode === "navigate") return true;
  if (request.destination === "document") return true;
  if (url.searchParams.has("_rsc")) return true;
  if (request.headers.get("RSC") === "1") return true;
  const accept = request.headers.get("Accept") || "";
  return accept.includes("text/x-component") || accept.includes("text/html");
}

function precachePublicShell() {
  return caches.open(CACHE).then((cache) =>
    Promise.all(PRECACHE.map((url) => cache.add(url).catch(() => undefined))),
  );
}

self.addEventListener("install", (event) => {
  /* Güncelleme paneldeki açık kullanıcı onayını bekler; formu zorla yenilemez. */
  event.waitUntil(precachePublicShell());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      /* Yalnız kendi (uygulama) sürümlerini temizle: landing SW'sinin
         önbelleğini silmek pazarlama sitesinin çevrimdışı desteğini bozardı. */
      await Promise.all(
        keys
          .filter((key) => key.startsWith("ada-merkez-app-") && key !== CACHE && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
      await precachePublicShell();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type === "SKIP_WAITING") {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (type !== "CLEAR_CACHES") return;
  const port = event.ports && event.ports[0];
  event.waitUntil(
    (async () => {
      /* Çıkışta yalnız uygulama önbellekleri silinir; landing korunur. */
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key.startsWith("ada-merkez-app-")).map((key) => caches.delete(key)));
      await precachePublicShell();
      if (port) port.postMessage({ ok: true });
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  if (!event.clientId && request.mode !== "navigate") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname === "/app/sw.js" || url.pathname === "/sw.js") return;

  /* Derleme çıktısı: önce önbellek, arka planda tazeleme (hızlı açılış). */
  if (isImmutableAsset(url)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        try {
          const response = await fetch(request);
          if (response.ok) event.waitUntil(cache.put(request, response.clone()).catch(() => undefined));
          return response;
        } catch {
          return cached ?? Response.error();
        }
      }),
    );
    return;
  }

  if (!isAppPath(url.pathname)) return;

  if (url.pathname.startsWith("/app/api/") || isHtmlOrRsc(request, url)) {
    event.respondWith(
      fetch(request).catch(async () => {
        if (request.mode === "navigate" || request.destination === "document") {
          const offline = await caches.match(OFFLINE);
          if (offline) return offline;
          return new Response(OFFLINE_HTML, {
            headers: { "content-type": "text/html; charset=utf-8" },
          });
        }
        return Response.error();
      }),
    );
    return;
  }

  if (!isPublicStatic(url)) {
    event.respondWith(fetch(request));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then(async (response) => {
        if (response.ok) {
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          await cache.put(request, copy);
        }
        return response;
      });
      if (cached) {
        event.waitUntil(fetched.catch(() => undefined));
        return cached;
      }
      return fetched.catch(() => Response.error());
    }),
  );
});
