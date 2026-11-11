export const APP_MANIFEST_HREF = "/app/manifest.json";
export const LANDING_MANIFEST_HREF = "/manifest.webmanifest";
export const APP_START_URL = "/app?source=pwa";
/**
 * Manifest `scope` must cover Next.js' canonical `/app` (no trailing slash).
 * W3C/Chrome prefix-match: `/app/` does **not** include `/app`, so scope is `/app`.
 */
export const APP_MANIFEST_SCOPE = "/app";
export const APP_SW_SCOPE = "/app";
/** Previous app SW registration used a trailing slash; it does not control `/app`. */
export const LEGACY_APP_SW_SCOPE_PATH = "/app/";
export const PWA_REDIRECT_VISIBILITY_MS = 1500;

/**
 * Path is within a web-app manifest scope (same-origin path prefix).
 * A scope without a trailing slash covers that exact path and its subpaths,
 * without treating `/apple` as inside `/app`.
 */
export function manifestScopeCoversPath(scope: string, pathname: string): boolean {
  const path = pathname.split("?")[0] || "/";
  if (path === scope) return true;
  const directory = scope.endsWith("/") ? scope : `${scope}/`;
  return path.startsWith(directory);
}

export function isLegacyAppServiceWorkerScope(scopeUrl: string): boolean {
  try {
    return new URL(scopeUrl).pathname === LEGACY_APP_SW_SCOPE_PATH;
  } catch {
    return false;
  }
}

/** Drop leftover `/app/` registrations so `/app` can control the PWA root. */
export async function unregisterLegacyAppServiceWorkers(
  keep?: ServiceWorkerRegistration,
): Promise<void> {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    registrations.map(async (registration) => {
      if (keep && registration === keep) return;
      if (keep && registration.scope === keep.scope) return;
      if (isLegacyAppServiceWorkerScope(registration.scope)) {
        await registration.unregister();
      }
    }),
  );
}

/** Runs in `<head>` before paint. Home `/` only — legal pages stay reachable in standalone. */
export const PWA_STANDALONE_REDIRECT_SCRIPT =
  '(function(){try{var p=location.pathname;if(p!=="/"&&p!=="")return;if((window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){document.documentElement.style.visibility="hidden";setTimeout(function(){document.documentElement.style.visibility="";},1500);location.replace("/app");}}catch(e){document.documentElement.style.visibility="";}})();';
