// GET /api/order?session_id=cs_... — order status and downloadable files for the order page.
import { SESSION_ID, errorJson, json, loadOrder, maskEmail, paymentsConfigured, site, stripe, unavailable } from "../_lib/shop.js";

export async function onRequestGet({ request, env, waitUntil }) {
  if (!paymentsConfigured(env)) return unavailable();
  const sessionId = new URL(request.url).searchParams.get("session_id") || "";
  if (!SESSION_ID.test(sessionId)) return errorJson(400, "invalid_session", "Invalid order link.");

  let order;
  try {
    order = await loadOrder(env, sessionId);
  } catch (err) {
    console.error("order lookup failed", err.status, err.code, err.message);
    return errorJson(502, "lookup_failed", "We couldn't load your order right now. Please reload the page in a moment.");
  }
  if (!order) return errorJson(404, "not_found", "Order not found.");

  const { session, paymentIntent, charge } = order;
  const email = session.customer_details?.email || null;

  // Make sure the customer gets a payment receipt even if automatic receipts are switched off
  // in the Stripe dashboard. Setting receipt_email on a paid PaymentIntent sends one receipt.
  if (order.status === "paid" && email && paymentIntent && !paymentIntent.receipt_email && !charge?.receipt_email) {
    waitUntil(
      stripe(env, "POST", `payment_intents/${paymentIntent.id}`, { receipt_email: email }).catch((err) =>
        console.error("receipt email update failed", err.message)
      )
    );
  }

  const base = { status: order.status, reference: order.reference, supportEmail: site.email, seller: site.brand };
  if (order.status !== "paid") return json(base);
  return json({
    ...base,
    created: session.created,
    email: maskEmail(email),
    currency: (session.currency || "eur").toUpperCase(),
    amountTotal: session.amount_total,
    amountTax: session.total_details?.amount_tax || 0,
    items: order.items,
  });
}
