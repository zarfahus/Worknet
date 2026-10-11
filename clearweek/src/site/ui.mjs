// Shared layout and small helpers for the ClearWeek Studio static site.

export const esc = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

// Prices always show the ISO currency code as well as the symbol, so "$" is never ambiguous.
export const money = (cents) => `${usd.format(cents / 100)} USD`;
export const priceHtml = (cents, cls = "price") =>
  `<span class="${cls}">${usd.format(cents / 100)}<abbr title="US dollars">USD</abbr></span>`;

export const tel = (site) => site.phone.replace(/[^+\d]/g, "");
export const mail = (site, label) => `<a href="mailto:${esc(site.email)}">${esc(label || site.email)}</a>`;
export const phone = (site) => `<a href="tel:${esc(tel(site))}">${esc(site.phoneDisplay)}</a>`;

export const addressLines = (site) => {
  const a = site.address;
  return [a.street, `${a.city}, ${a.region} ${a.postalCode}`, a.country];
};
export const addressInline = (site) => addressLines(site).join(", ");

// "ClearWeek Studio" or, once the owner fills in legalName, "Jane Doe LLC, trading as ClearWeek Studio".
export const sellerName = (site) => (site.legalName ? `${site.legalName}, trading as ${site.brand}` : site.brand);

export const listJoin = (items, word = "and") =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} ${word} ${items[items.length - 1]}`;

// Logo: a green page with three lines, the last one ticked. Same mark as in the product PDFs.
export const logoSvg = (size = 28) =>
  `<svg class="logo" width="${size}" height="${size}" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><rect width="32" height="32" rx="7" fill="#2E5A44"/><path d="M7 11.5h17.5M7 17.5h13.5M7 23.5h7.5M19.5 23.5l2.4 2.4 4.4-5.6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

export const NAV = [
  ["/shop/", "Shop"],
  ["/how-it-works/", "How it works"],
  ["/faq/", "FAQ"],
  ["/about/", "About"],
  ["/contact/", "Contact"],
];

const FOOTER = [
  ["Shop", [["/products/weekly-focus-planner/", "Weekly Focus Planner"], ["/products/project-workflow-bundle/", "Project Workflow Bundle"], ["/shop/#compare", "Compare the two"]]],
  ["Help", [["/how-it-works/", "How buying works"], ["/faq/", "FAQ"], ["/download-help/", "Download help"], ["/contact/", "Contact and support"], ["/about/", "About us"]]],
  [
    "Policies",
    [
      ["/terms/", "Terms and Conditions"],
      ["/refund-policy/", "Delivery and Refund Policy"],
      ["/privacy/", "Privacy Policy"],
      ["/cookies/", "Cookie Policy"],
      ["/legal-notice/", "Legal Notice"],
      ["/accessibility/", "Accessibility"],
    ],
  ],
];

export function layout(ctx, page) {
  const { site, asset } = ctx;
  const url = site.url + page.path;
  const title = page.fullTitle || `${page.title} | ${site.brand}`;
  const ogImage = site.url + (page.ogImage || "/assets/img/og-image.jpg");
  const jsonLd = (page.jsonLd || [])
    .map((obj) => `<script type="application/ld+json">${JSON.stringify(obj).replace(/</g, "\\u003c")}</script>`)
    .join("\n");
  const nav = NAV.map(([href, label]) => `<li><a href="${href}"${page.nav === href ? ' aria-current="page"' : ""}>${label}</a></li>`).join("");
  return `<!doctype html>
<html lang="en-US">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(page.description)}">
${page.noindex ? '<meta name="robots" content="noindex">' : `<link rel="canonical" href="${esc(url)}">`}
<meta property="og:type" content="${page.ogType || "website"}">
<meta property="og:site_name" content="${esc(site.brand)}">
<meta property="og:title" content="${esc(page.ogTitle || page.title)}">
<meta property="og:description" content="${esc(page.description)}">
<meta property="og:url" content="${esc(url)}">
<meta property="og:image" content="${esc(ogImage)}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#F7F4EC">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="preload" href="/assets/fonts/atkinson-400.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/fraunces-600.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset("/assets/css/site.css")}">
<script src="${asset("/assets/js/site.js")}" defer></script>
${jsonLd}
</head>
<body${page.bodyClass ? ` class="${page.bodyClass}"` : ""}>
<a class="skip-link" href="#main">Skip to main content</a>
<header class="site-header">
  <div class="container header-inner">
    <a class="brand" href="/" aria-label="${esc(site.brand)}, home">${logoSvg()}<span>${esc(site.brand)}</span></a>
    <nav aria-label="Main"><ul class="nav">${nav}</ul></nav>
  </div>
</header>
<main id="main" tabindex="-1">
${page.body}
</main>
<footer class="site-footer">
  <div class="container">
    <div class="footer-grid">
      <div class="footer-about">
        <p class="footer-brand">${logoSvg(26)}<span>${esc(site.brand)}</span></p>
        <p>Two downloadable planning kits, sold directly to customers. Digital products only: nothing is shipped.</p>
        <address>
          ${addressLines(site).map(esc).join("<br>")}<br>
          ${mail(site)}<br>
          ${phone(site)}
        </address>
      </div>
      ${FOOTER.map(
        ([heading, links]) =>
          `<div><h2 class="footer-heading">${heading}</h2><ul>${links.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join("")}</ul></div>`
      ).join("\n      ")}
    </div>
    <div class="footer-bottom">
      <p>© ${site.copyrightYear} ${esc(site.brand)}. Prices are in US dollars (USD) and are one-time payments. Card payments are processed by Stripe.</p>
      <p><a href="/legal-notice/">Business details</a> · <a href="/sitemap.xml">Sitemap</a></p>
    </div>
  </div>
</footer>
</body>
</html>
`;
}

