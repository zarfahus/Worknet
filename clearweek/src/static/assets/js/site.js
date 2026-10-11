// ClearWeek Studio: small progressive enhancements. Every page works without this script.
// Nothing is stored in the browser (no cookies, no local storage).
(() => {
  "use strict";

  // Product gallery: show the chosen page in the large frame instead of opening the image.
  document.querySelectorAll("[data-gallery]").forEach((gallery) => {
    const img = gallery.querySelector("[data-gallery-image]");
    const caption = gallery.querySelector("[data-gallery-caption]");
    const links = gallery.querySelectorAll(".gallery-thumbs a");
    links.forEach((link) => {
      link.addEventListener("click", (event) => {
        event.preventDefault();
        img.src = link.dataset.src;
        img.width = Number(link.dataset.width);
        img.height = Number(link.dataset.height);
        img.alt = link.dataset.caption;
        caption.textContent = link.dataset.caption;
        links.forEach((l) => l.removeAttribute("aria-current"));
        link.setAttribute("aria-current", "true");
      });
    });
  });

  // Order review: the button only works once both boxes are ticked, and only when checkout is open.
  document.querySelectorAll("[data-checkout]").forEach((form) => {
    const open = form.dataset.open === "true";
    const boxes = form.querySelectorAll('input[type="checkbox"]');
    const button = form.querySelector("[data-checkout-submit]");
    const error = form.querySelector("[data-checkout-error]");
    const update = () => {
      button.disabled = !open || ![...boxes].every((b) => b.checked);
    };
    boxes.forEach((b) => b.addEventListener("change", () => {
      error.hidden = true;
      update();
    }));
    form.addEventListener("submit", (event) => {
      if (!open) {
        event.preventDefault();
        return;
      }
      if (![...boxes].every((b) => b.checked)) {
        event.preventDefault();
        error.textContent = "Please tick both boxes to continue.";
        error.hidden = false;
      }
    });
    update();
  });
})();
