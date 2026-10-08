#!/usr/bin/env node
// Build the static site into dist/ (no dependencies).
//   node scripts/build.mjs
import { createHash } from "node:crypto";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as legal from "../src/site/legal.mjs";
import * as pages from "../src/site/pages.mjs";
import { layout } from "../src/site/ui.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const site = readJson("src/data/site.json");
const catalog = readJson("src/data/catalog.json");
const manifest = readJson("src/data/manifest.json");

for (const p of catalog.products) {
  if (!manifest.products[p.slug]) throw new Error(`No generated files for ${p.slug}; run products/generate.py`);
}

const hashes = new Map();
const asset = (path) => {
  if (!hashes.has(path)) {
    const file = join(ROOT, "src/static", path);
    hashes.set(path, createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 10));
  }
  return `${path}?v=${hashes.get(path)}`;
};

const ctx = { site, catalog, manifest, asset };

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "src/static"), DIST, { recursive: true });

const all = [
  pages.home(ctx),
  pages.shop(ctx),
  ...catalog.products.map((p) => pages.product(ctx, p)),
  pages.checkout(ctx),
  pages.order(ctx),
  pages.about(ctx),
  pages.faq(ctx),
  pages.contact(ctx),
  legal.terms(ctx),
  legal.privacy(ctx),
  legal.refunds(ctx),
  legal.delivery(ctx),
  legal.cookies(ctx),
  pages.notFound(ctx),
];

for (const page of all) {
  const rel = page.file || join(page.path, "index.html");
  const out = join(DIST, rel);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, layout(ctx, page));
}

const today = new Date().toISOString().slice(0, 10);
const indexable = all.filter((p) => !p.noindex);
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${site.url}${p.path}</loc><lastmod>${today}</lastmod></url>`).join("\n")}
</urlset>
`
);

writeFileSync(
  join(DIST, "robots.txt"),
  `User-agent: *
Disallow: /checkout/
Disallow: /order/
Disallow: /api/

Sitemap: ${site.url}/sitemap.xml
`
);

// Cloudflare Pages headers for static assets. (Functions set their own headers.)
const csp = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self'",
  "script-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");
writeFileSync(
  join(DIST, "_headers"),
  `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000

/order/*
  X-Robots-Tag: noindex
  Referrer-Policy: no-referrer
  Cache-Control: no-store

/checkout/*
  X-Robots-Tag: noindex

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable

/assets/js/*
  Cache-Control: public, max-age=31536000, immutable

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable
`
);

writeFileSync(
  join(DIST, "_redirects"),
  `/cart /checkout/ 301
/products /shop/ 301
/products/ /shop/ 301
/templates /shop/ 301
/terms-of-service /terms/ 301
/privacy-policy /privacy/ 301
/refund-policy /refunds/ 301
/cookie-policy /cookies/ 301
/shipping /delivery/ 301
`
);

if (!existsSync(join(DIST, "favicon.svg"))) throw new Error("favicon.svg missing from src/static");
console.log(`Built ${all.length} pages into dist/`);
