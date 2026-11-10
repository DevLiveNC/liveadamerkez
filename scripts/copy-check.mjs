#!/usr/bin/env node
/**
 * Kullanıcıya görünen metin taraması (Kontrol şartı).
 * Hedef: landing, i18n, meta, OG, manifest, API kullanıcı mesajları.
 *
 * Yasak:
 * - yasaklı bölge kısaltması (bölge adı: Kuzey Kıbrıs)
 * - üstünlük iddiası (ilk / tek)
 * - onaylanmamış ücretsiz teklif
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");

const TARGET_DIRS = ["apps", "packages", "docs"];

const EXTENSIONS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".json",
  ".html",
  ".css",
  ".md",
  ".webmanifest",
]);

const SKIP_DIR_NAMES = new Set(["node_modules", ".next", "dist"]);

/** @type {{ id: string, pattern: RegExp, hint: string }[]} */
const RULES = [
  {
    id: "kktc",
    pattern: /kktc/i,
    hint: "Yazılmaz. Bölge adı: 'Kuzey Kıbrıs'. Bölge ifadesi: 'Kuzey Kıbrıs ve Türkiye için'.",
  },
  {
    id: "ucretsiz-kurulum",
    pattern: /ücretsiz\s+kurulum|ucretsiz\s+kurulum/i,
    hint: "Onaylanmamış teklif. Yazmayın.",
  },
  {
    id: "musteri-ucretsiz",
    pattern:
      /müşteri(?:ler)?\s+için\s+ücretsiz|musteri(?:ler)?\s+icin\s+ucretsiz/i,
    hint: "Onaylanmamış teklif. Yazmayın.",
  },
  {
    id: "ucretsiz-randevu",
    pattern: /ücretsiz\s+(randevu|rezervasyon)|ucretsiz\s+(randevu|rezervasyon)/i,
    hint: "Onaylanmamış teklif. Yazmayın.",
  },
  {
    id: "ilk-ve-tek",
    pattern: /ilk\s+ve\s+tek/i,
    hint: "Üstünlük iddiası yasak.",
  },
  {
    id: "adanin-ilk-tek",
    pattern: /adan[ıi]n\s+(ilk|tek)\b/i,
    hint: "Üstünlük iddiası yasak.",
  },
  {
    id: "tek-adres-platform",
    pattern: /\btek\s+(adres|platform|süper\s+uygulama|uygulama)\b/i,
    hint: "Üstünlük iddiası yasak.",
  },
  {
    id: "ilk-super",
    pattern: /\bilk\s+(süper\s+uygulama|uygulama|platform|adres)\b/i,
    hint: "Üstünlük iddiası yasak.",
  },
];

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIR_NAMES.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (EXTENSIONS.has(path.extname(entry.name))) out.push(full);
  }
  return out;
}

const files = TARGET_DIRS.flatMap((rel) => walk(path.join(ROOT, rel)));
/** @type {{ file: string, line: number, id: string, excerpt: string, hint: string }[]} */
const hits = [];

function scanLine(line) {
  return line
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/\[[^\]]*\]\([^)]*\)/g, "");
}

for (const file of files) {
  const text = fs.readFileSync(file, "utf8");
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i += 1) {
    const line = scanLine(lines[i] ?? "");
    for (const rule of RULES) {
      if (rule.pattern.test(line)) {
        hits.push({
          file: path.relative(ROOT, file),
          line: i + 1,
          id: rule.id,
          excerpt: line.trim().slice(0, 180),
          hint: rule.hint,
        });
      }
    }
  }
}

if (hits.length > 0) {
  console.error("copy-check: yasaklı ifade bulundu:\n");
  for (const hit of hits) {
    console.error(`  [${hit.id}] ${hit.file}:${hit.line}`);
    console.error(`    ${hit.excerpt}`);
    console.error(`    → ${hit.hint}\n`);
  }
  process.exit(1);
}

console.log(
  `copy-check: ${files.length} dosya tarandı, yasaklı ifade yok (bölge kısaltması / ilk-tek iddiası / ücretsiz teklif).`,
);
