import { expect, test } from "@playwright/test";
import { DEKOR_DIM_2X, dekorDisplaySize, withinNaturalPixels } from "../packages/ui/src/dekor/srcset.ts";

const ROUTES = [
  "/",
  "/basvuru",
  "/bekleme-listesi",
  "/yasal/aydinlatma",
  "/yasal/gizlilik",
  "/yasal/kvkk",
  "/offline",
];

const FORBIDDEN_BITMAP = /(?:dalga|kum-tepecigi|kopuk-serit|kemer)(?:-m)?\.webp|ayak-izi(?:-m)?\.webp/;

const TEXT_SEL = [
  "h1",
  "h2",
  "h3",
  "p",
  "a.btn",
  "button",
  "label",
  ".kabuki-bubble",
  ".kabuki-name",
  ".device-shot",
  ".search-bar",
  ".ticket",
].join(", ");

test("dekor sahnesi tüm landing sayfalarında; dalga/kum/köpük bitmap yok", async ({ page }) => {
  for (const route of ROUTES) {
    const response = await page.goto(route);
    expect(response?.ok(), route).toBeTruthy();
    await expect(page.locator("html[data-dekor='landing']")).toHaveCount(1);
    await expect(page.locator("body[data-dekor='landing']")).toHaveCount(1);
    const sources = await page.locator("img").evaluateAll((imgs) =>
      imgs
        .flatMap((img) => [img.getAttribute("src") ?? "", img.getAttribute("srcset") ?? ""])
        .join(" "),
    );
    expect(sources, route).not.toMatch(FORBIDDEN_BITMAP);
    expect(await page.locator('script[src*="dekor.js"]').count()).toBe(0);
  }
});

/** v3 hero kendi sahnesini çizer; masaüstünde kalan spritelar zeytin + yaprak + yıldız. */
const DESKTOP_DEKOR_ITEMS = 3;

test("landing YERLESIM: svg şeritler ve spritelar", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForFunction(
    (n) => document.querySelectorAll(".am-dekor-item").length === n,
    DESKTOP_DEKOR_ITEMS,
  );
  await expect(page.locator(".am-dekor-item")).toHaveCount(DESKTOP_DEKOR_ITEMS);
  await expect(page.locator(".am-dekor--zeytin.am-dekor--desk-only")).toHaveCount(1);
  await expect(page.locator(".am-dekor-band--foam")).toHaveCount(2);
  await expect(page.locator(".am-dekor-band--wave")).toHaveCount(2);
  await expect(page.locator(".am-dekor-band--tracks")).toHaveCount(1);
  await expect(page.locator('img[src*="dalga-kenar"]')).toHaveCount(2);
  await expect(page.locator('img[src*="kopuk"]')).toHaveCount(2);
  await expect(page.locator('img[src*="ayak-izi"]')).toHaveCount(1);
});

test("dekor sprite: renderedWidth * DPR ≤ naturalWidth", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForFunction(() => document.querySelectorAll("img[data-am-dekor-sprite]").length >= 1);
  await page.locator("img[data-am-dekor-sprite]").evaluateAll(async (imgs) => {
    await Promise.all(
      imgs.map((img) => {
        const el = img as HTMLImageElement;
        el.loading = "eager";
        el.scrollIntoView({ block: "nearest", inline: "nearest" });
        if (el.complete) return Promise.resolve();
        return Promise.race([
          el.decode().catch(() => undefined),
          new Promise<void>((resolve) => {
            window.setTimeout(resolve, 1500);
          }),
        ]);
      }),
    );
  });

  const palmiye = dekorDisplaySize(
    {
      src2x: "/palmiye.webp",
      width2x: DEKOR_DIM_2X.palmiye.width2x,
      height2x: DEKOR_DIM_2X.palmiye.height2x,
      src1x: "/palmiye-1x.webp",
    },
    156,
  );
  expect(palmiye.width).toBe(156);
  expect(withinNaturalPixels(palmiye.width, 2, DEKOR_DIM_2X.palmiye.width2x)).toBe(true);
  expect(withinNaturalPixels(palmiye.width, 1, 156)).toBe(true);

  const live = await page.locator("img[data-am-dekor-sprite]").evaluateAll((imgs) => {
    const dpr = window.devicePixelRatio || 1;
    return imgs
      .filter((img) => {
        const style = window.getComputedStyle(img.closest(".am-dekor-item") ?? img);
        return style.display !== "none" && img.getBoundingClientRect().width > 0;
      })
      .map((img) => {
        const rendered = img.getBoundingClientRect().width;
        const natural = (img as HTMLImageElement).naturalWidth;
        return {
          src: (img as HTMLImageElement).currentSrc || img.getAttribute("src"),
          rendered,
          dpr,
          natural,
          ok: natural === 0 || rendered * dpr <= natural + 0.5,
        };
      });
  });
  expect(live.length).toBeGreaterThan(0);
  for (const item of live) {
    expect(item.ok, JSON.stringify(item)).toBe(true);
  }
});

