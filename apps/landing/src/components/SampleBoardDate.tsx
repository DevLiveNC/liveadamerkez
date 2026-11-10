"use client";

import { useEffect, useState } from "react";
import { examples } from "@ada-merkez/copy";
import { sampleBoardDateLabel } from "../lib/nicosia-date";

export function SampleBoardDate() {
  const [label, setLabel] = useState(() => sampleBoardDateLabel());

  useEffect(() => {
    setLabel(sampleBoardDateLabel());
  }, []);

  return (
    <span suppressHydrationWarning>
      <span className="badge-ornek">{examples.badge}</span> {label}
    </span>
  );
}
