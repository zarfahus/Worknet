// WorkNest Studio — cart and checkout page.
(() => {
  "use strict";

  const data = JSON.parse(document.getElementById("catalog-data").textContent);
  const bySlug = Object.fromEntries(data.products.map((p) => [p.slug, p]));
  const money = new Intl.NumberFormat("en-IE", { style: "currency", currency: data.currency });
  const cart = window.WorkNestCart;

  const $ = (id) => document.getElementById(id);
  const list = $("cart-items");
  const empty = $("cart-empty");
  const notices = $("cart-notices");
  const subtotalEl = $("summary-subtotal");
  const totalEl = $("summary-total");
  const form = $("checkout-form");
  const terms = $("accept-terms");
  const digital = $("digital-consent");
  const submit = $("checkout-submit");
  const errorBox = $("checkout-error");
  const submitLabel = submit.textContent;

  function h(tag, attrs, ...children) {
    const el = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === "class") el.className = v;
      else el.setAttribute(k, v);
    }
    for (const c of children) el.append(c);
    return el;
  }

  const current = () => cart.items().filter((s) => bySlug[s]);

  function render() {
    const items = current();
    if (items.length !== cart.items().length) cart.removeMany(cart.items().filter((s) => !bySlug[s]));

    list.replaceChildren(
      ...items.map((slug) => {
        const p = bySlug[slug];
        const remove = h("button", { type: "button", class: "btn-link remove", "aria-label": `Remove ${p.name} from cart` }, "Remove");
        remove.addEventListener("click", () => cart.remove(slug));
        return h(
          "li",
          { class: "cart-item" },
          h("img", { src: p.image, alt: "", width: "88", height: "66" }),
          h(
            "div",
            {},
            h("h3", {}, h("a", { href: `/products/${slug}/` }, p.name)),
            h("div", { class: "sub" }, `Digital download · ${p.formats.join(", ")} · One-time purchase`)
          ),
          h("div", { class: "right" }, h("span", { class: "price" }, money.format(p.price / 100)), remove)
        );
      })
    );

    const overlaps = [];
    for (const slug of items) {
      for (const inner of bySlug[slug].contains) {
        if (items.includes(inner)) overlaps.push([bySlug[slug].name, bySlug[inner].name]);
      }
    }
    notices.replaceChildren(
      ...overlaps.map(([outer, inner]) =>
        h("div", { class: "notice warn" }, `The ${outer} already includes the ${inner}. You may want to remove the ${inner} so you don't pay for it twice.`)
      )
    );

    const subtotal = items.reduce((sum, s) => sum + bySlug[s].price, 0);
    subtotalEl.textContent = money.format(subtotal / 100);
    totalEl.textContent = money.format(subtotal / 100);
    empty.classList.toggle("hidden", items.length > 0);
    list.classList.toggle("hidden", items.length === 0);
    updateSubmit();
  }

  function updateSubmit() {
    submit.disabled = current().length === 0 || !terms.checked || !digital.checked;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.classList.remove("hidden");
  }

  function resetSubmit() {
    submit.textContent = submitLabel;
    updateSubmit();
  }

  terms.addEventListener("change", updateSubmit);
  digital.addEventListener("change", updateSubmit);
  document.addEventListener("cart:change", render);
  // Returning with the back button from the payment page restores this page from cache.
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) {
      render();
      resetSubmit();
    }
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorBox.classList.add("hidden");
    const items = current();
    if (!items.length) return showError("Your cart is empty.");
    if (!terms.checked || !digital.checked) return showError("Please confirm both statements above to continue.");

    submit.disabled = true;
    submit.replaceChildren(h("span", { class: "spinner", "aria-hidden": "true" }), " Redirecting to secure payment…");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ items, acceptTerms: true, digitalConsent: true }),
      });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.url) {
        window.location.assign(body.url);
        return;
      }
      showError(body.message || "We couldn't start the payment. Please try again in a moment.");
    } catch (_) {
      showError("We couldn't reach the server. Please check your connection and try again.");
    }
    resetSubmit();
  });

  render();
})();
