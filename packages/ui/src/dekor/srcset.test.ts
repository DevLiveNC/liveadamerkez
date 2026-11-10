import { describe, expect, it } from "vitest";
import {
  DEKOR_DIM_2X,
  dekorDisplaySize,
  maxCssWidth,
  pickMobileDekor,
  withinNaturalPixels,
} from "./srcset.js";

describe("dekor srcset", () => {
  const palmiye = {
    src2x: "/assets/dekor/webp/palmiye.webp",
    width2x: DEKOR_DIM_2X.palmiye.width2x,
    height2x: DEKOR_DIM_2X.palmiye.height2x,
    src1x: "/assets/dekor/webp/palmiye-m.webp",
    width1x: 110,
  };

  it("caps CSS width at half of 2x natural width", () => {
    expect(maxCssWidth(312)).toBe(156);
    const props = dekorDisplaySize(palmiye, 2000);
    expect(props.width).toBe(156);
    expect(props.srcSet).toBe(
      "/assets/dekor/webp/palmiye-m.webp 1x, /assets/dekor/webp/palmiye.webp 2x",
    );
    expect(withinNaturalPixels(props.width, 2, palmiye.width2x)).toBe(true);
    expect(withinNaturalPixels(110, 1, palmiye.width1x)).toBe(true);
  });

  it("YERLESIM landing palmiye 156px is within 2x pixels", () => {
    const props = dekorDisplaySize({ ...palmiye, src1x: undefined, width1x: undefined }, 156);
    expect(props.width).toBe(156);
    expect(withinNaturalPixels(props.width, 2, palmiye.width2x)).toBe(true);
  });

  it("does not upscale a small desired size", () => {
    const props = dekorDisplaySize(palmiye, 72);
    expect(props.width).toBe(72);
    expect(props.height).toBe(Math.round((72 * 304) / 312));
  });

  it("without 1x file still satisfies DPR 2 against 2x natural width", () => {
    const props = dekorDisplaySize(
      { src2x: "/assets/dekor/webp/tarak-kabuk.webp", width2x: 200, height2x: 174 },
      400,
    );
    expect(props.width).toBe(100);
    expect(props.srcSet).toBe("/assets/dekor/webp/tarak-kabuk.webp 2x");
    expect(withinNaturalPixels(props.width, 2, 200)).toBe(true);
  });

  it("rejects an upscaled render", () => {
    expect(withinNaturalPixels(160, 2, 200)).toBe(false);
  });

  it("keeps at most two mobile sprites", () => {
    const items = [
      { id: "a", mobile: "show" as const },
      { id: "b", mobile: "hide" as const },
      { id: "c", mobile: "show" as const },
      { id: "d", mobile: "show" as const },
    ];
    expect(pickMobileDekor(items).map((item) => item.id)).toEqual(["a", "c"]);
  });
});
