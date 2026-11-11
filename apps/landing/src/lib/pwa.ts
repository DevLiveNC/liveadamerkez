export const APP_MANIFEST_HREF = "/app/manifest.json";
export const LANDING_MANIFEST_HREF = "/manifest.webmanifest";
export const APP_START_URL = "/app?source=pwa";
/**
 * Manifest `scope` must cover Next.js' canonical `/app` (no trailing slash).
 * W3C/Chrome prefix-match: `/app/` does **not** include `/app`, so scope is `/app`.
 */
export const APP_MANIFEST_SCOPE = "/app";
export const APP_SW_SCOPE = "/app";

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

/** Runs in `<head>` before paint. Landing-only; `/app` layout does not inject this. */
export const PWA_STANDALONE_REDIRECT_SCRIPT =
  '(function(){try{if((window.matchMedia&&window.matchMedia("(display-mode: standalone)").matches)||navigator.standalone===true){document.documentElement.style.visibility="hidden";location.replace("/app");}}catch(e){}})();';
