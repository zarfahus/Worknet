// Shared layout, helpers and icons for the static site build.

export const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

export const money = (cents, currency = "EUR") =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(cents / 100);

export const fileSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export const listJoin = (items) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// Logo mark: navy tile, roof line over two text lines. Mirrors products/render.py:draw_logo.
export const logoSvg = (title = "") => `<svg viewBox="0 0 24 24" aria-hidden="${title ? "false" : "true"}"${title ? ` role="img" aria-label="${esc(title)}"` : ""}><rect width="24" height="24" rx="5.5" fill="#1F2A44"/><path d="M6 11.5 12 6.5l6 5M8 15h8M8 18.5h5.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const stroke = (paths, extra = "") =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${paths}</svg>`;

export const icons = {
  cart: stroke('<path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>'),
  menu: stroke('<path d="M4 7h16M4 12h16M4 17h16"/>'),
  download: stroke('<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/>'),
  edit: stroke('<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17v3Z"/><path d="m14.5 7.5 3 3"/>'),
  receipt: stroke('<path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z"/><path d="M9 8h6M9 12h6"/>'),
  check: stroke('<path d="m5 12.5 4.2 4.2L19 7"/>'),
  file: stroke('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>'),
  lock: stroke('<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  mail: stroke('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/>'),
  phone: stroke('<path d="M5 4h3.5l1.5 4.5-2 1.5a11 11 0 0 0 6 6l1.5-2 4.5 1.5V19a1.5 1.5 0 0 1-1.6 1.5A16 16 0 0 1 3.5 5.6 1.5 1.5 0 0 1 5 4Z"/>'),
  pin: stroke('<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  once: stroke('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
  info: stroke('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
};

export const NAV = [
  ["/shop/", "Shop"],
  ["/about/", "About"],
  ["/faq/", "FAQ"],
  ["/contact/", "Contact"],
];

export const FOOTER_LINKS = [
  ["/shop/", "Shop"],
  ["/about/", "About"],
  ["/faq/", "FAQ"],
  ["/contact/", "Contact"],
  ["/terms/", "Terms"],
  ["/privacy/", "Privacy"],
  ["/refunds/", "Refunds"],
  ["/delivery/", "Digital Delivery"],
  ["/cookies/", "Cookies"],
];

export function addressLines(site) {
  const a = site.address;
  return [a.street, `${a.city}, ${a.region} ${a.postalCode}`, a.country];
}

export function layout(ctx, page) {
  const { site, asset } = ctx;
  const url = site.url + page.path;
  const title = page.fullTitle || (page.path === "/" ? `${site.brand} — ${page.title}` : `${page.title} | ${site.brand}`);
  const ogImage = site.url + (page.ogImage || "/assets/brand/og-default.jpg");
  const jsonLd = (page.jsonLd || [])
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
  const nav = NAV.map(
    ([href, label]) => `<a href="${href}"${page.nav === href ? ' aria-current="page"' : ""}>${label}</a>`
  ).join("");
  const scripts = ["/assets/js/site.js", ...(page.scripts || [])]
    .map((src) => `<script src="${asset(src)}" defer></script>`)
    .join("\n");
  const year = new Date().getFullYear();
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex, nofollow">' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${esc(site.brand)}">
<meta property="og:title" content="${esc(page.ogTitle || title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1F2A44">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/inter-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset("/assets/css/site.css")}">
${jsonLd}
${scripts}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/">${logoSvg()}<span>${esc(site.brand)}</span></a>
    <a class="nav-a cart-link cart-shortcut" href="/checkout/" aria-label="Cart">${icons.cart}<span class="cart-count" data-count="0">0</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu">${icons.menu}</button>
    <nav id="site-nav" class="nav" aria-label="Main">
      ${nav}
      <a href="/checkout/" class="cart-link"${page.nav === "/checkout/" ? ' aria-current="page"' : ""}>${icons.cart}<span>Cart</span><span class="cart-count" data-count="0">0</span></a>
    </nav>
  </div>
</header>
<main id="main">
${page.body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div>
        <div class="footer-brand">${logoSvg()}<span>${esc(site.brand)}</span></div>
        <p class="mb-0">${esc(site.footerLine)}</p>
      </div>
      <div>
        <ul class="footer-links">${FOOTER_LINKS.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul>
        <div class="footer-contact">
          <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> · <a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phoneDisplay)}</a><br>
          ${addressLines(site).map(esc).join(", ")}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${year} ${esc(site.brand)}. All rights reserved.</span>
      <span>Prices in euros (EUR). One-time purchases of digital files — no subscriptions, no physical shipping.</span>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

export function pageHeader({ title, intro, crumbs, eyebrow }) {
  const crumbHtml = crumbs
    ? `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs
        .map(([href, label], i) =>
          i === crumbs.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${href}">${esc(label)}</a></li>`
        )
        .join("")}</ol></nav>`
    : "";
  return `<section class="page-header"><div class="container">${crumbHtml}${
    eyebrow ? `<span class="eyebrow">${esc(eyebrow)}</span>` : ""
  }<h1>${esc(title)}</h1>${intro ? `<p class="lead">${intro}</p>` : ""}</div></section>`;
}

export function productCard(ctx, p, headingLevel = 3) {
  const m = ctx.manifest.products[p.slug];
  const h = `h${headingLevel}`;
  return `<article class="product-card">
  <div class="thumb"><img src="${m.image}" width="1200" height="900" alt="Preview of the ${esc(p.name)} template pages" loading="lazy"></div>
  <div class="body">
    <${h}><a href="/products/${p.slug}/">${esc(p.name)}</a></${h}>
    <p>${esc(p.description)}</p>
    <div class="formats">${p.formats.map((f) => `<span class="tag">${f}</span>`).join("")}</div>
    <div class="meta"><span class="price">${money(p.price)}</span><span class="small muted">One-time purchase</span></div>
  </div>
</article>`;
}
