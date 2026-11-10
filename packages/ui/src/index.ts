export {
  dekorDisplaySize,
  maxCssWidth,
  pickMobileDekor,
  withinNaturalPixels,
  DEKOR_DIM_2X,
  type DekorSrc,
  type DekorImgProps,
  type DekorPlacement,
} from "./dekor/srcset.js";

export const DEKOR_SCENES = [
  "landing",
  "app-giris",
  "app-musteri",
  "app-isletme",
  "app-yonetici",
] as const;

export type DekorScene = (typeof DEKOR_SCENES)[number];
