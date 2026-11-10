"use client";

import { useSyncExternalStore } from "react";

const DESKTOP_MQ = "(min-width: 861px)";

function subscribe(onStoreChange: () => void) {
  const mq = window.matchMedia(DESKTOP_MQ);
  mq.addEventListener("change", onStoreChange);
  return () => mq.removeEventListener("change", onStoreChange);
}

function getSnapshot() {
  return window.matchMedia(DESKTOP_MQ).matches;
}

function getServerSnapshot() {
  return false;
}

/** 861 px ve üzeri. SSR/hidrasyon false; masaüstü hidrasyon sonrası true. */
export function useDesktop() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
