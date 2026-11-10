import { hero, how, sectors, whatsapp, roadmap, pilot, waitlist, site } from "@ada-merkez/copy";
import { WaitlistForm } from "../components/WaitlistForm";

export default function HomePage() {
  return (
    <main id="icerik">
      <section className="hero">
        <div className="shell hero-grid">
          <div>
            <p className="kicker">{hero.kicker}</p>
            <h1>{hero.title}</h1>
            <p className="lead">{hero.lead}</p>
            <div className="hero-actions">
              <a className="button button-primary" href="#waitlist">
                {hero.primaryCta}
              </a>
              <a className="button button-secondary" href="#waitlist">
                {hero.secondaryCta}
              </a>
            </div>
          </div>
          <aside className="hero-panel" aria-label={site.name}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-yatay-acik.svg" alt="" width={220} height={40} />
            <dl>
              <dt>Keşif</dt>
              <dd>Şehir ve kategoriye göre işletme arama (v1 planı).</dd>
              <dt>Randevu</dt>
              <dd>Kuaför ve klinik: personel, hizmet, saat.</dd>
              <dt>Masa</dt>
              <dd>Restoran: masa planı ve rezervasyon.</dd>
            </dl>
          </aside>
        </div>
      </section>

      <section className="band" id="kapsam">
        <div className="shell">
          <h2>{how.title}</h2>
          <p className="muted">{how.intro}</p>
          <ol className="steps">
            {how.steps.map((step) => (
              <li key={step.n}>
                <span className="step-n">{step.n}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>{sectors.title}</h2>
        </div>
        <div className="shell split">
          {sectors.items.map((item) => (
            <article key={item.title}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section" id="whatsapp">
        <div className="shell">
          <h2>{whatsapp.title}</h2>
          <p className="section-intro">{whatsapp.body}</p>
        </div>
      </section>

      <section className="section">
        <div className="shell">
          <h2>{roadmap.title}</h2>
          <p className="section-intro">{roadmap.intro}</p>
          <ul className="roadmap">
            {roadmap.items.map((item) => (
              <li key={item.title}>
                <span className="badge">{item.badge}</span>
                <h3>{item.title}</h3>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section" id="isletmeler">
        <div className="shell pilot">
          <div>
            <h2>{pilot.title}</h2>
            <p className="section-intro">{pilot.body}</p>
          </div>
          <div className="cities" aria-label="Pilot şehirler">
            <span>Lefkoşa</span>
            <span>Girne</span>
            <span>Mağusa</span>
          </div>
        </div>
      </section>

      <section className="section" id="waitlist">
        <div className="shell waitlist-grid">
          <div>
            <h2>{waitlist.title}</h2>
            <p className="section-intro">{waitlist.intro}</p>
          </div>
          <WaitlistForm />
        </div>
      </section>
    </main>
  );
}