export function crumbs(items) {
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><ol>${items
    .map(([href, label], i) => (i === items.length - 1 ? `<li><span aria-current="page">${esc(label)}</span></li>` : `<li><a href="${href}">${esc(label)}</a></li>`))
    .join("")}</ol></nav>`;
}

export function pageHeader({ title, intro, trail }) {
  return `<section class="page-header"><div class="container">${trail ? crumbs(trail) : ""}<h1>${esc(title)}</h1>${intro ? `<p class="lead">${intro}</p>` : ""}</div></section>`;
}

export const tick = `<svg class="tick" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M4.5 10.5l3.5 3.5 7.5-8" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
export const cross = `<svg class="cross" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path d="M6 10h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

export function checkList(items) {
  return `<ul class="check-list">${items.map((i) => `<li>${tick}<span>${i}</span></li>`).join("")}</ul>`;
}

export function kitCard(ctx, p, { headingLevel = 3, wide = false } = {}) {
  const h = `h${headingLevel}`;
  const bySlug = Object.fromEntries(ctx.products.products.map((x) => [x.slug, x]));
  return `<article class="kit${wide ? " kit-wide" : ""}">
  <a class="kit-image" href="/products/${p.slug}/" tabindex="-1" aria-hidden="true"><img src="/assets/img/${p.slug}.webp" width="1000" height="750" alt="" loading="lazy"></a>
  <div class="kit-body">
    <${h} class="kit-name"><a href="/products/${p.slug}/">${esc(p.name)}</a></${h}>
    <p class="kit-price">${priceHtml(p.price)} <span class="kit-terms">one-time payment</span></p>
    <p>${esc(p.short)}</p>
    ${checkList(p.includes.map((i) => (i === "Everything in the Weekly Focus Planner" ? `Everything in the <a href="/products/weekly-focus-planner/">${esc(bySlug["weekly-focus-planner"].name)}</a>` : esc(i))))}
    <p class="kit-format">${esc(p.format)} · Digital download</p>
    <a class="btn btn-block" href="/products/${p.slug}/">View the ${p.slug === "weekly-focus-planner" ? "planner" : "bundle"}<span class="visually-hidden">: ${esc(p.name)}</span></a>
  </div>
</article>`;
}

export function faqList(items) {
  return `<div class="faq">${items
    .map((it) => `<details${it.id ? ` id="${it.id}"` : ""}><summary>${esc(it.q)}</summary><div class="answer">${it.a}</div></details>`)
    .join("")}</div>`;
}

export const faqJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim() },
  })),
});

export function organizationJsonLd(site) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand,
    ...(site.legalName ? { legalName: site.legalName } : {}),
    url: site.url,
    logo: `${site.url}/apple-touch-icon.png`,
    email: site.email,
    telephone: tel(site),
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.region,
      postalCode: site.address.postalCode,
      addressCountry: site.address.countryCode,
    },
    contactPoint: { "@type": "ContactPoint", contactType: "customer support", email: site.email, telephone: tel(site), availableLanguage: "English" },
  };
}
