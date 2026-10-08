// POST /api/checkout — create a Stripe Checkout Session for the products in the cart.
// Prices always come from the server-side catalog, never from the browser.
import { PRODUCTS, catalog, errorJson, json, orderReference, paymentsConfigured, site, stripe, unavailable } from "../_lib/shop.js";

const MAX_BODY = 4096;

export async function onRequestPost({ request, env }) {
  if (!paymentsConfigured(env)) return unavailable();

  const url = new URL(request.url);
  const origin = request.headers.get("Origin");
  if (origin && origin !== url.origin) return errorJson(403, "forbidden", "Checkout must be started from this website.");
  if (!(request.headers.get("Content-Type") || "").includes("application/json")) {
    return errorJson(415, "unsupported_media_type", "Expected a JSON request.");
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY) return errorJson(413, "too_large", "Request too large.");

  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return errorJson(400, "invalid_json", "Invalid request.");
  }

  const items = Array.isArray(body?.items) ? [...new Set(body.items)] : [];
  if (!items.length || items.length > catalog.products.length || !items.every((s) => typeof s === "string" && PRODUCTS[s])) {
    return errorJson(400, "invalid_items", "Your cart contains an item we don't recognise. Please refresh the page and try again.");
  }
  if (body.acceptTerms !== true || body.digitalConsent !== true) {
    return errorJson(400, "consent_required", "Please confirm both statements before continuing to payment.");
  }

  const reference = orderReference();
  const automaticTax = env.STRIPE_AUTOMATIC_TAX === "true";
  const names = items.map((s) => PRODUCTS[s].name);

  const params = {
    mode: "payment",
    submit_type: "pay",
    client_reference_id: reference,
    success_url: `${url.origin}/order/?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${url.origin}/checkout/`,
    billing_address_collection: "auto",
    line_items: items.map((slug) => {
      const p = PRODUCTS[slug];
      return {
        quantity: 1,
        price_data: {
          currency: catalog.currency.toLowerCase(),
          unit_amount: p.price,
          ...(automaticTax ? { tax_behavior: env.STRIPE_TAX_BEHAVIOR || "exclusive" } : {}),
          product_data: {
            name: p.name,
            description: `Digital download (${p.formats.join(", ")}). One-time purchase. No physical goods are shipped.`,
            metadata: { slug },
          },
        },
      };
    }),
    metadata: {
      order_ref: reference,
      items: items.join(","),
      terms_accepted: "true",
      digital_content_consent: "true",
      consent_at: new Date().toISOString(),
      terms_version: site.policiesUpdated,
    },
    payment_intent_data: {
      description: `${site.brand} order ${reference}: ${names.join(", ")}`.slice(0, 1000),
      metadata: { order_ref: reference, items: items.join(",") },
    },
    custom_text: {
      submit: {
        message: `${site.brand} · One-time purchase of digital files. No physical goods are shipped. Your downloads are available immediately after payment is confirmed.`,
      },
    },
    ...(automaticTax ? { automatic_tax: { enabled: true } } : {}),
  };

  try {
    const session = await stripe(env, "POST", "checkout/sessions", params);
    return json({ url: session.url, reference });
  } catch (err) {
    console.error("checkout session failed", err.status, err.code, err.message);
    return errorJson(502, "payment_error", `We couldn't start the payment. Please try again in a moment or email ${site.email}.`);
  }
}
