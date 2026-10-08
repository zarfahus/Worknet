// GET /api/download?session_id=cs_...&file=<file id> — stream a purchased file from private R2 storage.
// Every request is checked against the payment: the session must be paid, not refunded,
// and include a product that contains the requested file.
import { SESSION_ID, errorJson, loadOrder, manifest, paymentsConfigured, unavailable } from "../_lib/shop.js";

export async function onRequestGet({ request, env }) {
  if (!paymentsConfigured(env)) return unavailable();
  const params = new URL(request.url).searchParams;
  const sessionId = params.get("session_id") || "";
  const fileId = params.get("file") || "";
  if (!SESSION_ID.test(sessionId) || !manifest.files[fileId]) return errorJson(400, "invalid_request", "Invalid download link.");

  let order;
  try {
    order = await loadOrder(env, sessionId);
  } catch (err) {
    console.error("download lookup failed", err.status, err.code, err.message);
    return errorJson(502, "lookup_failed", "We couldn't verify your order right now. Please try again in a moment.");
  }
  if (!order) return errorJson(404, "not_found", "Order not found.");
  if (order.status !== "paid") return errorJson(403, "not_available", "Downloads are available only for paid orders.");
  if (!order.allowedFiles.has(fileId)) return errorJson(403, "not_in_order", "This file is not part of your order.");

  const file = manifest.files[fileId];
  const object = await env.FILES.get(file.key);
  if (!object) {
    console.error("missing object in R2", file.key);
    return errorJson(500, "file_missing", "This file is temporarily unavailable. Please contact support and we'll send it to you.");
  }
  return new Response(object.body, {
    headers: {
      "Content-Type": file.contentType,
      "Content-Length": String(object.size),
      "Content-Disposition": `attachment; filename="${file.filename}"`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
}
