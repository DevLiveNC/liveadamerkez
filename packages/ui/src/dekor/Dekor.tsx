"use client";

import { DekorBand, DekorSprite, DekorSvg } from "./DekorSprite.js";
import type { DekorScene } from "./scenes.js";

export type LandingSlot =
  | "hero"
  | "after-search"
  | "after-ornekler"
  | "after-etkinlik"
  | "nasil"
  | "after-whatsapp"
  | "araclar"
  | "after-pilot";

type DekorProps =
  | { scene: "landing"; slot: LandingSlot }
  | { scene: Exclude<DekorScene, "landing">; slot?: undefined };

function LandingHero() {
  return (
    <div className="am-dekor-layer" aria-hidden="true">
      <DekorSprite name="tarak-kabuk" className="am-dekor--tarak" parallax={0.08} eager />
      <DekorSprite name="sarmal-kabuk" className="am-dekor--sarmal" parallax={0.06} deskOnly />
      <DekorSprite name="cakil" className="am-dekor--cakil" parallax={0.05} deskOnly />
      <DekorSprite name="begonvil" className="am-dekor--begonvil" parallax={0.07} deskOnly />
      <DekorSprite name="palmiye" className="am-dekor--palmiye" parallax={0.1} eager />
    </div>
  );
}

function LandingSlotView({ slot }: { slot: LandingSlot }) {
  switch (slot) {
    case "hero":
      return <LandingHero />;
    case "after-search":
      return <DekorBand kind="foam" parallax={0.04} />;
    case "after-ornekler":
      return <DekorBand kind="wave" parallax={0.04} />;
    case "after-etkinlik":
      return (
        <DekorBand kind="tracks">
          <DekorSvg kind="ayakIzi" className="am-dekor--ayak-izi-svg" width={260} height={48} parallax={0.05} />
          <DekorSprite name="deniz-yildizi" className="am-dekor--yildiz" parallax={0.08} deskOnly />
        </DekorBand>
      );
    case "nasil":
      return <DekorSprite name="zeytin-dali" className="am-dekor--zeytin" parallax={0.07} deskOnly />;
    case "after-whatsapp":
      return <DekorBand kind="wave" parallax={0.04} />;
    case "araclar":
      return <DekorSprite name="yaprak-kumesi" className="am-dekor--yaprak" parallax={0.06} deskOnly />;
    case "after-pilot":
      return <DekorBand kind="foam" parallax={0.03} />;
    default:
      return null;
  }
}

function GirisDekor() {
  return (
    <>
      <div className="am-dekor-layer" aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <DekorSprite name="tarak-kabuk" className="am-dekor--tarak" parallax={0.05} deskOnly />
        <DekorSprite name="palmiye" className="am-dekor--palmiye" parallax={0.07} />
      </div>
      <DekorBand kind="wave" parallax={0} />
    </>
  );
}

function PanelDekor({ scene }: { scene: "app-musteri" | "app-isletme" | "app-yonetici" }) {
  return (
    <>
      <DekorBand kind="wave" parallax={0} />
      {scene === "app-musteri" ? (
        <DekorSprite name="sarmal-kabuk" className="am-dekor--sarmal" parallax={0.04} deskOnly />
      ) : null}
    </>
  );
}

/** Yan menü alt köşesi — işletme/yönetici kabuğunda `.side-nav` içine konur. */
export function DekorNavCorner() {
  return (
    <div className="am-dekor-nav-corner" aria-hidden="true">
      <DekorSprite name="yaprak-kumesi" className="am-dekor--yaprak" parallax={0.04} deskOnly />
    </div>
  );
}

export function Dekor(props: DekorProps) {
  if (props.scene === "landing") {
    return <LandingSlotView slot={props.slot} />;
  }
  if (props.scene === "app-giris") {
    return <GirisDekor />;
  }
  return <PanelDekor scene={props.scene} />;
}
