export function shouldReduceMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function startAppTransition(update: () => void): void {
  if (shouldReduceMotion()) {
    update();
    return;
  }
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  if (typeof doc.startViewTransition === "function") {
    doc.startViewTransition(update);
    return;
  }
  update();
}
