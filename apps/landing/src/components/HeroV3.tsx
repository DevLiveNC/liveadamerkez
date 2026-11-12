import { Fragment } from "react";
import {
  businessPanel,
  categories,
  examples,
  hero,
  kabuki,
  search,
} from "@ada-merkez/copy";

const sample = examples.cards[0];
const DESEN = "/landing/v3/desen";
const CATS_HREF = "/#kategoriler";
const APP_HREF = "/app";
const BUSINESS_HREF = "/app/giris?rol=isletme&kayit=1";
const extraCities = search.cityMore.split(",").map((city) => city.trim());

const MARQUEE = [
  hero.chipHair,
  hero.chipBeauty,
  categories.clinic,
  categories.resto,
  hero.chipWhatsapp,
  search.cityValue,
  ...extraCities,
  hero.displayTitle,
];

function Star() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M10 1l2.4 6.6L19 10l-6.6 2.4L10 19l-2.4-6.6L1 10l6.6-2.4z"
        fill="currentColor"
      />
    </svg>
  );
}

function MarqueeTrack({ prefix }: { prefix: string }) {
  return MARQUEE.map((item, index) => (
    <Fragment key={`${prefix}-${index}`}>
      <span>{item}</span>
      <Star />
    </Fragment>
  ));
}

export function HeroV3() {
  return (
    <section className="am-hero-v3 is-in" aria-labelledby="hero-baslik">
      <div className="h3-sky" aria-hidden="true" />
      <div className="h3-lefkara" aria-hidden="true" />
      <div className="h3-sun" aria-hidden="true">
        <svg viewBox="0 0 400 400">
          <defs>
            <radialGradient id="am-hero-v3-sun" cx="50%" cy="40%" r="60%">
              <stop offset="0" stopColor="#FFD9B8" />
              <stop offset=".45" stopColor="#FF8A3D" />
              <stop offset="1" stopColor="#E4572E" />
            </radialGradient>
          </defs>
          <circle cx="200" cy="200" r="196" fill="url(#am-hero-v3-sun)" />
          <g className="h3-ticks">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1="200"
                y1="14"
                x2="200"
                y2={deg % 90 === 0 ? 40 : 28}
                stroke="#FFFBF2"
                strokeWidth={deg % 90 === 0 ? 6 : 3.5}
                strokeLinecap="round"
                transform={`rotate(${deg} 200 200)`}
              />
            ))}
          </g>
          <g className="h3-hands">
            <line
              x1="200"
              y1="200"
              x2="200"
              y2="96"
              stroke="#FFFBF2"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <line
              className="h3-min"
              x1="200"
              y1="200"
              x2="282"
              y2="200"
              stroke="#FFFBF2"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <circle cx="200" cy="200" r="11" fill="#FFFBF2" />
          </g>
        </svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h3-beg h3-beg-top" src={`${DESEN}/begonvil.svg`} alt="" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h3-beg h3-beg-top2" src={`${DESEN}/begonvil.svg`} alt="" aria-hidden="true" />
      <div className="h3-sea" aria-hidden="true">
        <svg className="h3-wave w1" viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path
            d="M0 40 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 q60.0 -16 120.0 0 t120.0 0 L2880 200 L0 200 Z"
            fill="#7EDDD5"
          />
        </svg>
        <svg className="h3-wave w2" viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path
            d="M0 70 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 q80.0 -14 160.0 0 t160.0 0 L2880 200 L0 200 Z"
            fill="#22B8AF"
          />
        </svg>
        <svg className="h3-wave w3" viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path
            d="M0 110 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 q70.0 -12 140.0 0 t140.0 0 L2880 200 L0 200 Z"
            fill="#0B5FA5"
          />
        </svg>
        <svg className="h3-wave w4" viewBox="0 0 2880 200" preserveAspectRatio="none">
          <path
            d="M0 150 q90.0 -10 180.0 0 t180.0 0 q90.0 -10 180.0 0 t180.0 0 q90.0 -10 180.0 0 t180.0 0 q90.0 -10 180.0 0 t180.0 0 q90.0 -10 180.0 0 t180.0 0 q90.0 -10 180.0 0 t180.0 0 L2880 200 L0 200 Z"
            fill="#083E6E"
          />
        </svg>
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h3-boat" src={`${DESEN}/kayik.svg`} alt="" aria-hidden="true" />
      <div className="h3-sand" aria-hidden="true">
        <svg viewBox="0 0 800 300" preserveAspectRatio="none">
          <path
            d="M0 300 L0 210 C 160 120 360 60 560 70 C 680 76 760 96 800 110 L800 300 Z"
            fill="#F4E2B8"
          />
          <path
            d="M0 300 L0 250 C 200 170 420 130 620 140 C 700 144 760 156 800 166 L800 300 Z"
            fill="#E8C77E"
            opacity=".55"
          />
        </svg>
        <div className="h3-kum" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h3-olive" src={`${DESEN}/zeytin-dali.svg`} alt="" aria-hidden="true" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="h3-beg h3-beg-sand" src={`${DESEN}/begonvil.svg`} alt="" aria-hidden="true" />
      <div className="h3-petals" aria-hidden="true">
        {["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8"].map((cls) => (
          <span key={cls} className={`h3-petal ${cls}`} />
        ))}
      </div>

      <div className="h3-copy">
        <p className="h3-kicker">
          <span className="h3-pin">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"
                fill="#E4572E"
              />
              <circle cx="12" cy="10" r="2.6" fill="#FFFBF2" />
            </svg>
          </span>
          {hero.kicker}
        </p>
        <h1 id="hero-baslik">
          <span className="l1">
            <span className="w">{hero.displayWord1}</span>{" "}
            <span className="w grad">{hero.displayWord2}</span>
          </span>
          <span className="l2">
            <span className="w mark">{hero.displayWord3}</span>
          </span>
        </h1>
        <p className="h3-sub">{hero.title}</p>
        <p className="h3-lede">{hero.lead}</p>
        <div className="h3-cta">
          <a className="h3-btn h3-btn--coral h3-btn--lg" href={APP_HREF}>
            {hero.primaryCta}
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
          <a className="h3-btn h3-btn--sticker h3-btn--lg" href={BUSINESS_HREF}>
            {hero.secondaryCta}
          </a>
        </div>
        <div className="h3-chips">
          <a className="h3-chip h3-chip--kuafor" href={CATS_HREF}>
            <i />
            {hero.chipHair}
          </a>
          <a className="h3-chip h3-chip--guzellik" href={CATS_HREF}>
            <i />
            {hero.chipBeauty}
          </a>
          <a className="h3-chip h3-chip--klinik" href={CATS_HREF}>
            <i />
            {categories.clinic}
          </a>
          <a className="h3-chip h3-chip--restoran" href={CATS_HREF}>
            <i />
            {categories.resto}
          </a>
          <span className="h3-chip h3-chip--etkinlik">
            <i />
            {categories.events} <b>{categories.soon}</b>
          </span>
        </div>
        <p className="h3-pilot">
          <b>{hero.pilotLabel}</b> {search.cityValue} · {extraCities.join(" · ")}
        </p>
      </div>

      <div className="kabuki--hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/landing/maskot/kabuki-selam.webp"
          srcSet="/landing/maskot/kabuki-selam-512.webp 512w, /landing/maskot/kabuki-selam.webp 1024w"
          sizes="(max-width: 860px) 240px, 470px"
          width={1024}
          height={1024}
          alt={kabuki.alt}
          fetchPriority="high"
          decoding="async"
        />
        <p className="h3-bubble">{kabuki.how}</p>
      </div>

      <aside className="h3-card" aria-label={hero.sampleAria}>
        <div className="h3-card-top">
          <span className="am3-ornek">{examples.badge}</span>
          <span className="h3-st">
            <i />
            {businessPanel.stat3}
          </span>
        </div>
        <p className="h3-card-name">{sample.name}</p>
        <p className="h3-card-meta">
          {sample.city} · {sample.service}
        </p>
        <div className="h3-slots">
          <span>{hero.sampleSlotA}</span>
          <span className="on">{hero.sampleSlotB}</span>
        </div>
      </aside>

      <div className="h3-marquee" aria-hidden="true">
        <div className="h3-mq">
          <MarqueeTrack prefix="a" />
          <MarqueeTrack prefix="b" />
        </div>
      </div>
    </section>
  );
}
