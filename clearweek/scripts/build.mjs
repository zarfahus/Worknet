#!/usr/bin/env node
// Build the ClearWeek Studio static site into dist/ (no dependencies).
//   node scripts/build.mjs
import { createHash } from "node:crypto";
import { cpSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import * as legal from "../src/site/legal.mjs";
import * as pages from "../src/site/pages.mjs";
import { layout } from "../src/site/ui.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const readJson = (p) => JSON.parse(readFileSync(join(ROOT, p), "utf8"));

const site = readJson("src/data/site.json");
const products = readJson("src/data/products.json");
const previews = readJson("src/data/previews.json");

// The store sells exactly these two products at exactly these prices, in USD.
const EXPECTED = { "weekly-focus-planner": 1299, "project-workflow-bundle": 1999 };
if (products.currency !== "USD" || site.currency !== "USD") throw new Error("Currency must be USD");
if (products.products.length !== 2 || !products.products.every((p) => EXPECTED[p.slug] === p.price)) {
  throw new Error("products.json must contain exactly the two products at $12.99 and $19.99");
}

const hashes = new Map();
const asset = (path) => {
  if (!hashes.has(path)) hashes.set(path, createHash("sha256").update(readFileSync(join(ROOT, "src/static", path))).digest("hex").slice(0, 10));
  return `${path}?v=${hashes.get(path)}`;
};

const ctx = { site, products, previews, asset };

rmSync(DIST, { recursive: true, force: true });
mkdirSync(DIST, { recursive: true });
cpSync(join(ROOT, "src/static"), DIST, { recursive: true });

const all = [
  pages.home(ctx),
  pages.shop(ctx),
  ...products.products.map((p) => pages.product(ctx, p)),
  ...products.products.map((p) => pages.checkout(ctx, p)),
  pages.howItWorks(ctx),
  pages.faq(ctx),
  pages.about(ctx),
  pages.contact(ctx),
  pages.downloadHelp(ctx),
  legal.terms(ctx),
  legal.refunds(ctx),
  legal.privacy(ctx),
  legal.cookies(ctx),
  legal.legalNotice(ctx),
  legal.accessibility(ctx),
  pages.notFound(ctx),
];

const banned = [/\[ENTER/i, /\bTODO\b/, /lorem ipsum/i, /placeholder/i, /\{\{|\}\}/, /undefined|NaN|\[object Object\]/];
for (const page of all) {
  const html = layout(ctx, page);
  for (const re of banned) {
    if (re.test(html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/g, ""))) {
      throw new Error(`${page.path}: output matches ${re}`);
    }
  }
  const out = join(DIST, page.file || join(page.path, "index.html"));
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, html);
}

const indexable = all.filter((p) => !p.noindex);
writeFileSync(
  join(DIST, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${indexable.map((p) => `  <url><loc>${site.url}${p.path}</loc><lastmod>${site.policiesUpdated}</lastmod></url>`).join("\n")}
</urlset>
`
);

writeFileSync(join(DIST, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

const expires = new Date(Date.now() + 360 * 864e5).toISOString().replace(/\.\d+Z$/, "Z");
mkdirSync(join(DIST, ".well-known"), { recursive: true });
writeFileSync(join(DIST, ".well-known/security.txt"), `Contact: mailto:${site.email}\nExpires: ${expires}\nPreferred-Languages: en\nCanonical: ${site.url}/.well-known/security.txt\n`);

// Security headers. HTML is marked no-transform so the CDN never injects scripts (such as an
// analytics beacon) that the Privacy and Cookie policies say aren't used.
const csp = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self'",
  "script-src 'self'",
  "font-src 'self'",
  "connect-src 'self'",
  "form-action 'self' https://checkout.stripe.com",
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
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000
  Cache-Control: public, max-age=0, must-revalidate, no-transform

/checkout/*
  X-Robots-Tag: noindex

/assets/css/*
  Cache-Control: public, max-age=31536000, immutable

/assets/js/*
  Cache-Control: public, max-age=31536000, immutable

/assets/fonts/*
  Cache-Control: public, max-age=31536000, immutable

/assets/img/*
  Cache-Control: public, max-age=604800

/assets/previews/*
  Cache-Control: public, max-age=604800
`
);

// Common policy URLs that crawlers and customers try, pointing at the canonical pages.
writeFileSync(
  join(DIST, "_redirects"),
  [
    ["/products", "/shop/"],
    ["/products/", "/shop/"],
    ["/store", "/shop/"],
    ["/terms-of-service", "/terms/"],
    ["/terms-and-conditions", "/terms/"],
    ["/tos", "/terms/"],
    ["/refunds", "/refund-policy/"],
    ["/refund", "/refund-policy/"],
    ["/return-policy", "/refund-policy/"],
    ["/returns", "/refund-policy/"],
    ["/delivery", "/refund-policy/#delivery"],
    ["/delivery-policy", "/refund-policy/#delivery"],
    ["/shipping", "/refund-policy/#delivery"],
    ["/shipping-policy", "/refund-policy/#delivery"],
    ["/cancellation-policy", "/refund-policy/#cancellations"],
    ["/privacy-policy", "/privacy/"],
    ["/cookie-policy", "/cookies/"],
    ["/imprint", "/legal-notice/"],
    ["/impressum", "/legal-notice/"],
    ["/contact-us", "/contact/"],
    ["/support", "/contact/"],
    ["/checkout", "/shop/"],
    ["/checkout/", "/shop/"],
  ]
    .map(([from, to]) => `${from} ${to} 301`)
    .join("\n") + "\n"
);

// Pre-launch reminders. These never block the build; they list what only the owner can supply.
const reminders = [];
if (!site.legalName) reminders.push("legalName is empty: add the legal name of the person or company that owns ClearWeek Studio (src/data/site.json).");
if (!site.checkoutOpen) reminders.push("checkoutOpen is false: product pages say checkout opens soon and the order buttons are disabled.");
const size = (dir) => readdirSync(dir).reduce((n, f) => n + (statSync(join(dir, f)).isDirectory() ? size(join(dir, f)) : statSync(join(dir, f)).size), 0);
console.log(`Built ${all.length} pages into dist/ (${Math.round(size(DIST) / 1024)} KB)`);
for (const r of reminders) console.log(`  ! ${r}`);
