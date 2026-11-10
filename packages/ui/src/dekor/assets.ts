import palmiye2x from "../../dekor/webp/palmiye.webp";
import palmiye1x from "../../dekor/webp/palmiye-1x.webp";
import palmiyeM from "../../dekor/webp/palmiye-m.webp";
import zeytin2x from "../../dekor/webp/zeytin-dali.webp";
import zeytin1x from "../../dekor/webp/zeytin-dali-1x.webp";
import zeytinM from "../../dekor/webp/zeytin-dali-m.webp";
import begonvil2x from "../../dekor/webp/begonvil.webp";
import begonvil1x from "../../dekor/webp/begonvil-1x.webp";
import begonvilM from "../../dekor/webp/begonvil-m.webp";
import yaprak2x from "../../dekor/webp/yaprak-kumesi.webp";
import yaprak1x from "../../dekor/webp/yaprak-kumesi-1x.webp";
import yaprakM from "../../dekor/webp/yaprak-kumesi-m.webp";
import tarak2x from "../../dekor/webp/tarak-kabuk.webp";
import tarak1x from "../../dekor/webp/tarak-kabuk-1x.webp";
import tarakM from "../../dekor/webp/tarak-kabuk-m.webp";
import sarmal2x from "../../dekor/webp/sarmal-kabuk.webp";
import sarmal1x from "../../dekor/webp/sarmal-kabuk-1x.webp";
import sarmalM from "../../dekor/webp/sarmal-kabuk-m.webp";
import yildiz2x from "../../dekor/webp/deniz-yildizi.webp";
import yildiz1x from "../../dekor/webp/deniz-yildizi-1x.webp";
import yildizM from "../../dekor/webp/deniz-yildizi-m.webp";
import cakil2x from "../../dekor/webp/cakil.webp";
import cakil1x from "../../dekor/webp/cakil-1x.webp";
import cakilM from "../../dekor/webp/cakil-m.webp";
import dalgaKenar from "../../dekor/svg/dalga-kenar.svg";
import kopuk from "../../dekor/svg/kopuk.svg";
import ayakIzi from "../../dekor/svg/ayak-izi.svg";
import { DEKOR_DIM_2X } from "./srcset.js";

export type SpriteName = keyof typeof DEKOR_DIM_2X;

function href(mod: string | { src: string }) {
  return typeof mod === "string" ? mod : mod.src;
}

export const SPRITES: Record<
  SpriteName,
  { src2x: string; src1x: string; srcMob: string; width2x: number; height2x: number }
> = {
  palmiye: {
    src2x: href(palmiye2x),
    src1x: href(palmiye1x),
    srcMob: href(palmiyeM),
    ...DEKOR_DIM_2X.palmiye,
  },
  "zeytin-dali": {
    src2x: href(zeytin2x),
    src1x: href(zeytin1x),
    srcMob: href(zeytinM),
    ...DEKOR_DIM_2X["zeytin-dali"],
  },
  begonvil: {
    src2x: href(begonvil2x),
    src1x: href(begonvil1x),
    srcMob: href(begonvilM),
    ...DEKOR_DIM_2X.begonvil,
  },
  "yaprak-kumesi": {
    src2x: href(yaprak2x),
    src1x: href(yaprak1x),
    srcMob: href(yaprakM),
    ...DEKOR_DIM_2X["yaprak-kumesi"],
  },
  "tarak-kabuk": {
    src2x: href(tarak2x),
    src1x: href(tarak1x),
    srcMob: href(tarakM),
    ...DEKOR_DIM_2X["tarak-kabuk"],
  },
  "sarmal-kabuk": {
    src2x: href(sarmal2x),
    src1x: href(sarmal1x),
    srcMob: href(sarmalM),
    ...DEKOR_DIM_2X["sarmal-kabuk"],
  },
  "deniz-yildizi": {
    src2x: href(yildiz2x),
    src1x: href(yildiz1x),
    srcMob: href(yildizM),
    ...DEKOR_DIM_2X["deniz-yildizi"],
  },
  cakil: {
    src2x: href(cakil2x),
    src1x: href(cakil1x),
    srcMob: href(cakilM),
    ...DEKOR_DIM_2X.cakil,
  },
};

export const SVG = {
  dalga: href(dalgaKenar),
  kopuk: href(kopuk),
  ayakIzi: href(ayakIzi),
};
