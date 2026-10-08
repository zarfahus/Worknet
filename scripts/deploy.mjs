#!/usr/bin/env node
// Deploy WorkNest Studio to Cloudflare Pages and connect the custom domain. Safe to re-run.
//
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node scripts/deploy.mjs
//
// Optional: STRIPE_SECRET_KEY=sk_live_... also stores the Stripe key as an encrypted Pages secret.
// The token needs: Account › Cloudflare Pages: Edit, Account › Workers R2 Storage: Edit,
// Zone › DNS: Edit and Zone › Zone: Read (for the domain's zone).
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(readFileSync(join(ROOT, "src/data/site.json"), "utf8"));
const PROJECT = process.env.PAGES_PROJECT || "worknest-studio";
const BUCKET = "worknest-studio-files";
const DOMAIN = site.domain;
const { CLOUDFLARE_API_TOKEN: TOKEN, CLOUDFLARE_ACCOUNT_ID: ACCOUNT } = process.env;
if (!TOKEN || !ACCOUNT) {
  console.error("Set CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID first.");
  process.exit(1);
}

async function cf(method, path, body) {
  const res = await fetch(`https://api.cloudflare.com/client/v4${path}`, {
    method,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok && data.success !== false, status: res.status, data };
}

const errText = (r) => (r.data.errors || []).map((e) => `${e.code}: ${e.message}`).join("; ") || `HTTP ${r.status}`;

function run(cmd, args, input) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: [input ? "pipe" : "inherit", "inherit", "inherit"], input, env: process.env });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}

async function main() {
  const verify = await cf("GET", `/accounts/${ACCOUNT}/tokens/verify`);
  if (!verify.ok) throw new Error(`API token check failed: ${errText(verify)}`);
  console.log("✓ API token is valid");

  console.log("Building site…");
  run("node", ["scripts/build.mjs"]);

  const bucket = await cf("GET", `/accounts/${ACCOUNT}/r2/buckets/${BUCKET}`);
  if (!bucket.ok) throw new Error(`R2 bucket ${BUCKET} not found (${errText(bucket)}). Run scripts/upload_r2.py first.`);
  console.log(`✓ R2 bucket ${BUCKET} exists`);

  const project = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}`);
  if (!project.ok) {
    const created = await cf("POST", `/accounts/${ACCOUNT}/pages/projects`, { name: PROJECT, production_branch: "main" });
    if (!created.ok) throw new Error(`Could not create Pages project: ${errText(created)}`);
    console.log(`✓ Created Pages project ${PROJECT}`);
  } else {
    console.log(`✓ Pages project ${PROJECT} exists`);
  }

  if (process.env.STRIPE_SECRET_KEY) {
    run("npx", ["wrangler", "pages", "secret", "put", "STRIPE_SECRET_KEY", "--project-name", PROJECT], process.env.STRIPE_SECRET_KEY);
    console.log("✓ Stored STRIPE_SECRET_KEY as an encrypted Pages secret");
  }

  console.log("Deploying…");
  run("npx", ["wrangler", "pages", "deploy", "--project-name", PROJECT, "--branch", "main", "--commit-dirty=true"]);

  // Custom domains: apex and www (www redirects to the apex in functions/_middleware.js).
  for (const name of [DOMAIN, `www.${DOMAIN}`]) {
    const existing = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains/${name}`);
    if (existing.ok) {
      console.log(`✓ ${name} already attached (status: ${existing.data.result.status})`);
      continue;
    }
    const added = await cf("POST", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains`, { name });
    console.log(added.ok ? `✓ Attached ${name}` : `! Could not attach ${name}: ${errText(added)}`);
  }

  // DNS: point the apex and www at the Pages project (proxied CNAMEs; Cloudflare flattens the apex).
  const zones = await cf("GET", `/zones?name=${DOMAIN}`);
  const zone = zones.ok && zones.data.result?.[0];
  if (!zone) {
    console.log(`\n! The zone ${DOMAIN} is not in this Cloudflare account (or the token lacks Zone:Read).`);
    console.log(`  Add ${DOMAIN} in the Cloudflare dashboard (Websites › Add a site), switch the domain's nameservers`);
    console.log(`  at your registrar to the ones Cloudflare shows, then re-run this script.`);
  } else {
    console.log(`✓ Zone ${DOMAIN} found (status: ${zone.status})`);
    const target = `${PROJECT}.pages.dev`;
    for (const name of [DOMAIN, `www.${DOMAIN}`]) {
      const records = await cf("GET", `/zones/${zone.id}/dns_records?name=${name}`);
      const list = records.data.result || [];
      const cname = list.find((r) => r.type === "CNAME");
      if (cname && cname.content === target) {
        console.log(`✓ DNS ${name} → ${target}`);
      } else if (list.some((r) => ["A", "AAAA", "CNAME"].includes(r.type))) {
        console.log(`! ${name} already has DNS records (${list.map((r) => `${r.type} ${r.content}`).join(", ")}).`);
        console.log(`  Not changing them automatically. Replace them with: CNAME ${name} → ${target} (proxied).`);
      } else {
        const created = await cf("POST", `/zones/${zone.id}/dns_records`, { type: "CNAME", name, content: target, proxied: true, ttl: 1 });
        console.log(created.ok ? `✓ Created DNS CNAME ${name} → ${target}` : `! Could not create DNS for ${name}: ${errText(created)}`);
      }
    }
  }

  const final = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains`);
  console.log("\nCustom domain status:");
  for (const d of final.data.result || []) console.log(`  ${d.name}: ${d.status}${d.verification_data?.error_message ? ` (${d.verification_data.error_message})` : ""}`);
  console.log(`\nSite: https://${PROJECT}.pages.dev  ·  https://${DOMAIN} (once the domain shows "active")`);
  if (!process.env.STRIPE_SECRET_KEY) {
    console.log("\nCheckout stays disabled until a Stripe key is set:");
    console.log(`  npx wrangler pages secret put STRIPE_SECRET_KEY --project-name ${PROJECT}`);
  }
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
