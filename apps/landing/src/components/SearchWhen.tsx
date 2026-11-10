"use client";

import { useEffect, useState } from "react";
import { tomorrowWhenLabel } from "../lib/nicosia-date";

export function SearchWhen() {
  const [label, setLabel] = useState(() => tomorrowWhenLabel());

  useEffect(() => {
    setLabel(tomorrowWhenLabel());
  }, []);

  return <strong suppressHydrationWarning>{label}</strong>;
}
