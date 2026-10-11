// DeskNest Studio — order confirmation and downloads.
(() => {
  "use strict";

  const root = document.getElementById("order-root");
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get("session_id") || "";
  const POLL_MS = 8000;
  const MAX_POLLS = 40;
  let polls = 0;

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") el.className = v;
      else el.setAttribute(k, v);
    }
    for (const c of children) if (c != null) el.append(c);
    return el;
  }

  const size = (b) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.round(b / 1024)} KB`);
  const supportLink = (email) => h("a", { href: `mailto:${email}` }, email);

  function show(...nodes) {
    root.replaceChildren(...nodes);
  }

  function message(kind, title, text, email, extra) {
    show(
      h("h2", { class: "mt-0" }, title),
      h("div", { class: `notice ${kind}` }, text, email ? " If you need help, email " : "", email ? supportLink(email) : "", email ? "." : ""),
      extra || ""
    );
  }

  function downloadLink(fileId, label) {
    const url = `/api/download?session_id=${encodeURIComponent(sessionId)}&file=${encodeURIComponent(fileId)}`;
    return h("a", { class: "btn btn-secondary", href: url, download: "" }, label);
  }

  function renderPaid(order) {
    const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: order.currency });
    const money = { format: (amount) => `${fmt.format(amount)} ${order.currency}` };
    const created = new Date(order.created * 1000).toLocaleString("en-US", { dateStyle: "long", timeStyle: "short" });
    const products = order.items.map((item) =>
      h(
        "section",
        { class: "order-product" },
        h("h3", {}, h("span", {}, item.name), h("span", { class: "price" }, money.format(item.price / 100))),
        h(
          "ul",
          { class: "download-list" },
          h(
            "li",
            {},
            h("div", {}, h("strong", {}, "All files (ZIP)"), h("div", { class: "file-meta" }, `${item.zip.filename} · ${size(item.zip.bytes)}`)),
            downloadLink(item.zip.id, "Download all")
          ),
          ...item.files.map((f) =>
            h(
              "li",
              {},
              h("div", {}, h("span", { class: "file-name" }, f.filename), h("div", { class: "file-meta" }, `${f.label} · ${size(f.bytes)}`)),
              downloadLink(f.id, `Download ${f.format}`)
            )
          )
        )
      )
    );
    show(
      h("h2", { class: "mt-0" }, "Thank you — your order is confirmed"),
      h(
        "div",
        { class: "notice success" },
        "Your files are ready. Download them below and keep a copy. You can come back to this page later using the same link, so we recommend bookmarking it."
      ),
      h(
        "table",
        {},
        h(
          "tbody",
          {},
          h("tr", {}, h("th", {}, "Order reference"), h("td", {}, order.reference)),
          h("tr", {}, h("th", {}, "Date"), h("td", {}, created)),
          order.email ? h("tr", {}, h("th", {}, "Receipt sent to"), h("td", {}, order.email)) : null,
          h("tr", {}, h("th", {}, "Total paid"), h("td", {}, money.format(order.amountTotal / 100), order.amountTax ? ` (including ${money.format(order.amountTax / 100)} tax)` : "")),
          h("tr", {}, h("th", {}, "Seller"), h("td", {}, `${order.seller} (one-time purchase of digital files)`))
        )
      ),
      ...products,
      h(
        "p",
        { class: "small muted" },
        "Problem with a file? Email ",
        supportLink(order.supportEmail),
        ` with your order reference ${order.reference}. See our `,
        h("a", { href: "/refunds/" }, "Refund Policy"),
        " and ",
        h("a", { href: "/delivery/" }, "Digital Delivery Policy"),
        "."
      )
    );
    if (window.DeskNestCart) window.DeskNestCart.removeMany(order.items.map((i) => i.slug));
  }

  async function load() {
    let res;
    let body = {};
    try {
      res = await fetch(`/api/order?session_id=${encodeURIComponent(sessionId)}`, { headers: { Accept: "application/json" } });
      body = await res.json().catch(() => ({}));
    } catch (_) {
      return message("error", "We couldn't load your order", "Please check your connection and reload this page.");
    }
    const email = body.supportEmail;
    if (!res.ok) {
      if (res.status === 404 || res.status === 400) {
        return message("warn", "Order not found", "We couldn't find an order for this link. Please use the link from the end of checkout.", email);
      }
      return message("error", "We couldn't load your order", body.message || "Please try again in a moment.", email);
    }
    switch (body.status) {
      case "paid":
        return renderPaid(body);
      case "processing":
        message(
          "info",
          "Payment processing",
          "Your payment has been submitted and is waiting for confirmation from your bank or payment provider. Your downloads will appear on this page as soon as it is confirmed — you can leave this page open or come back later using the same link.",
          email
        );
        if (++polls < MAX_POLLS) setTimeout(load, POLL_MS);
        return;
      case "refunded":
        return message("warn", "Order refunded", "This order has been refunded, so its downloads are no longer available.", email);
      default:
        return message(
          "warn",
          "Payment not completed",
          "This payment was not completed, so you have not been charged for it. You can return to your cart to try again.",
          email,
          h("p", {}, h("a", { class: "btn", href: "/checkout/" }, "Return to cart"))
        );
    }
  }

  if (!/^cs_(test|live)_[A-Za-z0-9]{10,200}$/.test(sessionId)) {
    message("warn", "Order not found", "This link doesn't contain a valid order reference. Please use the link from the end of checkout.");
  } else {
    load();
  }
})();
