"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { panel } from "@ada-merkez/copy";
import {
  PANEL_REFRESH,
  PanelApiError,
  panelErrorMessage,
} from "../../lib/panel-api";

/** Görünür uygulama için tazeleme; arka plandaki sekmeye istek yığılmaz. */
const RESUME_REFRESH_MS = 30_000;

export function useOnline() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  return online;
}

/**
 * Tek seferde bir okuma. Eski yanıtlar yeniyi ezemez; unmount'ta istek iptal edilir.
 * İlk yükleme iskelet, sonraki yükleme mevcut veriyi koruyan tazeleme durumudur.
 */
export function usePanelData<T>(
  loader: (signal: AbortSignal) => Promise<T>,
  key = "",
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const controller = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const alive = useRef(true);
  const hasData = useRef(false);
  const lastRefresh = useRef(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const keyRef = useRef(key);
  keyRef.current = key;

  const refresh = useCallback(async () => {
    controller.current?.abort();
    const abort = new AbortController();
    controller.current = abort;
    const ticket = ++generation.current;
    const requestedKey = keyRef.current;
    const stale = hasData.current;
    lastRefresh.current = Date.now();
    setRefreshing(stale);
    setLoading(!stale);
    setError(null);
    try {
      const result = await loaderRef.current(abort.signal);
      if (
        !alive.current ||
        abort.signal.aborted ||
        ticket !== generation.current ||
        requestedKey !== keyRef.current
      )
        return;
      hasData.current = true;
      setData(result);
      setUpdatedAt(new Date());
    } catch (cause) {
      if (
        !alive.current ||
        abort.signal.aborted ||
        ticket !== generation.current
      )
        return;
      if (
        cause instanceof PanelApiError &&
        (cause.status === 401 || cause.status === 403)
      ) {
        hasData.current = false;
        setData(null);
        setUpdatedAt(null);
      }
      setError(panelErrorMessage(cause));
    } finally {
      if (alive.current && ticket === generation.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    alive.current = true;
    hasData.current = false;
    setData(null);
    void refresh();
    const resume = () => {
      if (
        document.visibilityState === "visible" &&
        navigator.onLine &&
        Date.now() - lastRefresh.current >= RESUME_REFRESH_MS
      ) {
        void refresh();
      }
    };
    const manual = () => {
      void refresh();
    };
    window.addEventListener(PANEL_REFRESH, manual);
    window.addEventListener("online", manual);
    document.addEventListener("visibilitychange", resume);
    return () => {
      alive.current = false;
      generation.current += 1;
      controller.current?.abort();
      window.removeEventListener(PANEL_REFRESH, manual);
      window.removeEventListener("online", manual);
      document.removeEventListener("visibilitychange", resume);
    };
  }, [key, refresh]);

  return { data, loading, refreshing, error, updatedAt, refresh };
}

export function usePanelMutation() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const locked = useRef(false);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  const run = useCallback(
    async (action: () => Promise<void>, message: string): Promise<boolean> => {
      if (locked.current) return false;
      if (!navigator.onLine) {
        setError(panel.offline);
        return false;
      }
      locked.current = true;
      setBusy(true);
      setError(null);
      setSuccess(null);
      try {
        await action();
        if (alive.current) setSuccess(message);
        return true;
      } catch (cause) {
        if (alive.current) setError(panelErrorMessage(cause));
        return false;
      } finally {
        locked.current = false;
        if (alive.current) setBusy(false);
      }
    },
    [],
  );

  return { busy, error, success, run, setError, setSuccess };
}
