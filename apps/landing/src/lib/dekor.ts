import { isAppPath } from "@ada-merkez/shared";
import type { DekorScene } from "@ada-merkez/ui";

/**
 * React `Dekor` sahnesi. `/app/isletmeler` müşteri detayıdır; işletme paneli yalnızca `/app/isletme`.
 */
export function dekorForPath(pathname: string): DekorScene {
  if (!isAppPath(pathname)) return "landing";
  if (pathname === "/app/giris" || pathname.startsWith("/app/giris/")) return "app-giris";
  if (pathname === "/app/isletme" || pathname.startsWith("/app/isletme/")) return "app-isletme";
  if (
    pathname === "/app/yonetim" ||
    pathname.startsWith("/app/yonetim/") ||
    pathname === "/app/yonetici" ||
    pathname.startsWith("/app/yonetici/")
  ) {
    return "app-yonetici";
  }
  return "app-musteri";
}