test("masaüstü 1x ekranda 2x palmiye inmez", async ({ page }) => {
  const urls: string[] = [];
  page.on("request", (req) => urls.push(req.url()));
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForFunction(
    (n) => document.querySelectorAll(".am-dekor-item").length === n,
    DESKTOP_DEKOR_ITEMS,
  );
  const palmiye2x = urls.filter(
    (url) => /palmiye/.test(url) && !/palmiye-1x/.test(url) && !/palmiye-m/.test(url) && /\.webp(?:\?|$)/.test(url),
  );
  expect(palmiye2x, palmiye2x.join("\n")).toEqual([]);
});

test("landing yatay taşma yok", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector(".am-dekor-band");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflow).toBe(false);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await page.waitForSelector(".am-dekor-band");
  const overflowMob = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  expect(overflowMob).toBe(false);
});

test("dekor metin/kart/düğme ile çakışmaz", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForFunction(
    (n) => document.querySelectorAll(".am-dekor-item").length === n,
    DESKTOP_DEKOR_ITEMS,
  );
  const hits = await page.evaluate((textSel) => {
    const overlap = (a: DOMRect, b: DOMRect) => {
      const x = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
      const y = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      return x * y;
    };
    const text = [...document.querySelectorAll(textSel)]
      .map((el) => ({ el, box: el.getBoundingClientRect() }))
      .filter(({ box }) => box.width > 8 && box.height > 8);
    const items = [...document.querySelectorAll(".am-dekor-item, .am-dekor-svg")]
      .filter((el) => !el.closest(".am-dekor-band") || el.classList.contains("am-dekor--yildiz") || el.classList.contains("am-dekor--ayak-izi-svg"))
      .filter((el) => window.getComputedStyle(el).display !== "none");
    const out: string[] = [];
    for (const item of items) {
      const ib = item.getBoundingClientRect();
      if (ib.width < 4 || ib.height < 4) continue;
      for (const t of text) {
        const area = overlap(ib, t.box);
        if (area > 24) {
          out.push(`${item.className} × ${t.el.tagName}.${t.el.className} (${Math.round(area)}px²)`);
        }
      }
    }
    return out;
  }, TEXT_SEL);
  expect(hits, hits.join("\n")).toEqual([]);
});

test("mobilde desk-only DOM'da yok", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.waitForSelector(".am-dekor-band");
  await expect(page.locator(".am-dekor-item")).toHaveCount(0);
  await expect(page.locator(".am-dekor--desk-only")).toHaveCount(0);
  await expect(page.locator(".am-dekor--sarmal")).toHaveCount(0);
  await expect(page.locator(".am-dekor--begonvil")).toHaveCount(0);
  await expect(page.locator(".am-dekor--cakil")).toHaveCount(0);
});

test("reduced-motion paralaksı kapatır", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForSelector("[data-parallax]");
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(80);
  const moving = await page.locator("[data-parallax]").evaluateAll((els) =>
    els.some((el) => {
      const t = el.style.transform || window.getComputedStyle(el).transform;
      return Boolean(t) && t !== "none" && t !== "translate3d(0px, 0px, 0px)";
    }),
  );
  expect(moving).toBe(false);
});
