#!/usr/bin/env node
// Deploy ClearWeek Studio to its own Cloudflare Pages project and connect evadeclaw.com.
// Safe to re-run. It only ever touches the project named below and the evadeclaw.com zone.
//
//   CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... node scripts/deploy.mjs
//
// Token permissions: Account › Cloudflare Pages: Edit. To let the script create the DNS records
// too, add Zone › DNS: Edit and Zone › Zone: Read for evadeclaw.com.
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const site = JSON.parse(readFileSync(join(ROOT, "src/data/site.json"), "utf8"));
const PROJECT = "clearweek-studio";
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

function run(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", env: process.env });
  if (r.status !== 0) throw new Error(`${cmd} ${args.join(" ")} failed`);
}

async function main() {
  const verify = (await cf("GET", `/accounts/${ACCOUNT}/tokens/verify`)).ok || (await cf("GET", "/user/tokens/verify")).ok;
  if (!verify) throw new Error("The API token isn't valid for this account.");
  console.log("✓ API token is valid");

  run("node", ["scripts/build.mjs"]);
  run("node", ["scripts/check.mjs"]);

  const project = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}`);
  if (project.ok) {
    console.log(`✓ Pages project ${PROJECT} exists`);
  } else {
    const created = await cf("POST", `/accounts/${ACCOUNT}/pages/projects`, { name: PROJECT, production_branch: "main" });
    if (!created.ok) throw new Error(`Could not create Pages project: ${errText(created)}`);
    console.log(`✓ Created Pages project ${PROJECT}`);
  }

  run("npx", ["wrangler", "pages", "deploy", "dist", "--project-name", PROJECT, "--branch", "main", "--commit-dirty=true"]);

  for (const name of [DOMAIN, `www.${DOMAIN}`]) {
    const existing = await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains/${name}`);
    if (existing.ok) {
      console.log(`✓ ${name} is attached (status: ${existing.data.result.status})`);
      continue;
    }
    const added = await cf("POST", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}/domains`, { name });
    console.log(added.ok ? `✓ Attached ${name} (status: ${added.data.result.status})` : `! Could not attach ${name}: ${errText(added)}`);
  }

  const subdomain = (await cf("GET", `/accounts/${ACCOUNT}/pages/projects/${PROJECT}`)).data.result?.subdomain || `${PROJECT}.pages.dev`;
  const zones = await cf("GET", `/zones?name=${DOMAIN}`);
  const zone = zones.ok && zones.data.result?.[0];
  if (!zone) {
    console.log(`\n! This token can't see a Cloudflare zone for ${DOMAIN}, so DNS wasn't changed.`);
    console.log(`  1. In the Cloudflare dashboard, check ${DOMAIN} is added to this account and note its two nameservers.`);
    console.log(`  2. At the registrar, replace the current nameservers with those two.`);
    console.log(`  3. Add DNS records (proxied): CNAME ${DOMAIN} → ${subdomain} and CNAME www → ${subdomain},`);
    console.log(`     or give this token Zone:Read and DNS:Edit for ${DOMAIN} and re-run this script.`);
  } else {
    console.log(`✓ Zone ${DOMAIN} found (status: ${zone.status})`);
    for (const name of [DOMAIN, `www.${DOMAIN}`]) {
      const list = (await cf("GET", `/zones/${zone.id}/dns_records?name=${name}`)).data.result || [];
      const cname = list.find((r) => r.type === "CNAME");
      if (cname && cname.content === subdomain) {
        console.log(`✓ DNS ${name} → ${subdomain}`);
      } else if (list.some((r) => ["A", "AAAA", "CNAME"].includes(r.type))) {
        console.log(`! ${name} already has records (${list.map((r) => `${r.type} ${r.content}`).join(", ")}). Not changed.`);
        console.log(`  Replace them with a proxied CNAME ${name} → ${subdomain}.`);
      } else {
        const created = await cf("POST", `/zones/${zone.id}/dns_records`, { type: "CNAME", name, content: subdomain, proxied: true, ttl: 1 });
        console.log(created.ok ? `✓ Created DNS CNAME ${name} → ${subdomain}` : `! Could not create DNS for ${name}: ${errText(created)}`);
      }
    }
  }

  console.log(`\nLive now: https://${subdomain}`);
  console.log(`Custom domain: https://${DOMAIN} (works once the domain status above is "active")`);
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`);
  process.exit(1);
});
