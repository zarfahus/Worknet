#!/usr/bin/env node
// Checks the built site in dist/: every internal link and #anchor resolves, and every page
// carries the details Stripe's website review looks for (policy links, contact details, USD).
//   node scripts/build.mjs && node scripts/check.mjs
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIST = join(ROOT, "dist");
const site = JSON.parse(readFileSync(join(ROOT, "src/data/site.json"), "utf8"));

const files = [];
const walk = (dir) => readdirSync(dir).forEach((f) => (statSync(join(dir, f)).isDirectory() ? walk(join(dir, f)) : f.endsWith(".html") && files.push(join(dir, f))));
walk(DIST);

const redirects = new Set(readFileSync(join(DIST, "_redirects"), "utf8").split("\n").filter(Boolean).map((l) => l.split(" ")[0]));
const pageFor = (path) => {
  const clean = path.split("#")[0].split("?")[0];
  if (redirects.has(clean)) return "redirect";
  const candidates = [join(DIST, clean), join(DIST, clean, "index.html")];
  return candidates.find((c) => existsSync(c) && statSync(c).isFile()) || null;
};
const ids = (file) => new Set([...readFileSync(file, "utf8").matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const required = ["/terms/", "/refund-policy/", "/privacy/", "/cookies/", "/legal-notice/", "/contact/", `mailto:${site.email}`, "tel:"];
const problems = [];
let links = 0;
for (const file of files) {
  const rel = "/" + file.slice(DIST.length + 1).replace(/index\.html$/, "");
  const html = readFileSync(file, "utf8");
  for (const [, href] of html.matchAll(/\shref="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:)/.test(href)) continue;
    links++;
    const [path, anchor] = href.startsWith("#") ? [rel, href.slice(1)] : href.split("#");
    const target = pageFor(path);
    if (!target) problems.push(`${rel}: broken link ${href}`);
    else if (anchor && target !== "redirect" && target.endsWith(".html") && !ids(target).has(anchor)) problems.push(`${rel}: missing anchor ${href}`);
  }
  for (const [, src] of html.matchAll(/\ssrc="([^"?]+)/g)) if (!pageFor(src)) problems.push(`${rel}: missing file ${src}`);
  if (rel === "/404.html") continue;
  for (const r of required) if (!html.includes(r)) problems.push(`${rel}: missing ${r}`);
  if (!html.includes(site.address.street)) problems.push(`${rel}: missing business address`);
  if (/\$\d/.test(html.replace(/<script[\s\S]*?<\/script>/g, "")) && !html.includes("USD")) problems.push(`${rel}: shows a price without USD`);
}
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log(`Checked ${files.length} pages and ${links} internal links: no problems.`);
