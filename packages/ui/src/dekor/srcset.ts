export type DekorSrc = {
  /** 2× (masaüstü WebP). */
  src2x: string;
  width2x: number;
  height2x: number;
  /** 1× mobil (`-m.webp`); yoksa tarayıcı 2×’i küçültür. */
  src1x?: string;
  width1x?: number;
};

/** YERLESIM.md masaüstü 2× doğal ölçüler. */
export const DEKOR_DIM_2X = {
  palmiye: { width2x: 312, height2x: 304 },
  "zeytin-dali": { width2x: 296, height2x: 264 },
  begonvil: { width2x: 320, height2x: 192 },
  "yaprak-kumesi": { width2x: 264, height2x: 204 },
  "tarak-kabuk": { width2x: 200, height2x: 174 },
  "sarmal-kabuk": { width2x: 184, height2x: 164 },
  "deniz-yildizi": { width2x: 176, height2x: 164 },
  cakil: { width2x: 240, height2x: 154 },
} as const;

export type DekorImgProps = {
  src: string;
  srcSet: string;
  width: number;
  height: number;
};

/** CSS genişliği, 2x dosyanın yarısını (DPR 2’de doğal piksel) geçmez. */
export function maxCssWidth(width2x: number): number {
  return Math.max(1, Math.floor(width2x / 2));
}

/**
 * İstenen CSS genişliğini doğal çözünürlüğe sıkıştırır.
 * `renderedWidth * 2 ≤ width2x`.
 */
export function dekorDisplaySize(asset: DekorSrc, desiredCssWidth: number): DekorImgProps {
  const cap = maxCssWidth(asset.width2x);
  const cssWidth = Math.max(1, Math.min(Math.round(desiredCssWidth), cap));
  const height = Math.max(1, Math.round((cssWidth * asset.height2x) / asset.width2x));
  if (asset.src1x) {
    return {
      src: asset.src1x,
      srcSet: `${asset.src1x} 1x, ${asset.src2x} 2x`,
      width: cssWidth,
      height,
    };
  }
  return {
    src: asset.src2x,
    srcSet: `${asset.src2x} 2x`,
    width: cssWidth,
    height,
  };
}

export function withinNaturalPixels(
  renderedWidth: number,
  devicePixelRatio: number,
  naturalWidth: number,
): boolean {
  return renderedWidth * devicePixelRatio <= naturalWidth + 0.5;
}

const MOBILE_MAX = 2;

export type DekorPlacement<T> = T & { mobile?: "show" | "hide" };

/** Mobilde bölüm başına en fazla 1–2 küçük element. */
export function pickMobileDekor<T extends { mobile?: "show" | "hide" }>(
  items: readonly T[],
  max = MOBILE_MAX,
): T[] {
  const shown = items.filter((item) => item.mobile !== "hide");
  return shown.slice(0, max);
}
