export const DEKOR_SCENES = [
  "landing",
  "app-giris",
  "app-musteri",
  "app-isletme",
  "app-yonetici",
] as const;

export type DekorScene = (typeof DEKOR_SCENES)[number];
