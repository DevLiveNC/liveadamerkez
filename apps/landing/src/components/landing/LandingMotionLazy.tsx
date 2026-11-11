"use client";

import dynamic from "next/dynamic";

export const LandingMotionLazy = dynamic(
  () => import("./LandingScrollScenes").then((mod) => mod.LandingScrollScenes),
  { ssr: false, loading: () => null },
);
