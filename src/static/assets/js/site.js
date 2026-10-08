// WorkNest Studio — shared behaviour: mobile menu, cart storage, add-to-cart buttons, product gallery.
(() => {
  "use strict";

  // The cart lives only in this browser (see /cookies/). It holds product slugs, nothing else.
  const KEY = "worknest_cart";

  const read = () => {
    try {
      const value = JSON.parse(window.localStorage.getItem(KEY) || "[]");
      return Array.isArray(value) ? value.filter((s) => typeof s === "string" && /^[a-z0-9-]{1,64}$/.test(s)).slice(0, 20) : [];
    } catch (_) {
      return [];
    }
  };

  const write = (items) => {
    try {
      if (items.length) window.localStorage.setItem(KEY, JSON.stringify([...new Set(items)]));
      else window.localStorage.removeItem(KEY);
    } catch (_) {
      /* storage unavailable (private mode); the cart still works for this page view */
    }
    updateCount();
    document.dispatchEvent(new CustomEvent("cart:change"));
  };

  const cart = {
    items: read,
    add(slug) {
      const items = read();
      if (!items.includes(slug)) items.push(slug);
      write(items);
    },
    remove(slug) {
      write(read().filter((s) => s !== slug));
    },
    removeMany(slugs) {
      write(read().filter((s) => !slugs.includes(s)));
    },
  };
  window.WorkNestCart = cart;

  function updateCount() {
    const n = read().length;
    document.querySelectorAll(".cart-count").forEach((el) => {
      el.textContent = String(n);
      el.dataset.count = String(n);
    });
    document.querySelectorAll(".cart-link").forEach((a) => a.setAttribute("aria-label", `Cart, ${n} item${n === 1 ? "" : "s"}`));
  }

  window.addEventListener("storage", (e) => {
    if (e.key === KEY) {
      updateCount();
      document.dispatchEvent(new CustomEvent("cart:change"));
    }
  });

  // Mobile menu
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.getElementById("site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
  }

  // Add to cart / buy now
  document.querySelectorAll("[data-add-to-cart]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const slug = btn.getAttribute("data-add-to-cart");
      cart.add(slug);
      const fb = document.querySelector(`[data-cart-feedback="${slug}"]`);
      if (fb) {
        fb.textContent = "Added to your cart. ";
        const link = document.createElement("a");
        link.href = "/checkout/";
        link.textContent = "View cart and check out";
        fb.appendChild(link);
        fb.classList.remove("hidden");
      }
    });
  });
  document.querySelectorAll("[data-buy-now]").forEach((btn) => {
    btn.addEventListener("click", () => {
      cart.add(btn.getAttribute("data-buy-now"));
      window.location.href = "/checkout/";
    });
  });

  // Product gallery
  const main = document.getElementById("gallery-main");
  if (main) {
    document.querySelectorAll(".gallery-thumbs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        main.src = btn.dataset.src;
        main.alt = btn.dataset.alt;
        document.querySelectorAll(".gallery-thumbs button").forEach((b) => b.removeAttribute("aria-current"));
        btn.setAttribute("aria-current", "true");
      });
    });
  }

  updateCount();
})();
