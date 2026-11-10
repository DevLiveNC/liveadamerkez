import Link from "next/link";
import { app, examples } from "@ada-merkez/copy";

const COLORS = ["#0F2C44", "#1F6A8F", "#E4572E", "#0E7C78"];

export default function AppHomePage() {
  return (
    <>
      <header className="am-head">
        <p className="t-label">{app.kicker}</p>
        <h1>{app.homeTitle}</h1>
        <input
          className="am-search"
          type="search"
          placeholder={app.searchPlaceholder}
          aria-label={app.searchPlaceholder}
        />
        <div className="am-chips">
          <span className="filter on">{app.all}</span>
          <span className="filter">{app.hair}</span>
          <span className="filter">{app.clinic}</span>
          <span className="filter">{app.resto}</span>
          <span className="filter" style={{ opacity: 0.55 }}>
            {app.events} <span className="badge-soon">{app.soon}</span>
          </span>
        </div>
      </header>
      <p className="am-banner">{app.demoBanner}</p>
      {examples.cards.map((card, index) => (
        <Link className="am-biz" href={`/app/isletmeler/${index + 1}`} key={card.name}>
          <div className="am-biz-av" style={{ background: COLORS[index % COLORS.length] }}>
            {card.name.replace("Örnek ", "").slice(0, 1)}
          </div>
          <div>
            <h2>{card.name}</h2>
            <p>
              {card.city} · {card.service}
            </p>
          </div>
          <span className="badge-ornek">{app.example}</span>
        </Link>
      ))}
    </>
  );
}
