"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { AttributionCapture } from "./AttributionCapture";
import { Analytics } from "./Analytics";
import { ConsentBanner } from "./ConsentBanner";
import { Header } from "./Header";
import { InstallHint } from "./InstallHint";
import { Footer } from "./Footer";
import { ServiceWorkerRegister } from "./ServiceWorkerRegister";
import { isAppPath } from "@ada-merkez/shared";
import { dekorForPath } from "../lib/dekor";

export function MarketingChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isApp = isAppPath(pathname);

  useEffect(() => {
    document.body.classList.toggle("landing", !isApp);
    document.body.classList.toggle("am-app", isApp);
    const dekor = dekorForPath(pathname);
    document.documentElement.setAttribute("data-dekor", dekor);
    document.body.setAttribute("data-dekor", dekor);
  }, [isApp, pathname]);

  if (isApp) {
    return <>{children}</>;
  }

  return (
    <>
      <a className="skip" href="#icerik">
        İçeriğe geç
      </a>
      <AttributionCapture />
      <Analytics />
      <ConsentBanner />
      <Header />
      {children}
      <InstallHint />
      <Footer />
      <ServiceWorkerRegister />
    </>
  );
}
