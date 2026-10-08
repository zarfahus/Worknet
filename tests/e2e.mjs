// End-to-end test: real Pages Functions (wrangler pages dev) + local R2 + mock Stripe + headless browser.
//   npm run build && node tests/e2e.mjs
// Requires products/out/ (python3 products/generate.py) and Playwright with a Chromium build.
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(ROOT, "src/data/manifest.json"), "utf8"));
const SITE_PORT = 8799;
const STRIPE_PORT = 12111;
const BASE = `http://127.0.0.1:${SITE_PORT}`;
const STRIPE = `http://127.0.0.1:${STRIPE_PORT}`;
const env = { ...process.env, WRANGLER_SEND_METRICS: "false", NO_COLOR: "1" };
const children = [];

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function seedLocalR2() {
  const marker = join(ROOT, ".wrangler", `seeded-${sha256(JSON.stringify(manifest.files)).slice(0, 12)}`);
  if (existsSync(marker)) return;
  for (const f of Object.values(manifest.files)) {
    const src = join(ROOT, "products/out", f.key);
    const r = spawnSync("npx", ["wrangler", "r2", "object", "put", `worknest-studio-files/${f.key}`, "--file", src, "--local"], { cwd: ROOT, env, encoding: "utf8" });
    assert.equal(r.status, 0, `seeding ${f.key} failed: ${r.stderr}`);
  }
  writeFileSync(marker, "ok");
}

async function waitFor(url, label) {
  for (let i = 0; i < 120; i++) {
    try {
      await fetch(url);
      return;
    } catch {
      await sleep(500);
    }
  }
  throw new Error(`${label} did not start`);
}

