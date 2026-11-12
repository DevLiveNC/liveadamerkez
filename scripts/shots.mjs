#!/usr/bin/env node
/**
 * Görsel denetim: rota × görünüm genişliği taraması.
 *
 * Her rota için:
 *  - ekran görüntüsü (artifacts/shots/<slug>-<genişlik>.png)
 *  - konsol hatası sayısı
 *  - yatay taşma (scrollWidth > clientWidth + 1)
 *
 * Kullanım:
 *   node scripts/shots.mjs                       # http://127.0.0.1:3100
 *   node scripts/shots.mjs --base-url http://127.0.0.1:3100
 *   node scripts/shots.mjs --auth artifacts/auth-state.json
 *   node scripts/shots.mjs --only /app,/app/randevular
 *
 * Giriş gerektiren rotalar oturum açmadan /app/giris'e yönlenir; bu bir hata
 * değildir, ekran görüntüsü yönlendirilmiş hâliyle alınır.
 */
import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const token = process.argv[i];
  if (!token.startsWith("--")) continue;
  const [flag, inline] = token.split("=", 2);
  const value = inline ?? process.argv[i + 1];
  if (inline === undefined) i += 1;
  args.set(flag.replace(/^--/, ""), value);
}

const baseURL = (args.get("base-url") ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const outDir = path.resolve(args.get("out") ?? "artifacts/shots");
const authState = args.get("auth");
const widths = (args.get("widths") ?? "320,390,1280").split(",").map((value) => Number.parseInt(value, 10));

const DEFAULT_ROUTES = [
  "/",
  "/bekleme-listesi",
  "/app",
  "/app?q=kuaf%C3%B6r",
  "/app?liste=1",
  "/app/isletmeler/1",
  "/app/randevular",
  "/app/favoriler",
  "/app/hesap",
  "/app/yetki",
  "/app/giris",
  "/app/olmayan-rota",
];

const routes = (args.get("only") ?? DEFAULT_ROUTES.join(",")).split(",").filter(Boolean);

function slugFor(route) {
  const clean = route.replace(/^\//, "").replace(/[?=&%/,]+/g, "-").replace(/-+$/, "");
  return clean || "kok";
}

fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const problems = [];
let shots = 0;

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: width >= 1000 ? 900 : 844 },
    reducedMotion: "reduce",
    storageState: authState && fs.existsSync(authState) ? authState : undefined,
  });
  const page = await context.newPage();

  for (const route of routes) {
    const consoleErrors = [];
    const onConsole = (message) => {
      if (message.type() === "error") consoleErrors.push(message.text());
    };
    const onPageError = (error) => consoleErrors.push(String(error));
    page.on("console", onConsole);
    page.on("pageerror", onPageError);

    try {
      const response = await page.goto(`${baseURL}${route}`, { waitUntil: "networkidle", timeout: 30_000 });
      const status = response?.status() ?? 0;
      if (status >= 400) problems.push({ route, width, kind: "http", detail: `HTTP ${status}` });

      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return { scroll: doc.scrollWidth, client: doc.clientWidth };
      });
      if (overflow.scroll > overflow.client + 1) {
        problems.push({
          route,
          width,
          kind: "overflow",
          detail: `${overflow.scroll}px > ${overflow.client}px`,
        });
      }

      for (const error of consoleErrors) {
        problems.push({ route, width, kind: "console", detail: error.slice(0, 240) });
      }
    } catch (error) {
      problems.push({ route, width, kind: "gidis", detail: String(error).slice(0, 240) });
    } finally {
      page.off("console", onConsole);
      page.off("pageerror", onPageError);
    }

    const file = path.join(outDir, `${slugFor(route)}-${width}.png`);
    await page.screenshot({ path: file, fullPage: false });
    shots += 1;
  }

  await context.close();
}

await browser.close();

const summary = {
  baseURL,
  widths,
  routes: routes.length,
  screenshots: shots,
  problems,
};
fs.writeFileSync(path.join(outDir, "rapor.json"), `${JSON.stringify(summary, null, 2)}\n`);

if (problems.length) {
  console.error(`shots: ${problems.length} sorun bulundu (${shots} görüntü)`);
  for (const problem of problems) {
    console.error(`  [${problem.kind}] ${problem.route} @${problem.width}px — ${problem.detail}`);
  }
  process.exit(1);
}

console.log(`shots: ${shots} görüntü · ${routes.length} rota × ${widths.length} genişlik · sorun yok`);
