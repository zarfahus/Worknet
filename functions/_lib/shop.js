// Shared helpers for the WorkNest Studio Pages Functions.
import catalog from "../../src/data/catalog.json";
import manifest from "../../src/data/manifest.json";
import site from "../../src/data/site.json";

export { catalog, manifest, site };

export const PRODUCTS = Object.fromEntries(catalog.products.map((p) => [p.slug, p]));
export const SESSION_ID = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
const STRIPE_VERSION = "2024-06-20";

const BASE_HEADERS = {
  "Cache-Control": "no-store",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
};

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", ...BASE_HEADERS, ...headers },
  });
}

export function errorJson(status, error, message) {
  return json({ error, message, supportEmail: site.email }, status);
}

export const paymentsConfigured = (env) => Boolean(env.STRIPE_SECRET_KEY);

export const unavailable = () =>
  errorJson(503, "payments_unavailable", `Online payment is not available at the moment. Please try again later or email ${site.email}.`);

// Stripe expects nested parameters as form fields: a[b][0][c]=value
export function formEncode(params, prefix = "", out = new URLSearchParams()) {
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue;
    const name = prefix ? `${prefix}[${key}]` : key;
    if (typeof value === "object") formEncode(value, name, out);
    else out.append(name, String(value));
  }
  return out;
}

export class StripeError extends Error {
  constructor(status, body) {
    super(body?.error?.message || `Stripe request failed (${status})`);
    this.status = status;
    this.code = body?.error?.code;
  }
}

export async function stripe(env, method, path, params) {
  const base = env.STRIPE_API_BASE || "https://api.stripe.com";
  const query = method === "GET" && params ? `?${formEncode(params)}` : "";
  const res = await fetch(`${base}/v1/${path}${query}`, {
    method,
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "Stripe-Version": STRIPE_VERSION,
      ...(method === "GET" ? {} : { "Content-Type": "application/x-www-form-urlencoded" }),
    },
    body: method === "GET" ? undefined : formEncode(params || {}),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new StripeError(res.status, body);
  return body;
}

export function orderReference() {
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // no 0/O/1/I
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return "WN-" + Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export function maskEmail(email) {
  if (!email || !email.includes("@")) return null;
  const [local, domain] = email.split("@");
  return `${local.slice(0, Math.min(2, local.length))}${"•".repeat(Math.max(3, Math.min(local.length - 2, 6)))}@${domain}`;
}

/**
 * Load a Checkout Session created by this shop and work out what the customer may download.
 * Returns null when the session does not exist or was not created by this shop.
 */
export async function loadOrder(env, sessionId) {
  let session;
  try {
    session = await stripe(env, "GET", `checkout/sessions/${sessionId}`, {
      expand: ["payment_intent.latest_charge", "line_items"],
    });
  } catch (err) {
    if (err instanceof StripeError && err.status === 404) return null;
    throw err;
  }
  const reference = session.metadata?.order_ref;
  if (!reference) return null;

  const slugs = (session.metadata.items || "").split(",").filter((s) => PRODUCTS[s]);
  const pi = session.payment_intent && typeof session.payment_intent === "object" ? session.payment_intent : null;
  const charge = pi?.latest_charge && typeof pi.latest_charge === "object" ? pi.latest_charge : null;

  let status;
  if (session.status === "complete" && (session.payment_status === "paid" || session.payment_status === "no_payment_required")) {
    status = charge?.refunded ? "refunded" : "paid";
  } else if (session.status === "complete" && session.payment_status === "unpaid") {
    status = pi && ["requires_payment_method", "canceled"].includes(pi.status) ? "failed" : "processing";
  } else {
    status = session.status === "expired" ? "expired" : "unpaid";
  }

  const lines = session.line_items?.data || [];
  const items = slugs.map((slug, i) => {
    const p = PRODUCTS[slug];
    const m = manifest.products[slug];
    const file = (id) => {
      const f = manifest.files[id];
      return { id, filename: f.filename, format: f.format, label: f.label, bytes: f.bytes };
    };
    return {
      slug,
      name: p.name,
      price: lines.length === slugs.length ? lines[i].amount_total : p.price,
      files: m.files.map(file),
      zip: file(m.zip),
    };
  });

  return {
    status,
    reference,
    session,
    paymentIntent: pi,
    charge,
    items,
    allowedFiles: new Set(slugs.flatMap((s) => [...manifest.products[s].files, manifest.products[s].zip])),
  };
}
