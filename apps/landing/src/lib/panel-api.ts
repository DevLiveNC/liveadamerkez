import { panel } from "@ada-merkez/copy";

export const PANEL_REFRESH = "am:panel-refresh";
export const PANEL_UPDATE = "am:panel-update";

export class PanelApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "PanelApiError";
  }
}

export function panelErrorMessage(error: unknown): string {
  if (error instanceof PanelApiError) {
    if (error.status === 401) return panel.sessionError;
    if (error.status === 403) return panel.forbiddenError;
    if (error.status === 409 || error.status === 422)
      return panel.conflictError;
    if (error.status === 400 || error.code === "INVALID")
      return panel.validationError;
    if (error.status >= 500 || error.status === 0)
      return panel.unavailableError;
    return error.message;
  }
  return panel.unavailableError;
}

/** Kişisel panel yanıtları hiçbir istemci önbelleğine yazılmaz. */
export async function panelRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (
    typeof navigator !== "undefined" &&
    !navigator.onLine &&
    init.method &&
    init.method !== "GET"
  ) {
    throw new PanelApiError(0, panel.offline);
  }
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 15_000);
  const abort = () => controller.abort();
  init.signal?.addEventListener("abort", abort, { once: true });
  if (init.signal?.aborted) controller.abort();
  try {
    const response = await fetch(path, {
      ...init,
      signal: controller.signal,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "content-type": "application/json", ...init.headers },
    });
    const body = (await response.json().catch(() => null)) as {
      ok?: boolean;
      message?: string;
      code?: string;
    } | null;
    if (!response.ok || body?.ok === false) {
      throw new PanelApiError(
        response.status,
        body?.message || panel.unavailableError,
        body?.code,
      );
    }
    if (!body) throw new PanelApiError(502, panel.unavailableError);
    return body as T;
  } catch (error) {
    if (error instanceof PanelApiError) throw error;
    throw new PanelApiError(0, panel.unavailableError);
  } finally {
    globalThis.clearTimeout(timeout);
    init.signal?.removeEventListener("abort", abort);
  }
}

export function refreshPanels() {
  window.dispatchEvent(new Event(PANEL_REFRESH));
}

export function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

export function isPanelPath(path: string): boolean {
  return /^\/app\/(isletme|yonetim)(\/|$)/.test(path);
}
