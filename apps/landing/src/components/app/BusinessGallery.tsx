"use client";

import { useState, type ReactNode, type UIEvent } from "react";

export function BusinessGallery({
  slides,
  nav,
}: {
  slides: readonly string[];
  nav: ReactNode;
}) {
  const [index, setIndex] = useState(0);

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const el = event.currentTarget;
    if (!el.clientWidth) return;
    setIndex(Math.round(el.scrollLeft / el.clientWidth));
  }

  return (
    <div className="am-gallery">
      <div className="am-gallery-track" onScroll={onScroll}>
        {slides.length ? (
          slides.map((src, slideIndex) => (
            <div className="am-gallery-slide" key={`${src}-${slideIndex}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" width={780} height={780} />
            </div>
          ))
        ) : (
          <div className="am-gallery-slide" />
        )}
      </div>
      {nav}
      {slides.length > 1 ? (
        <div className="am-dots" aria-hidden="true">
          {slides.map((src, i) => (
            <span key={`${src}-dot-${i}`} className={i === index ? "am-dot is-on" : "am-dot"} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
