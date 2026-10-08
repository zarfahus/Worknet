// Minimal stand-in for the Stripe endpoints used by the site, for local end-to-end tests only.
// Run: node tests/mock-stripe.mjs [port]   (the site must be started with STRIPE_API_BASE pointing here)
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";

const PORT = Number(process.argv[2] || process.env.MOCK_STRIPE_PORT || 12111);
const KEY = "sk_test_mock";
const sessions = new Map();
const receipts = [];

const id = (prefix) => `${prefix}_${randomBytes(18).toString("base64").replace(/[^A-Za-z0-9]/g, "").slice(0, 24)}`;

function parseForm(text) {
  const out = {};
  for (const [k, v] of new URLSearchParams(text)) out[k] = v;
  return out;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { "Content-Type": "application/json", ...headers });
  res.end(JSON.stringify(body));
}

function view(session, expand) {
  const s = { ...session };
  s.payment_intent = session.pi ? (expand.some((e) => e.startsWith("payment_intent")) ? { ...session.pi } : session.pi.id) : null;
  if (s.payment_intent && typeof s.payment_intent === "object" && !expand.includes("payment_intent.latest_charge")) {
    s.payment_intent.latest_charge = session.pi.latest_charge.id;
  }
  if (!expand.includes("line_items")) delete s.line_items;
  delete s.pi;
  return s;
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const form = parseForm(Buffer.concat(chunks).toString());

  // Hosted "payment page": completes the session and returns to success_url.
  let m = url.pathname.match(/^\/pay\/(cs_test_\w+)$/);
  if (m) {
    const s = sessions.get(m[1]);
    if (!s) return send(res, 404, { error: "no such session" });
    s.status = "complete";
    s.customer_details = { email: "jane.doe@example.com", name: "Jane Doe" };
    const async = url.searchParams.get("async") === "1";
    s.payment_status = async ? "unpaid" : "paid";
    s.pi = {
      id: id("pi_test"),
      object: "payment_intent",
      status: async ? "processing" : "succeeded",
      receipt_email: null,
      latest_charge: { id: id("ch_test"), object: "charge", refunded: false, receipt_email: null },
    };
    res.writeHead(303, { Location: s.success_url.replace("{CHECKOUT_SESSION_ID}", s.id) });
    return res.end();
  }
  m = url.pathname.match(/^\/__refund\/(cs_test_\w+)$/);
  if (m) {
    sessions.get(m[1]).pi.latest_charge.refunded = true;
    return send(res, 200, { ok: true });
  }
  m = url.pathname.match(/^\/__confirm\/(cs_test_\w+)$/);
  if (m) {
    const s = sessions.get(m[1]);
    s.payment_status = "paid";
    s.pi.status = "succeeded";
    return send(res, 200, { ok: true });
  }
  if (url.pathname === "/__state") return send(res, 200, { sessions: [...sessions.values()], receipts });

  if (req.headers.authorization !== `Bearer ${KEY}`) return send(res, 401, { error: { message: "Invalid API key" } });

  if (req.method === "POST" && url.pathname === "/v1/checkout/sessions") {
    const lines = [];
    for (let i = 0; form[`line_items[${i}][quantity]`]; i++) {
      const amount = Number(form[`line_items[${i}][price_data][unit_amount]`]);
      lines.push({
        object: "item",
        description: form[`line_items[${i}][price_data][product_data][name]`],
        amount_total: amount,
        quantity: Number(form[`line_items[${i}][quantity]`]),
        currency: form[`line_items[${i}][price_data][currency]`],
      });
    }
    const metadata = {};
    for (const [k, v] of Object.entries(form)) {
      const mm = k.match(/^metadata\[(\w+)\]$/);
      if (mm) metadata[mm[1]] = v;
    }
    const sid = id("cs_test");
    const session = {
      id: sid,
      object: "checkout.session",
      mode: form.mode,
      status: "open",
      payment_status: "unpaid",
      created: Math.floor(Date.now() / 1000),
      currency: lines[0]?.currency,
      amount_total: lines.reduce((n, l) => n + l.amount_total, 0),
      total_details: { amount_tax: 0 },
      metadata,
      success_url: form.success_url,
      cancel_url: form.cancel_url,
      url: `http://127.0.0.1:${PORT}/pay/${sid}`,
      customer_details: null,
      line_items: { object: "list", data: lines },
      received_params: form,
      pi: null,
    };
    sessions.set(sid, session);
    return send(res, 200, view(session, []));
  }
  m = url.pathname.match(/^\/v1\/checkout\/sessions\/(\w+)$/);
  if (req.method === "GET" && m) {
    const s = sessions.get(m[1]);
    if (!s) return send(res, 404, { error: { code: "resource_missing", message: "No such checkout.session" } });
    const expand = [...url.searchParams].filter(([k]) => k.startsWith("expand")).map(([, v]) => v);
    return send(res, 200, view(s, expand));
  }
  m = url.pathname.match(/^\/v1\/payment_intents\/(\w+)$/);
  if (req.method === "POST" && m) {
    const s = [...sessions.values()].find((x) => x.pi?.id === m[1]);
    if (!s) return send(res, 404, { error: { code: "resource_missing" } });
    s.pi.receipt_email = form.receipt_email;
    receipts.push({ pi: m[1], email: form.receipt_email });
    return send(res, 200, s.pi);
  }
  send(res, 404, { error: { message: `mock: unhandled ${req.method} ${url.pathname}` } });
});

server.listen(PORT, "127.0.0.1", () => console.log(`mock stripe listening on ${PORT}`));
