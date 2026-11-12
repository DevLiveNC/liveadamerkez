"use client";

import Link from "next/link";
import { useEffect } from "react";
import { app, offline } from "@ada-merkez/copy";
import { Button } from "@ada-merkez/ui";
import { EmptyState } from "../../components/app/EmptyState";

/**
 * Uygulama içi hata sınırı.
 *
 * Sayfa sunucusunda bir şey düşerse kullanıcı ham hata yerine Kabuki'li,
 * tek eylemli bir ekran görür: yeniden dene veya keşfe dön. Bu bileşen
 * `AppChrome`'un içinde (yani `main#icerik` içinde) render edilir; bu yüzden
 * kendi `main` öğesini eklemez.
 */
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") console.error(error);
  }, [error]);

  return (
    <div className="atla-glass atla-glass--peach" style={{ marginTop: 16, padding: "20px 16px" }}>
      <EmptyState
        kind="hata"
        action={
          <div className="flex-col gap-2 mt-4">
            <Button variant="accent" block type="button" onClick={reset}>
              {offline.retry}
            </Button>
            <Link className="am-btn am-btn--ghost am-btn--block" href="/app">
              {app.discover}
            </Link>
          </div>
        }
      />
    </div>
  );
}
