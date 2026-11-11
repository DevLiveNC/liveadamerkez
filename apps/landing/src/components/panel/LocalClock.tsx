"use client";

import { useEffect, useState } from "react";
import { util } from "@ada-merkez/copy";
import { IconClock } from "./icons";

function formatNow() {
  return new Intl.DateTimeFormat("tr-TR", {
    timeZone: "Europe/Nicosia",
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date());
}

export function LocalClock() {
  const [label, setLabel] = useState(formatNow);

  useEffect(() => {
    const id = window.setInterval(() => setLabel(formatNow()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span className="desk-only">
      <IconClock /> {label} · {util.clock}
    </span>
  );
}
