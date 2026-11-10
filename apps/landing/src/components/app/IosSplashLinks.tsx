const SPLASH = [
  { w: 440, h: 956, dpr: 3, portrait: "1320x2868", landscape: "2868x1320" },
  { w: 420, h: 912, dpr: 3, portrait: "1260x2736", landscape: "2736x1260" },
  { w: 402, h: 874, dpr: 3, portrait: "1206x2622", landscape: "2622x1206" },
  { w: 430, h: 932, dpr: 3, portrait: "1290x2796", landscape: "2796x1290" },
  { w: 393, h: 852, dpr: 3, portrait: "1179x2556", landscape: "2556x1179" },
  { w: 428, h: 926, dpr: 3, portrait: "1284x2778", landscape: "2778x1284" },
  { w: 390, h: 844, dpr: 3, portrait: "1170x2532", landscape: "2532x1170" },
  { w: 375, h: 812, dpr: 3, portrait: "1125x2436", landscape: "2436x1125" },
  { w: 414, h: 896, dpr: 3, portrait: "1242x2688", landscape: "2688x1242" },
  { w: 414, h: 896, dpr: 2, portrait: "828x1792", landscape: "1792x828" },
  { w: 414, h: 736, dpr: 3, portrait: "1242x2208", landscape: "2208x1242" },
  { w: 375, h: 667, dpr: 2, portrait: "750x1334", landscape: "1334x750" },
  { w: 320, h: 568, dpr: 2, portrait: "640x1136", landscape: "1136x640" },
  { w: 1032, h: 1376, dpr: 2, portrait: "2064x2752", landscape: "2752x2064" },
  { w: 1024, h: 1366, dpr: 2, portrait: "2048x2732", landscape: "2732x2048" },
  { w: 834, h: 1210, dpr: 2, portrait: "1668x2420", landscape: "2420x1668" },
  { w: 834, h: 1194, dpr: 2, portrait: "1668x2388", landscape: "2388x1668" },
  { w: 820, h: 1180, dpr: 2, portrait: "1640x2360", landscape: "2360x1640" },
  { w: 834, h: 1112, dpr: 2, portrait: "1668x2224", landscape: "2224x1668" },
  { w: 810, h: 1080, dpr: 2, portrait: "1620x2160", landscape: "2160x1620" },
  { w: 768, h: 1024, dpr: 2, portrait: "1536x2048", landscape: "2048x1536" },
  { w: 744, h: 1133, dpr: 2, portrait: "1488x2266", landscape: "2266x1488" },
] as const;

function media(width: number, height: number, dpr: number, orientation: "portrait" | "landscape") {
  return `screen and (device-width: ${width}px) and (device-height: ${height}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: ${orientation})`;
}

export function IosSplashLinks() {
  return (
    <>
      {SPLASH.flatMap((item) => [
        <link
          key={`${item.portrait}-p`}
          rel="apple-touch-startup-image"
          media={media(item.w, item.h, item.dpr, "portrait")}
          href={`/app/splash/splash-${item.portrait}.png`}
        />,
        <link
          key={`${item.landscape}-l`}
          rel="apple-touch-startup-image"
          media={media(item.w, item.h, item.dpr, "landscape")}
          href={`/app/splash/splash-${item.landscape}.png`}
        />,
      ])}
    </>
  );
}
