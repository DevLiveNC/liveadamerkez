const CACHE = "ada-merkez-app-v3";
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
    path.startsWith("/app/ana-ekrana-ekle/")
  );
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
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)));
      await self.clients.claim();
      await precachePublicShell();
    })(),
  );
});

self.addEventListener("message", (event) => {
  const type = event.data && event.data.type;
  if (type !== "CLEAR_CACHES") return;
  const port = event.ports && event.ports[0];
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
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
  if (!isAppPath(url.pathname)) return;
  if (url.pathname === "/app/sw.js") return;

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
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
      return cached || fetched;
    }),
  );
});
