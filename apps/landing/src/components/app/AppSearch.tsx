"use client";

import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { SearchInput } from "@ada-merkez/ui";
import { setNavDirection } from "../../lib/app-nav";

/**
 * Keşif araması.
 *
 * `<form action="/app">` tarayıcıda tam sayfa yenilemesi yapıyordu: PWA'da
 * beyaz flaş, kaydırma kaybı ve "site" hissi. Burada aynı form sorgu dizesine
 * çevrilip istemci yönlendirmesiyle açılır. JavaScript yoksa `action`
 * özniteliği sayesinde klasik GET çalışmaya devam eder.
 */
export function AppSearch({
  action,
  defaultValue,
  placeholder,
  ariaLabel,
  hidden,
  action2,
}: {
  action: string;
  defaultValue: string;
  placeholder: string;
  ariaLabel: string;
  hidden?: Record<string, string>;
  action2?: ReactNode;
}) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const params = new URLSearchParams();
    for (const [key, value] of data.entries()) {
      if (typeof value !== "string") continue;
      if (key === "q") continue;
      if (!value) continue;
      params.set(key, value);
    }
    const q = String(data.get("q") ?? "").trim();
    if (q) params.set("q", q);
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    setNavDirection("forward");
    const query = params.toString();
    router.push(query ? `/app?${query}` : "/app", { scroll: false });
  }

  return (
    <SearchInput
      action={action}
      defaultValue={defaultValue}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      hidden={hidden}
      action2={action2}
      onSubmit={onSubmit}
    />
  );
}