function start(cmd, args, label) {
  // detached: own process group, so stopping it also stops npx's wrangler/workerd children
  const child = spawn(cmd, args, { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
  let log = "";
  child.stdout.on("data", (d) => (log += d));
  child.stderr.on("data", (d) => (log += d));
  child.on("exit", (code) => code && code !== 143 && console.error(`${label} exited ${code}\n${log.slice(-3000)}`));
  children.push(child);
  return child;
}

const api = (path, init) => fetch(BASE + path, init).then(async (r) => ({ status: r.status, headers: r.headers, body: await r.arrayBuffer() }));
const asJson = (r) => JSON.parse(Buffer.from(r.body).toString());

async function main() {
  seedLocalR2();
  start("node", ["tests/mock-stripe.mjs", String(STRIPE_PORT)], "mock stripe");
  start("npx", ["wrangler", "pages", "dev", "dist", "--port", String(SITE_PORT), "--ip", "127.0.0.1",
    "--binding", "STRIPE_SECRET_KEY=sk_test_mock", "--binding", `STRIPE_API_BASE=${STRIPE}`], "wrangler");
  await waitFor(`${STRIPE}/__state`, "mock stripe");
  await waitFor(`${BASE}/`, "wrangler pages dev");

  // --- API validation -------------------------------------------------------
  const post = (body, headers = {}) =>
    api("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json", ...headers }, body: JSON.stringify(body) });
  assert.equal((await post({ items: ["weekly-focus-planner"], acceptTerms: true })).status, 400, "consent is required");
  assert.equal((await post({ items: ["not-a-product"], acceptTerms: true, digitalConsent: true })).status, 400, "unknown items rejected");
  assert.equal((await post({ items: [], acceptTerms: true, digitalConsent: true })).status, 400, "empty cart rejected");
  assert.equal((await post({ items: ["weekly-focus-planner"], acceptTerms: true, digitalConsent: true }, { Origin: "https://evil.example" })).status, 403, "cross-origin rejected");
  const priceTamper = asJson(await post({ items: ["weekly-focus-planner"], acceptTerms: true, digitalConsent: true, price: 1 }));
  const tamperedSession = (await (await fetch(`${STRIPE}/__state`)).json()).sessions.at(-1);
  assert.equal(tamperedSession.received_params["line_items[0][price_data][unit_amount]"], "1299", "price always comes from the catalog");
  assert.equal(tamperedSession.received_params["line_items[0][price_data][currency]"], "usd");
  assert.equal(tamperedSession.metadata.digital_content_consent, "true");
  assert.ok(priceTamper.url.startsWith(STRIPE), "checkout returns the hosted payment URL");
  assert.equal((await api("/api/order?session_id=nope")).status, 400, "invalid session id");
  assert.equal((await api("/api/order?session_id=cs_test_doesnotexist123")).status, 404, "unknown session");
  console.log("✓ API validation");

  // --- Browser purchase flow ------------------------------------------------
  const require = createRequire(import.meta.url);
  const pwPath = process.env.PW_PATH || spawnSync("npm", ["root", "-g"], { encoding: "utf8" }).stdout.trim() + "/playwright";
  const { chromium } = require(pwPath);
  const browser = await chromium.launch();
  const page = await browser.newPage({ acceptDownloads: true });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && !/status of 40[34]/.test(m.text()) && errors.push(m.text()));

  await page.goto(`${BASE}/products/complete-productivity-toolkit/`);
  await page.click("[data-add-to-cart]");
  await page.waitForSelector("[data-cart-feedback]:not(.hidden)");
  await page.goto(`${BASE}/products/weekly-focus-planner/`);
  await page.click("[data-buy-now]");
  await page.waitForURL(`${BASE}/checkout/`);
  await page.waitForSelector(".cart-item");
  assert.equal(await page.locator(".cart-item").count(), 2);
  assert.match(await page.locator("#cart-notices").innerText(), /already includes the Weekly Focus Planner/);
  assert.equal(await page.locator("#summary-subtotal").innerText(), "$32.98 USD");
  await page.click('button[aria-label="Remove Weekly Focus Planner from cart"]');
  assert.equal(await page.locator(".cart-item").count(), 1);
  assert.equal(await page.locator("#summary-subtotal").innerText(), "$19.99 USD");
  assert.ok(await page.locator("#checkout-submit").isDisabled(), "submit disabled until consents are given");
  await page.check("#accept-terms");
  assert.ok(await page.locator("#checkout-submit").isDisabled());
  await page.check("#digital-consent");
  await page.click("#checkout-submit");
  await page.waitForURL(/\/order\/\?session_id=cs_test_/);
  await page.waitForSelector("text=Thank you — your order is confirmed");
  const sessionId = new URL(page.url()).searchParams.get("session_id");
  const orderText = await page.locator("#order-root").innerText();
  assert.match(orderText, /WN-[A-Z0-9]{8}/);
  assert.match(orderText, /ja•+@example\.com/);
  assert.match(orderText, /\$19\.99 USD/);
  assert.equal(await page.locator(".cart-count").first().innerText(), "0", "purchased items leave the cart");
  console.log("✓ browser checkout flow");

  // Download every file of the purchased toolkit through the browser and compare bytes.
  const links = await page.locator(".download-list a").evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  const expected = [...manifest.products["complete-productivity-toolkit"].files, manifest.products["complete-productivity-toolkit"].zip];
  assert.equal(links.length, expected.length);
  for (const href of links) {
    const [download] = await Promise.all([page.waitForEvent("download"), page.click(`a[href="${href}"]`)]);
    const fileId = new URL(href, BASE).searchParams.get("file");
    const buf = readFileSync(await download.path());
    assert.equal(sha256(buf), manifest.files[fileId].sha256, `content of ${fileId}`);
    assert.equal(download.suggestedFilename(), manifest.files[fileId].filename);
  }
  console.log(`✓ ${links.length} downloads match the generated files`);

  // Receipt email requested once.
  const state = await (await fetch(`${STRIPE}/__state`)).json();
  assert.equal(state.receipts.filter((r) => r.email === "jane.doe@example.com").length, 1, "receipt email set once");

  // --- Download authorisation -----------------------------------------------
  assert.equal((await api(`/api/download?session_id=${sessionId}&file=cpc-xlsx`)).status, 403, "file from another product");
  assert.equal((await api(`/api/download?session_id=${sessionId}&file=../secret`)).status, 400, "unknown file id");
  const dl = await api(`/api/download?session_id=${sessionId}&file=wfp-pdf`);
  assert.equal(dl.status, 200, "toolkit includes the planner PDF");
  assert.equal(dl.headers.get("content-type"), "application/pdf");
  assert.equal(dl.headers.get("cache-control"), "private, no-store");

  // Unpaid session: no downloads.
  const unpaid = asJson(await post({ items: ["content-planning-calendar"], acceptTerms: true, digitalConsent: true }));
  const unpaidId = new URL(unpaid.url).pathname.split("/").pop();
  assert.equal((await api(`/api/download?session_id=${unpaidId}&file=cpc-pdf`)).status, 403, "unpaid session");
  assert.equal(asJson(await api(`/api/order?session_id=${unpaidId}`)).status, "unpaid");

  // Async payment: processing, then paid after confirmation.
  const asyncOrder = asJson(await post({ items: ["creator-planning-bundle"], acceptTerms: true, digitalConsent: true }));
  const asyncId = new URL(asyncOrder.url).pathname.split("/").pop();
  await fetch(`${asyncOrder.url}?async=1`, { redirect: "manual" });
  assert.equal(asJson(await api(`/api/order?session_id=${asyncId}`)).status, "processing");
  assert.equal((await api(`/api/download?session_id=${asyncId}&file=cpb-pdf`)).status, 403, "processing payment");
  await fetch(`${STRIPE}/__confirm/${asyncId}`, { method: "POST" });
  assert.equal(asJson(await api(`/api/order?session_id=${asyncId}`)).status, "paid");
  assert.equal((await api(`/api/download?session_id=${asyncId}&file=cpb-pdf`)).status, 200);

  // Refund revokes access.
  await fetch(`${STRIPE}/__refund/${sessionId}`, { method: "POST" });
  assert.equal(asJson(await api(`/api/order?session_id=${sessionId}`)).status, "refunded");
  assert.equal((await api(`/api/download?session_id=${sessionId}&file=wfp-pdf`)).status, 403, "refunded order");
  console.log("✓ download authorisation (other products, unpaid, processing, refunded)");

  // www redirect and static pages.
  const www = await fetch(`${BASE}/shop/`, { headers: { Host: `www.127.0.0.1:${SITE_PORT}` }, redirect: "manual" }).catch(() => null);
  if (www) assert.ok([200, 301].includes(www.status));
  for (const path of ["/", "/shop/", "/terms/", "/privacy/", "/refunds/", "/delivery/", "/cookies/", "/about/", "/faq/", "/contact/", "/sitemap.xml", "/robots.txt"]) {
    assert.equal((await fetch(BASE + path)).status, 200, path);
  }
  const notFound = await fetch(`${BASE}/no-such-page/`);
  assert.equal(notFound.status, 404);
  console.log("✓ static pages");

  assert.deepEqual(errors, [], "no browser errors");
  await browser.close();
  console.log("\nAll end-to-end checks passed.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => {
    for (const c of children) {
      try {
        process.kill(-c.pid, "SIGTERM");
      } catch {
        /* already exited */
      }
    }
    setTimeout(() => process.exit(), 2000).unref(); // give wrangler time to stop its runtime
  });
