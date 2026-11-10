import {
  businessPanel,
  categories,
  closeCta,
  cta,
  events,
  examples,
  faq,
  hero,
  heroShot,
  howBoard,
  kabuki,
  later,
  pilotCities,
  search,
  tools,
  waitlist,
  whatsappFlow,
} from "@ada-merkez/copy";
import { SearchWhen } from "../components/SearchWhen";
import { WaitlistForm } from "../components/WaitlistForm";

function StockImg({
  name,
  alt,
  width = 1600,
  height = 1067,
  priority = false,
}: {
  name: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/landing/stok/${name}.webp`}
      alt={alt}
      width={width}
      height={height}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
    />
  );
}

function Kabuki({
  pose,
  line,
  variant,
}: {
  pose: "selam" | "goster" | "dusunen";
  line: string;
  variant: "hero" | "compact";
}) {
  const sizes =
    variant === "hero" ? "(max-width: 860px) 240px, 400px" : "(max-width: 860px) 180px, 216px";
  return (
    <aside className={variant === "hero" ? "kabuki kabuki--hero" : "kabuki kabuki--compact"} aria-label={kabuki.name}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/landing/maskot/kabuki-${pose}.webp`}
        srcSet={`/landing/maskot/kabuki-${pose}-512.webp 512w, /landing/maskot/kabuki-${pose}.webp 1024w`}
        sizes={sizes}
        width={1024}
        height={1024}
        alt={kabuki.alt}
        loading={variant === "hero" ? "eager" : "lazy"}
        decoding="async"
      />
      <div className="kabuki-copy">
        <p className="kabuki-name">{kabuki.name}</p>
        <p className="kabuki-bubble">{line}</p>
      </div>
    </aside>
  );
}

