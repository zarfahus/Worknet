// Shared layout, helpers and icons for the static site build.

export const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Prices always carry the ISO currency code, not just the symbol (Stripe website checklist).
export const money = (cents) => `${fmt.format(cents / 100)} USD`;
export const priceHtml = (cents) => `<span class="price">${fmt.format(cents / 100)}<span class="cur">USD</span></span>`;

export const fileSize = (bytes) => (bytes >= 1024 * 1024 ? `${(bytes / 1048576).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

export const listJoin = (items) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

export const sentenceCase = (s) =>
  (s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .replace(/\bpdf\b/g, "PDF")
    .replace(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/g, (d) => d[0].toUpperCase() + d.slice(1));

export const tel = (site) => site.phone.replace(/\s/g, "");

// Logo mark: navy tile, roof line over two text lines. Mirrors products/render.py:draw_logo.
export const logoSvg = () =>
  `<svg viewBox="0 0 24 24" aria-hidden="true"><rect width="24" height="24" rx="5.5" fill="#1F2A44"/><path d="M6 11.5 12 6.5l6 5M8 15h8M8 18.5h5.5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

const stroke = (paths) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`;

export const icons = {
  cart: stroke('<path d="M3 4h2l2.2 10.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/>'),
  menu: stroke('<path d="M4 7h16M4 12h16M4 17h16"/>'),
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
  const title = page.fullTitle || (page.path === "/" ? `${site.brand} | ${page.title}` : `${page.title} | ${site.brand}`);
  const ogImage = site.url + (page.ogImage || "/assets/brand/og-default.jpg");
  const jsonLd = (page.jsonLd || [])
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
  const nav = NAV.map(([href, label]) => `<a href="${href}"${page.nav === href ? ' aria-current="page"' : ""}>${label}</a>`).join("");
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
${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`}
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
<link rel="preload" href="/assets/fonts/source-serif-4-latin-var.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset("/assets/css/site.css")}">
${jsonLd}
${scripts}
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/">${logoSvg()}<span>${esc(site.brand)}</span></a>
    <a class="cart-link cart-shortcut" href="/checkout/" aria-label="Cart">${icons.cart}<span class="cart-count" data-count="0">0</span></a>
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
          <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> &nbsp;|&nbsp; <a href="tel:${esc(tel(site))}">${esc(site.phoneDisplay)}</a><br>
          ${addressLines(site).map(esc).join(", ")}
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${year} ${esc(site.brand)}. All rights reserved.</span>
      <span>Digital products only. Prices in US dollars (USD). One-time payments, no subscriptions.</span>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

export function pageHeader({ title, intro, crumbs }) {
  const crumbHtml = crumbs
    ? `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${crumbs
        .map(([href, label], i) =>
          i === crumbs.length - 1 ? `<li aria-current="page">${esc(label)}</li>` : `<li><a href="${href}">${esc(label)}</a></li>`
        )
        .join("")}</ol></nav>`
    : "";
  return `<section class="page-header"><div class="container">${crumbHtml}<h1>${esc(title)}</h1>${
    intro ? `<p class="lead">${intro}</p>` : ""
  }</div></section>`;
}

// One-line summary of what a product contains, e.g. "13-page PDF and Word file".
export function productFacts(ctx, slug) {
  const c = ctx.contents[slug];
  const p = ctx.catalog.products.find((x) => x.slug === slug);
  const pages = c.pdfs.reduce((n, d) => n + d.pages, 0);
  const parts = [`${pages} printable pages`];
  if (p.formats.includes("DOCX")) parts.push("Word files");
  if (p.formats.includes("XLSX")) parts.push("a spreadsheet");
  return listJoin(parts);
}

export function productCard(ctx, p, headingLevel = 3) {
  const m = ctx.manifest.products[p.slug];
  const h = `h${headingLevel}`;
  return `<article class="product-card">
  <div class="thumb"><img src="${m.image}" width="1200" height="900" alt="Pages from the ${esc(p.name)}" loading="lazy"></div>
  <div class="body">
    <${h}><a href="/products/${p.slug}/">${esc(p.name)}</a></${h}>
    <p>${esc(p.description)}</p>
    <div class="facts-line">${esc(productFacts(ctx, p.slug))} (${p.formats.join(", ")})</div>
    <div class="meta">${priceHtml(p.price)}</div>
  </div>
</article>`;
}
