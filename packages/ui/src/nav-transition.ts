export function shouldReduceMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Geçiş sarmalayıcısı.
 *
 * Not: `document.startViewTransition(() => router.push(...))` bu depoda
 * kaldırıldı. Next'in istemci yönlendirmesi asenkron tamamlandığı için
 * callback senkron bitiyor; tarayıcı eski görüntüyü dondurup yeni içeriği
 * henüz boyanmamış hâlde yakalıyordu (flaş + boş kare). Yerine rota
 * değişiminde tek, yön duyarlı CSS geçişi kullanılır (PageTransition).
 * API korunur: çağıranlar aynı kalır, davranış sadeleşir.
 */
export function startAppTransition(update: () => void): void {
  update();
}