export default function HomePage() {
  return (
    <main id="icerik">
      <section className="hero">
        <div className="hero-dekor" aria-hidden="true" />
        <svg className="hero-art" viewBox="0 0 400 400" aria-hidden="true">
          <path
            fill="#0F2C44"
            d="M320 90 l-28 14 -14 4 -5 6 -30 13 -6-1 -13 8 -25 4 -37-4 -15-5 1 22 -7 10 -4 1 -6-3 -12-2 -10 1 -8 12 -7 5 h-5 l-8-7 -1 1 5 26 5 5 4 12 6 5 24 9 13-3 8 1 4 12 h9 l-2-7 8-9 18-1 12-4 3-4 11-3 4-4 6-1 3-4 1-10 4-5 11-1 7 5 10-6 5 0 9 3 -5-9 -15-16 2-14 5-6 9 0 8-12 45-29z"
          />
          <circle cx="200" cy="155" r="14" />
        </svg>
        <div className="wrap g12">
          <div className="span-6 hero-copy">
            <p className="t-label">{hero.kicker}</p>
            <h1 className="t-display">{hero.title}</h1>
            <p className="t-lede">{hero.lead}</p>
            <div className="hero-cta">
              <a className="btn btn-coral btn-lg" href="#waitlist">
                {hero.primaryCta}
              </a>
              <a className="btn btn-ghost btn-lg" href="/basvuru">
                {hero.secondaryCta}
              </a>
            </div>
          </div>
          <div className="span-6 hero-stage">
            <Kabuki pose="selam" line={kabuki.hero} variant="hero" />
            <div className="device device-shot">
              <div className="device-screen">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/landing/ekran/kesif-mobil.webp"
                  alt={heroShot.alt}
                  width={780}
                  height={1688}
                  loading="eager"
                  decoding="async"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="search-band" aria-label={search.label}>
        <div className="wrap">
          <form className="search-bar" action="#kategoriler" method="get">
            <div className="search-field">
              <span>{search.cityLabel}</span>
              <strong>
                {search.cityValue} <em>{search.cityMore}</em>
              </strong>
            </div>
            <div className="search-field">
              <span>{search.whatLabel}</span>
              <strong>{search.whatValue}</strong>
            </div>
            <div className="search-field">
              <span>{search.whenLabel}</span>
              <SearchWhen />
            </div>
            <div className="search-go">
              <button className="btn btn-navy" type="submit">
                {search.submit}
              </button>
            </div>
          </form>
          <div className="pilot-line">
            <p>{search.pilot}</p>
          </div>
        </div>
      </section>

      <section className="section" id="kategoriler">
        <div className="wrap">
          <div className="section-intro">
            <div className="lead">
              <p className="t-label section-kicker">{categories.kicker}</p>
              <h2 className="t-h2">{categories.title}</h2>
            </div>
            <p className="t-lede">{categories.lede}</p>
          </div>
          <div className="cats">
            <article className="cat cat-a">
              <div className="cat-media">
                <StockImg name="kuafor-salon" alt={categories.hairAlt} />
              </div>
              <div className="cat-shade" aria-hidden="true" />
              <div className="cat-copy">
                <h3>{categories.hair}</h3>
                <p>{categories.hairHint}</p>
              </div>
            </article>
            <article className="cat cat-b">
              <div className="cat-media">
                <StockImg name="klinik-muayene" alt={categories.clinicAlt} />
              </div>
              <div className="cat-shade" aria-hidden="true" />
              <div className="cat-copy">
                <h3>{categories.clinic}</h3>
                <p>{categories.clinicHint}</p>
              </div>
            </article>
            <article className="cat cat-c">
              <div className="cat-media">
                <StockImg name="restoran-servis" alt={categories.restoAlt} />
              </div>
              <div className="cat-shade" aria-hidden="true" />
              <div className="cat-copy">
                <h3>{categories.resto}</h3>
                <p>{categories.restoHint}</p>
              </div>
            </article>
            <article className="cat cat-soon cat-d">
              <span className="badge-soon">{categories.soon}</span>
              <h3>{categories.events}</h3>
              <p>{categories.eventsHint}</p>
            </article>
            <article className="cat cat-soon cat-e">
              <span className="badge-soon">{categories.soon}</span>
              <h3>{categories.student}</h3>
              <p>{categories.studentHint}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="ornekler" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-intro">
            <div className="lead">
              <p className="t-label section-kicker">{examples.kicker}</p>
              <h2 className="t-h2">{examples.title}</h2>
            </div>
            <p className="t-lede">{examples.lede}</p>
          </div>
          <div className="examples">
            {examples.cards.map((card) => (
              <article className="ex" key={card.name}>
                <div className="ex-media">
                  <StockImg name={card.image} alt="" />
                  <span className="badge-ornek">{examples.badge}</span>
                </div>
                <div className="ex-body">
                  <p className="cat-tag">{card.category}</p>
                  <h3>{card.name}</h3>
                  <p>
                    {card.city} · {card.service}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="etkinlik">
        <div className="wrap">
          <div className="section-intro">
            <div className="lead">
              <p className="t-label section-kicker">{events.kicker}</p>
              <h2 className="t-h2">{events.title}</h2>
            </div>
            <p className="t-lede">{events.lede}</p>
          </div>
          <div className="events">
            {events.cards.map((card) => (
              <article className="ev" key={card.name}>
                <div className="ev-media">
                  <StockImg name={card.image} alt="" />
                  <div className="ev-flags">
                    <span className="badge-soon">{categories.soon}</span>
                    <span className="badge-ornek">{examples.badge}</span>
                  </div>
                </div>
                <div className="ev-body">
                  <p className="cat-tag">{card.city}</p>
                  <h3>{card.name}</h3>
                  <p>{card.hint}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="nasil">
        <div className="wrap">
          <div className="board-meta">
            <div className="board-lead">
              <p className="t-label section-kicker">{howBoard.kicker}</p>
              <h2 className="t-h2">{howBoard.title}</h2>
            </div>
            <p className="t-lede">{howBoard.lede}</p>
          </div>
          <Kabuki pose="goster" line={kabuki.how} variant="compact" />
          <div className="board">
            <article className="board-a stage">
              <header className="stage-h">
                <div>
                  <b>01</b>
                  <h3>{howBoard.s1Title}</h3>
                </div>
                <span className="stage-body-note">{howBoard.s1Body}</span>
              </header>
              <div className="stage-b">
                <div className="filters">
                  <span className="filter on">{waitlist.cities.lefkosa}</span>
                  <span className="filter">{waitlist.cities.girne}</span>
                  <span className="filter">{waitlist.cities.magusa}</span>
                  <span className="filter on">{categories.hair}</span>
                  <span className="filter">{categories.clinic}</span>
                  <span className="filter">{categories.resto}</span>
                </div>
                {examples.cards.filter((_, index) => index % 2 === 0).map((card, index) => (
                  <article className="biz" key={card.name}>
                    <div className="biz-av" style={{ background: ["#0F2C44", "#1F6A8F", "#E4572E"][index] }}>
                      {card.name.slice(6, 7)}
                    </div>
                    <div>
                      <h4>{card.name}</h4>
                      <p>
                        {card.city} · {card.service}
                      </p>
                    </div>
                    <span className="badge-ornek">{examples.badge}</span>
                  </article>
                ))}
              </div>
            </article>
            <article className="board-b stage">
              <header className="stage-h">
                <div>
                  <b>02</b>
                  <h3>{howBoard.s2Title}</h3>
                </div>
                <span className="stage-body-note">
                  {howBoard.s2Body}
                  <br />
                  {howBoard.tz}
                </span>
              </header>
              <div className="stage-b">
                <div className="dates">
                  <div className="date">
                    <span>Sal</span>
                    <strong>10</strong>
                  </div>
                  <div className="date on">
                    <span>Çar</span>
                    <strong>11</strong>
                  </div>
                  <div className="date">
                    <span>Per</span>
                    <strong>12</strong>
                  </div>
                  <div className="date">
                    <span>Cum</span>
                    <strong>13</strong>
                  </div>
                </div>
                <div className="slots">
                  <button className="slot off" type="button" disabled>
                    09:30
                  </button>
                  <button className="slot" type="button">
                    10:00
                  </button>
                  <button className="slot" type="button">
                    10:30
                  </button>
                  <button className="slot on" type="button">
                    11:00
                  </button>
                  <button className="slot off" type="button" disabled>
                    11:30
                  </button>
                  <button className="slot" type="button">
                    12:00
                  </button>
                  <button className="slot off" type="button" disabled>
                    12:30
                  </button>
                  <button className="slot" type="button">
                    14:00
                  </button>
                  <button className="slot" type="button">
                    14:30
                  </button>
                </div>
              </div>
            </article>
            <article className="board-c ticket">
              <div>
                <div className="num">03</div>
                <h3>{howBoard.s3Title}</h3>
                <p className="ticket-lede">{howBoard.s3Body}</p>
              </div>
              <dl>
                <dt>{howBoard.service}</dt>
                <dd>{examples.cards[0].service}</dd>
                <dt>{howBoard.date}</dt>
                <dd>{howBoard.dateValue}</dd>
                <dt>{howBoard.time}</dt>
                <dd>11:00</dd>
                <dt>{howBoard.place}</dt>
                <dd>{howBoard.placeValue}</dd>
              </dl>
              <p className="ok">
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--am-color-live)", display: "inline-block" }} />{" "}
                {howBoard.status}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section wa" id="whatsapp">
        <div className="wrap g12">
          <div className="span-6 wa-copy">
            <p className="t-label section-kicker">{whatsappFlow.kicker}</p>
            <h2 className="t-h2">{whatsappFlow.title}</h2>
            <p className="t-lede">{whatsappFlow.lede}</p>
            <div className="wa-steps">
              <div className="wa-step">
                <div className="wa-n">1</div>
                <div>
                  <strong>{whatsappFlow.s1Title}</strong>
                  <p className="t-sm t-muted">{whatsappFlow.s1Body}</p>
                </div>
              </div>
              <div className="wa-step">
                <div className="wa-n">2</div>
                <div>
                  <strong>{whatsappFlow.s2Title}</strong>
                  <p className="t-sm t-muted">{whatsappFlow.s2Body}</p>
                </div>
              </div>
              <div className="wa-step">
                <div className="wa-n">3</div>
                <div>
                  <strong>{whatsappFlow.s3Title}</strong>
                  <p className="t-sm t-muted">{whatsappFlow.s3Body}</p>
                </div>
              </div>
            </div>
            <p className="wa-foot">{whatsappFlow.footnote}</p>
          </div>
          <div className="span-6">
            <div className="device device-wa">
              <div className="device-screen" style={{ height: 560, background: "#f3eee8" }}>
                <div className="chat">
                  <header className="chat-head">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/landing/maskot/kabuki-avatar-48.png"
                      width={36}
                      height={36}
                      alt=""
                      style={{ width: 36, height: 36, borderRadius: 10, background: "#F8F0E3" }}
                    />
                    <div>
                      <h4>{whatsappFlow.headTitle}</h4>
                      <p>{whatsappFlow.headSub}</p>
                    </div>
                  </header>
                  <div style={{ padding: "12px 12px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <div className="bubble bubble-in">{whatsappFlow.b1}</div>
                    <div className="bubble bubble-out">{whatsappFlow.b2}</div>
                    <div className="bubble bubble-in">{whatsappFlow.b3}</div>
                    <div className="bubble bubble-out">{whatsappFlow.b4}</div>
                    <div className="bubble bubble-in">{whatsappFlow.b5}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="biz-sec" id="isletmeler">
        <div className="wrap">
          <div className="biz-intro">
            <div>
              <p className="t-label section-kicker">{businessPanel.kicker}</p>
              <h2 className="t-h2" style={{ maxWidth: "14em" }}>
                {businessPanel.title}
              </h2>
              <p className="t-lede" style={{ marginTop: 16 }}>
                {businessPanel.lede}
              </p>
            </div>
            <Kabuki pose="goster" line={kabuki.business} variant="compact" />
          </div>
          <ul className="biz-points">
            <li>
              <strong>{businessPanel.feat1Title}</strong>
              <span>{businessPanel.feat1Body}</span>
            </li>
            <li>
              <strong>{businessPanel.feat2Title}</strong>
              <span>{businessPanel.feat2Body}</span>
            </li>
            <li>
              <strong>{businessPanel.feat3Title}</strong>
              <span>{businessPanel.feat3Body}</span>
            </li>
          </ul>
          <div className="biz-stats" role="group" aria-label={businessPanel.statsLabel}>
            <article className="biz-stat">
              <span className="badge-ornek">{examples.badge}</span>
              <p className="biz-stat-value">4</p>
              <p className="biz-stat-label">{businessPanel.stat1}</p>
            </article>
            <article className="biz-stat">
              <span className="badge-ornek">{examples.badge}</span>
              <p className="biz-stat-value">2</p>
              <p className="biz-stat-label">{businessPanel.stat2}</p>
            </article>
            <article className="biz-stat">
              <span className="badge-ornek">{examples.badge}</span>
              <p className="biz-stat-value">1</p>
              <p className="biz-stat-label">{businessPanel.stat3}</p>
            </article>
          </div>
          <div className="cal-board">
            <span className="badge-ornek cal-board-badge">{examples.badge}</span>
            <aside className="cal-side">
              <p className="cal-side-kicker">{businessPanel.calPanel}</p>
              <h3>{examples.cards[0].name}</h3>
              <p className="cal-side-meta">
                {waitlist.cities.lefkosa} · {howBoard.tz}
              </p>
              <nav className="cal-side-nav" aria-label={businessPanel.navLabel}>
                <span className="is-on">{businessPanel.navCal}</span>
                <span>{businessPanel.navReq}</span>
                <span>{businessPanel.navSvc}</span>
              </nav>
            </aside>
            <div className="cal-main">
              <header className="cal-head">
                <div>
                  <h3 id="cal-board-title">{businessPanel.calTitle}</h3>
                  <p>{businessPanel.calSub}</p>
                </div>
                <ul className="cal-legend">
                  <li>
                    <i className="st-ok" aria-hidden="true" /> {businessPanel.ok}
                  </li>
                  <li>
                    <i className="st-wait" aria-hidden="true" /> {businessPanel.wait}
                  </li>
                  <li>
                    <i className="st-off" aria-hidden="true" /> {businessPanel.off}
                  </li>
                  <li>
                    <i className="st-free" aria-hidden="true" /> {businessPanel.free}
                  </li>
                </ul>
              </header>
              <div className="cal-grid" aria-labelledby="cal-board-title">
                <div className="cal-hours" aria-hidden="true">
                  <span>09:00</span>
                  <span>10:00</span>
                  <span>11:00</span>
                  <span>12:00</span>
                  <span>13:00</span>
                  <span>14:00</span>
                  <span>15:00</span>
                  <span>16:00</span>
                  <span>17:00</span>
                </div>
                <div className="cal-track">
                  <div className="cal-slot is-ok" style={{ top: 0, height: "calc(1 * var(--row))" }}>
                    <time>09:00–10:00</time>
                    <strong>{businessPanel.a1}</strong>
                    <span className="chip chip-ok">{businessPanel.ok}</span>
                  </div>
                  <div className="cal-slot is-free" style={{ top: "calc(1 * var(--row))", height: "calc(1 * var(--row))" }}>
                    <time>10:00–11:00</time>
                    <strong>{businessPanel.free}</strong>
                  </div>
                  <div className="cal-slot is-ok" style={{ top: "calc(2 * var(--row))", height: "calc(1.5 * var(--row))" }}>
                    <time>11:00–12:30</time>
                    <strong>{businessPanel.a2}</strong>
                    <span className="chip chip-ok">{businessPanel.ok}</span>
                  </div>
                  <div className="cal-slot is-free" style={{ top: "calc(3.5 * var(--row))", height: "calc(1.5 * var(--row))" }}>
                    <time>12:30–14:00</time>
                    <strong>{businessPanel.free}</strong>
                  </div>
                  <div className="cal-slot is-wait" style={{ top: "calc(5 * var(--row))", height: "calc(1 * var(--row))" }}>
                    <time>14:00–15:00</time>
                    <strong>{businessPanel.a3}</strong>
                    <span className="chip chip-wait">{businessPanel.wait}</span>
                  </div>
                  <div className="cal-slot is-off" style={{ top: "calc(6 * var(--row))", height: "calc(1 * var(--row))" }}>
                    <time>15:00–16:00</time>
                    <strong>{businessPanel.a4}</strong>
                    <span className="chip chip-off">{businessPanel.off}</span>
                  </div>
                  <div className="cal-slot is-free" style={{ top: "calc(7 * var(--row))", height: "calc(1 * var(--row))" }}>
                    <time>16:00–17:00</time>
                    <strong>{businessPanel.free}</strong>
                  </div>
                </div>
              </div>
            </div>
            <aside className="cal-inbox">
              <h3>{businessPanel.inbox}</h3>
              <article className="req">
                <p className="req-time">11:00</p>
                <div>
                  <p className="req-title">{businessPanel.a2}</p>
                  <p className="req-meta">{waitlist.cities.lefkosa}</p>
                </div>
                <span className="chip chip-ok">{businessPanel.ok}</span>
              </article>
              <article className="req is-wait">
                <p className="req-time">14:00</p>
                <div>
                  <p className="req-title">{businessPanel.a3}</p>
                  <p className="req-meta">{waitlist.cities.lefkosa}</p>
                </div>
                <span className="chip chip-wait">{businessPanel.wait}</span>
              </article>
              <article className="req">
                <p className="req-time">15:00</p>
                <div>
                  <p className="req-title">{businessPanel.a4}</p>
                  <p className="req-meta">{waitlist.cities.lefkosa}</p>
                </div>
                <span className="chip chip-off">{businessPanel.off}</span>
              </article>
              <article className="req is-empty">
                <p className="req-time">16:00</p>
                <div>
                  <p className="req-title">{businessPanel.free}</p>
                  <p className="req-meta">{businessPanel.freeHint}</p>
                </div>
              </article>
            </aside>
          </div>
          <div className="biz-cta">
            <a className="btn btn-coral" href="/basvuru">
              {cta.business}
            </a>
            <span className="note status-soon">{waitlist.closedShort}</span>
          </div>
        </div>
      </section>

      <section className="section" id="araclar">
        <div className="wrap">
          <div className="section-intro">
            <div className="lead">
              <p className="t-label section-kicker">{tools.kicker}</p>
              <h2 className="t-h2">{tools.title}</h2>
            </div>
            <p className="t-lede">{tools.lede}</p>
          </div>
          <div className="tools">
            <article className="tool">
              <div className="tool-mark" aria-hidden="true">
                <span className="qr-mark">
                  <i />
                  <i />
                  <i />
                  <i />
                </span>
              </div>
              <div>
                <span className="badge-soon">{later.badge}</span>
                <h3>{later.qrTitle}</h3>
                <p>{later.qrBody}</p>
              </div>
            </article>
            <article className="tool">
              <div className="tool-mark" aria-hidden="true">
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
                  <rect x="4" y="8" width="28" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M10 20h16M10 15h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="badge-soon">{later.badge}</span>
                <h3>{later.posTitle}</h3>
                <p>{later.posBody}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="pilot" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="section-intro">
            <div className="lead">
              <p className="t-label section-kicker">{pilotCities.kicker}</p>
              <h2 className="t-h2">{pilotCities.title}</h2>
            </div>
            <p className="t-lede">{pilotCities.lede}</p>
          </div>
          <div className="pilots">
            <article className="pilot">
              <h3>{waitlist.cities.lefkosa}</h3>
              <p>{pilotCities.lefkosa}</p>
            </article>
            <article className="pilot">
              <h3>{waitlist.cities.girne}</h3>
              <p>{pilotCities.girne}</p>
            </article>
            <article className="pilot">
              <h3>{waitlist.cities.magusa}</h3>
              <p>{pilotCities.magusa}</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="sss">
        <div className="wrap">
          <div className="sss-head">
            <div>
              <p className="t-label section-kicker">{faq.kicker}</p>
              <h2 className="t-h2">{faq.title}</h2>
            </div>
            <Kabuki pose="dusunen" line={kabuki.faq} variant="compact" />
          </div>
          <div className="faq" style={{ marginTop: 24 }}>
            {faq.items.map((item, index) => (
              <details key={item.q} open={index === 0}>
                <summary>{item.q}</summary>
                <p className="ans">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="later" id="sonra">
        <div className="wrap">
          <p className="t-label section-kicker">{later.kicker}</p>
          <h2 className="t-h2" style={{ maxWidth: "16em" }}>
            {later.title}
          </h2>
          <div className="rail">
            <div className="rail-item">
              <span>{later.badge}</span>
              <h3>{later.qrTitle}</h3>
              <p>{later.qrBody}</p>
            </div>
            <div className="rail-item">
              <span>{later.badge}</span>
              <h3>{later.posTitle}</h3>
              <p>{later.posBody}</p>
            </div>
            <div className="rail-item">
              <span>{later.badge}</span>
              <h3>{later.ticketTitle}</h3>
              <p>{later.ticketBody}</p>
            </div>
            <div className="rail-item">
              <span>{later.badge}</span>
              <h3>{later.campusTitle}</h3>
              <p>{later.campusBody}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="close" id="waitlist">
        <div className="wrap">
          <div className="close-box">
            <div>
              <p className="t-label" style={{ color: "var(--am-brand-coral-light)", textTransform: "none", letterSpacing: "0.02em" }}>
                {closeCta.kicker}
              </p>
              <h2>{closeCta.title}</h2>
              <p>{closeCta.body}</p>
            </div>
            <div className="close-actions">
              <a className="btn btn-coral btn-lg" href="/bekleme-listesi">
                {cta.customer}
              </a>
              <a className="btn btn-ghost on-dark btn-lg" href="/basvuru">
                {cta.business}
              </a>
              <p className="status-soon">{waitlist.closedShort}</p>
            </div>
          </div>
        </div>
        <div className="form-hero" style={{ paddingTop: 48 }}>
          <WaitlistForm />
        </div>
      </section>
    </main>
  );
}
