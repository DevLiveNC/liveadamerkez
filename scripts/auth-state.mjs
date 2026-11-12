#!/usr/bin/env node
/**
 * Playwright storageState üretir — giriş gerektiren ekranların görüntüsü için.
 *
 * API ve landing ayakta olmalı. Akış gerçek uçlardan geçer; kullanıcı
 * oluşturulmaz, veritabanına yazılmaz.
 *
 * Kullanım:
 *   # 1) Telefon + doğrulama kodu ile oturum aç
 *   node scripts/auth-state.mjs --phone +905519630564 --code 123456 --role customer
 *
 *   # 2) Hazır çerez başlığından üret (ör. tarayıcıdan kopyalandı)
 *   AM_APP_COOKIE="am_session=..." node scripts/auth-state.mjs
 *
 * Çıktı: artifacts/auth-state.json (varsayılan)
 *   node scripts/shots.mjs --auth artifacts/auth-state.json
 */
import fs from "node:fs";
import path from "node:path";

const args = new Map();
for (let i = 2; i < process.argv.length; i += 1) {
  const token = process.argv[i];
  if (!token.startsWith("--")) continue;
  const [flag, inline] = token.split("=", 2);
  const value = inline ?? process.argv[i + 1];
  if (inline === undefined) i += 1;
  args.set(flag.replace(/^--/, ""), value);
}

const appURL = (args.get("app-url") ?? process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3100").replace(/\/$/, "");
const apiURL = (args.get("api-url") ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3001").replace(/\/$/, "");
const out = path.resolve(args.get("out") ?? "artifacts/auth-state.json");
const cookieEnv = process.env.AM_APP_COOKIE ?? args.get("cookie");
const phone = args.get("phone");
const code = args.get("code");
const role = args.get("role") ?? "customer";

function fail(message) {
  console.error(`auth-state: ${message}`);
  process.exit(1);
}

function parseCookieHeader(header) {
  return header
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const index = part.indexOf("=");
      if (index < 1) return null;
      return { name: part.slice(0, index), value: part.slice(index + 1) };
    })
    .filter(Boolean);
}

async function tokenFromLogin() {
  if (!phone || !code) return null;
  const res = await fetch(`${apiURL}/v1/auth/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ phone, code, role }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok || !body?.ok || !body?.token) {
    fail(`oturum açılamadı (HTTP ${res.status}). Telefon ve kod aynı ortama ait olmalı.`);
  }
  return body.token;
}

const cookieName = process.env.AM_SESSION_COOKIE ?? "am_session";
let cookies = [];

if (cookieEnv) {
  cookies = parseCookieHeader(cookieEnv).map((cookie) => ({
    ...cookie,
    url: appURL,
    httpOnly: true,
    sameSite: "Lax",
  }));
} else {
  const token = await tokenFromLogin();
  if (!token) {
    fail("kaynak yok. --phone ve --code verin ya da AM_APP_COOKIE tanımlayın.");
  }
  cookies = [
    {
      name: cookieName,
      value: token,
      url: appURL,
      httpOnly: true,
      sameSite: "Lax",
    },
  ];
}

if (!cookies.length) fail("çerez üretilemedi.");

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `${JSON.stringify({ cookies, origins: [] }, null, 2)}\n`);
console.log(`auth-state: ${cookies.length} çerez yazıldı → ${path.relative(process.cwd(), out)}`);
