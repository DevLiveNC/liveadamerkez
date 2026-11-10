import {
  close,
  hero,
  how,
  placeholders,
  pilot,
  roadmap,
  whatsapp,
} from "@ada-merkez/copy";
import { Logo } from "../components/Logo";
import { WaitlistForm } from "../components/WaitlistForm";

export default function HomePage() {
  return (
    <main id="icerik">
      <section className="hero">
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
              <a className="btn btn-coral btn-lg" href="#bekleme-listesi">
                {placeholders.cta}
              </a>
              <a className="btn btn-ghost btn-lg" href="/basvuru">
                {hero.secondaryCta}
              </a>
            </div>
            <p className="hero-note">{hero.note}</p>
          </div>
          <div className="span-6 cluster" aria-hidden="false">
            <aside className="cluster-float desk-only">
              <p className="t-label" style={{ marginBottom: 10 }}>
                Saat seç
              </p>
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
              </div>
              <div className="slots">
                <button className="slot off" type="button" disabled>
                  10:00
                </button>
                <button className="slot" type="button">
                  10:30
                </button>
                <button className="slot on" type="button">
                  11:00
                </button>
                <button className="slot" type="button">
                  11:30
                </button>
                <button className="slot off" type="button" disabled>
                  12:00
                </button>
                <button className="slot" type="button">
                  14:00
                </button>
              </div>
              <p className="t-xs t-muted" style={{ marginTop: 10 }}>
                Tasarım önizlemesi · puan yok
              </p>
            </aside>
            <div className="cluster-phone">
              <div className="device">
                <div className="device-screen">
                  <div className="app">
                    <div className="app-status">
                      <span>20:21</span>
                      <span>Lefkoşa</span>
                    </div>
                    <div className="app-body">
                      <p className="t-label" style={{ margin: "8px 0 6px" }}>
                        Keşif
                      </p>
                      <h3 className="t-h3" style={{ fontSize: 22, marginBottom: 12 }}>
                        Yarın için uygun saat
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          alignItems: "center",
                          background: "#fff",
                          border: "1px solid var(--am-color-border)",
                          borderRadius: 12,
                          padding: "10px 12px",
                          marginBottom: 12,
                        }}
                      >
                        <span className="t-sm t-muted">Kuaför, klinik, restoran</span>
                      </div>
                      <div className="filters">
                        <span className="filter on">Tümü</span>
                        <span className="filter">Kuaför</span>
                        <span className="filter">Klinik</span>
                        <span className="filter">Restoran</span>
                      </div>
                      <article className="biz">
                        <div className="biz-av" style={{ background: "#0F2C44" }}>
                          K
                        </div>
                        <div>
                          <h4>Örnek kuaför</h4>
                          <p>Köşklüçiftlik · Kesim, sakal</p>
                        </div>
                        <span className="slot-pill">11:00</span>
                      </article>
                      <article className="biz">
                        <div className="biz-av" style={{ background: "#1F6A8F" }}>
                          D
                        </div>
                        <div>
                          <h4>Örnek diş kliniği</h4>
                          <p>Girne Merkez · Kontrol</p>
                        </div>
                        <span className="slot-pill">14:30</span>
                      </article>
                      <article className="biz">
                        <div className="biz-av" style={{ background: "#E4572E" }}>
                          R
                        </div>
                        <div>
                          <h4>Örnek restoran</h4>
                          <p>Mağusa · 2 kişilik masa</p>
                        </div>
                        <span className="slot-pill">20:00</span>
                      </article>
                    </div>
                    <nav className="app-tabbar" aria-label="Müşteri gezinme">
                      <div className="app-tab on">Keşif</div>
                      <div className="app-tab">Randevu</div>
                      <div className="app-tab">Mesaj</div>
                      <div className="app-tab">Hesap</div>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
            <aside className="cluster-chat desk-only">
              <p className="t-xs t-muted" style={{ marginBottom: 8 }}>
                Stilize asistan akışı
              </p>
              <div className="bubble bubble-out" style={{ marginLeft: "auto" }}>
                Yarın saat 11:00, kesim.
              </div>
              <div className="bubble bubble-in" style={{ marginTop: 8 }}>
                11:00 için yer ayırdım. Onay mesajı gelecek.
              </div>
            </aside>
          </div>
        </div>
      </section>

      <section className="search-band" aria-label="Arama önizlemesi">
        <div className="wrap">
          <form className="search-bar" action="#nasil">
            <div className="search-field">
              <span>Şehir</span>
              <strong>
                Lefkoşa <em>Girne, Mağusa, Türkiye</em>
              </strong>
            </div>
            <div className="search-field">
              <span>Ne arıyorsun</span>
              <strong>Kuaför, klinik veya restoran</strong>
            </div>
            <div className="search-field">
              <span>Ne zaman</span>
              <strong>Yarın</strong>
            </div>
            <div className="search-go">
              <button className="btn btn-navy" type="submit">
                Saatleri gör
              </button>
            </div>
          </form>
          <div className="pilot-line">
            <p>{pilot.citiesNote}</p>
            <p>{pilot.previewNote}</p>
          </div>
        </div>
      </section>

      <section className="section" id="nasil">
        <div className="wrap">
          <div className="board-meta">
            <div className="board-lead">
              <p className="t-label section-kicker">{how.kicker}</p>
              <h2 className="t-h2">{how.title}</h2>
            </div>
            <p className="t-lede">{how.intro}</p>
          </div>
          <div className="board">
            <article className="board-a stage">
              <header className="stage-h">
                <div>
                  <b>01</b>
                  <h3>{how.steps[0].title}</h3>
                </div>
                <span className="t-xs t-muted">{how.steps[0].body}</span>
              </header>
              <div className="stage-b">
                <div className="filters">
                  <span className="filter on">Lefkoşa</span>
                  <span className="filter">Girne</span>
                  <span className="filter">Mağusa</span>
                  <span className="filter">Türkiye</span>
                  <span className="filter on">Kuaför</span>
                </div>
                <article className="biz">
                  <div className="biz-av" style={{ background: "#0F2C44" }}>
                    K
                  </div>
                  <div>
                    <h4>Örnek kuaför</h4>
                    <p>Köşklüçiftlik · Personel ve hizmet seçilir</p>
                  </div>
                  <span className="slot-pill">Uygun 11:00</span>
                </article>
                <article className="biz">
                  <div className="biz-av" style={{ background: "#1A4566" }}>
                    K
                  </div>
                  <div>
                    <h4>Örnek kuaför</h4>
                    <p>Gönyeli · Yalnız tasarım önizlemesi</p>
                  </div>
                  <span className="slot-pill">14:00</span>
                </article>
              </div>
            </article>
            <article className="board-b stage">
              <header className="stage-h">
                <div>
                  <b>02</b>
                  <h3>{how.steps[1].title}</h3>
                </div>
                <span className="t-xs t-muted">{how.steps[1].body}</span>
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
                </div>
                <p className="t-xs t-muted" style={{ marginBottom: 8 }}>
                  Kesim · 45 dk · fiyat işletmede
                </p>
                <div className="slots">
                  <button className="slot off" type="button" disabled>
                    09:30
                  </button>
                  <button className="slot" type="button">
                    10:00
                  </button>
                  <button className="slot on" type="button">
                    11:00
                  </button>
                  <button className="slot" type="button">
                    14:00
                  </button>
                </div>
              </div>
            </article>
            <article className="board-c ticket">
              <div>
                <div className="num">03</div>
                <h3>{how.steps[2].title}</h3>
              </div>
              <dl>
                <dt>Hizmet</dt>
                <dd>Kesim</dd>
                <dt>Tarih</dt>
                <dd>Çarşamba</dd>
                <dt>Saat</dt>
                <dd>11:00</dd>
                <dt>Yer</dt>
                <dd>Lefkoşa · örnek işletme</dd>
              </dl>
              <p className="ok">
                <span style={{ width: 8, height: 8, borderRadius: 99, background: "var(--am-color-live)", display: "inline-block" }} />{" "}
                {how.steps[2].body}
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="section wa" id="whatsapp">
        <div className="wrap g12">
          <div className="span-6 wa-copy">
            <p className="t-label section-kicker">{whatsapp.kicker}</p>
            <h2 className="t-h2">{whatsapp.title}</h2>
            <p className="t-lede">{whatsapp.body}</p>
            <div className="wa-steps">
              <div className="wa-step">
                <div className="wa-n">1</div>
                <div>
                  <strong>İşletmeyi veya ihtiyacı yaz</strong>
                  <p className="t-sm t-muted">“Yarın Girne’de kesim” yeterli.</p>
                </div>
              </div>
              <div className="wa-step">
                <div className="wa-n">2</div>
                <div>
                  <strong>Uygun saatleri gör</strong>
                  <p className="t-sm t-muted">Asistan boş slotları Europe/Nicosia saatine göre getirir.</p>
                </div>
              </div>
              <div className="wa-step">
                <div className="wa-n">3</div>
                <div>
                  <strong>Onayı al, hatırlatmayı aç</strong>
                  <p className="t-sm t-muted">Hatırlatma için açık rıza istenir. Metinler [doğrulanacak].</p>
                </div>
              </div>
            </div>
          </div>
          <div className="span-6">
            <div className="device device-wa">
              <div className="device-screen" style={{ height: 560, background: "#f3eee8" }}>
                <div className="chat">
                  <header className="chat-head">
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: 10,
                        background: "#E4572E",
                        display: "grid",
                        placeItems: "center",
                        color: "#FFF8F3",
                        fontWeight: 700,
                      }}
                    >
                      A
                    </div>
                    <div>
                      <h4>Ada Merkez asistanı</h4>
                      <p>Stilize akış · resmi arayüz değil</p>
                    </div>
                  </header>
                  <div style={{ padding: "12px 12px 16px", display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                    <div className="bubble bubble-in">Merhaba. Kuaför, klinik veya restoran için saat bakabilirim. Şehir ve gün söylemen yeterli.</div>
                    <div className="bubble bubble-out">Lefkoşa, yarın kesim. Öğleden önce.</div>
                    <div className="bubble bubble-in">Lefkoşa. Öğleden önce boş saatler: 10:30, 11:00. Hangisini ayıralım?</div>
                    <div className="bubble bubble-out">11:00 olsun.</div>
                    <div className="bubble bubble-in">11:00 için yer ayırdım. Onay işletmeden gelince yazarım. Hatırlatma ister misin?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="biz-sec" id="isletmeler">
        <div className="wrap g12">
          <div className="span-6">
            <p className="t-label section-kicker">{pilot.kicker}</p>
            <h2 className="t-h2">{pilot.heading}</h2>
            <p className="t-lede">{pilot.body}</p>
            <div className="hero-cta" style={{ marginTop: 28 }}>
              <a className="btn btn-coral" href="/basvuru">
                {hero.secondaryCta}
              </a>
              <a className="btn btn-ghost on-dark" href="#bekleme-listesi">
                {placeholders.cta}
              </a>
            </div>
          </div>
        </div>
        <div className="wrap">
          <div className="panel-bleed" role="img" aria-label="İşletme paneli tasarım önizlemesi: günlük takvim, gelen istekler ve boş saatler">
            <aside className="p-side">
              <Logo inverted height={28} decorative className="logo-h-lg" />
              <p className="t-xs" style={{ color: "rgba(247,244,239,0.5)", margin: "16px 8px 8px" }}>
                Örnek işletme
              </p>
              <a className="navi on" href="#isletmeler">
                Bugün
              </a>
              <a className="navi" href="#isletmeler">
                Takvim
              </a>
              <a className="navi" href="#isletmeler">
                WhatsApp gelen
              </a>
            </aside>
            <div className="p-cal">
              <h3>Salı · Lefkoşa</h3>
              <div className="cal">
                <div className="cal-times">
                  <time>09:00</time>
                  <time>10:00</time>
                  <time>11:00</time>
                  <time>12:00</time>
                  <time>13:00</time>
                  <time>14:00</time>
                  <time>15:00</time>
                  <time>16:00</time>
                </div>
                <div className="cal-track">
                  <div className="apt apt-blue" style={{ top: 4, height: 44 }}>
                    <b>Kontrol</b> Müşteri A. Y.
                  </div>
                  <div className="apt apt-open" style={{ top: 56, height: 44 }}>
                    Boş saat
                  </div>
                  <div className="apt apt-coral" style={{ top: 108, height: 70 }}>
                    <b>Kesim + sakal</b> 11:00–12:30
                  </div>
                  <div className="apt apt-open" style={{ top: 212, height: 44 }}>
                    Boş saat
                  </div>
                </div>
              </div>
            </div>
            <aside className="p-inbox">
              <h4>Gelen WhatsApp istekleri</h4>
              <div className="inq">
                <strong>Yarın 11:00 · kesim</strong>
                <span style={{ color: "rgba(247,244,239,0.65)" }}>Stilize mesaj · onay bekliyor</span>
              </div>
              <p className="t-xs" style={{ color: "rgba(247,244,239,0.45)", marginTop: 8 }}>
                İsimler yer tutucu baş harftir. Gerçek müşteri verisi yoktur.
              </p>
            </aside>
          </div>
        </div>
      </section>

      <section className="later" id="sonra">
        <div className="wrap">
          <p className="t-label section-kicker">Aynı çatıda, sonraki evre</p>
          <h2 className="t-h2" style={{ maxWidth: "14em" }}>
            v1 keşif, randevu ve WhatsApp. Diğerleri planlanan evrede.
          </h2>
          <div className="rail">
            {roadmap.items.map((item) => (
              <div className="rail-item" key={item.title}>
                <span>{item.badge}</span>
                <h3>{item.title}</h3>
                <p>v1’de yok; sonraki evrede.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="close" id="yakinda">
        <div className="wrap">
          <div className="close-box">
            <div>
              <p className="t-label" style={{ color: "var(--am-brand-coral-light)" }}>
                {close.kicker}
              </p>
              <h2>{close.title}</h2>
              <p>{close.body}</p>
            </div>
            <div className="close-actions">
              <a className="btn btn-coral btn-lg" href="#bekleme-listesi">
                {placeholders.cta}
              </a>
              <a className="btn btn-ghost on-dark btn-lg" href="/basvuru">
                {hero.secondaryCta}
              </a>
              <p className="t-xs" style={{ color: "rgba(247,244,239,0.5)" }}>
                {close.meta}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="form-hero" id="bekleme-listesi">
        <WaitlistForm />
      </section>
    </main>
  );
}
