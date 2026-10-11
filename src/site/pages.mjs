// Page definitions. Each function returns { path, title, description, body, ... } for layout().
import { addressLines, esc, fileSize, listJoin, money, pageHeader, priceHtml, productCard, productFacts, sentenceCase, tel } from "./ui.mjs";

const FORMAT_HELP = {
  PDF: "Printable PDF on US Letter paper (8.5 × 11 in). Print at home or at a print shop, or write on it with any PDF app that supports annotations.",
  DOCX: "Editable Word document. Opens in Microsoft Word, Google Docs, Apple Pages and LibreOffice Writer.",
  XLSX: "Editable spreadsheet with drop-down lists and dates that fill in for you. Opens in Microsoft Excel, Google Sheets, Apple Numbers and LibreOffice Calc.",
};

const mailto = (site) => `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
const phoneLink = (site) => `<a href="tel:${esc(tel(site))}">${esc(site.phoneDisplay)}</a>`;

export function faqItems(site) {
  return [
    {
      q: "What do I receive?",
      a: `<p>You receive the digital files listed on the product page: printable PDF templates plus editable Word (DOCX) and/or spreadsheet (XLSX) files, depending on the product. Every order also includes a ZIP file with everything in one download.</p><p>We only sell digital products. Nothing is shipped to you.</p>`,
    },
    {
      q: "When will I receive my files?",
      a: `<p>Straight away. When your payment goes through, you land on your order page, where every file is ready to download. Card payments are usually confirmed within a few seconds.</p><p>You can come back to the order page later with the same link, so it's worth bookmarking. The <a href="/delivery/">Digital Delivery Policy</a> has the details.</p>`,
    },
    {
      q: "Are the files editable?",
      a: `<p>Yes. The Word and spreadsheet files are fully editable, so you can rename headings, add rows or remove pages you don't need. The PDFs are made for printing or for writing on with a PDF app; their layout isn't meant to be edited.</p>`,
    },
    {
      q: "Do I need special software?",
      a: `<p>No. PDFs open in any web browser. Word files work in Microsoft Word, Google Docs, Apple Pages or the free LibreOffice Writer. Spreadsheets work in Microsoft Excel, Google Sheets, Apple Numbers or the free LibreOffice Calc. There are no macros or add-ons to install.</p>`,
    },
    {
      q: "Can I use the templates commercially?",
      a: `<p>You can use them in your business: to plan your work, run meetings, manage projects and organize work you do for your clients. What you can't do is resell or share the template files themselves, or publish them (or close copies) as your own templates. The full license is in section 7 of our <a href="/terms/#license">Terms of Service</a>.</p>`,
    },
    {
      q: "Do you offer refunds?",
      a: `<p>Yes, when something is wrong. If a file is faulty, won't open, is incomplete or isn't what the product page described, tell us within ${site.refundReportDays} days and we'll send a corrected file or refund you in full. We also refund accidental duplicate purchases. Because the files are delivered instantly, we don't offer refunds just for a change of mind once they're available to download. The <a href="/refunds/">Refund Policy</a> explains everything, including how to ask.</p>`,
    },
    {
      q: "How can I contact support?",
      a: `<p>Email ${mailto(site)} or call ${phoneLink(site)}. If your question is about an order, include your order reference (it starts with DN- and is shown on your order page) or the email address you used at checkout. Our mailing address is ${esc(addressLines(site).join(", "))}.</p>`,
    },
  ];
}

const faqHtml = (items) =>
  `<div class="faq">${items.map((it) => `<details><summary>${esc(it.q)}</summary><div class="answer">${it.a}</div></details>`).join("")}</div>`;

const faqJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({ "@type": "Question", name: it.q, acceptedAnswer: { "@type": "Answer", text: it.a.replace(/<[^>]+>/g, "") } })),
});

export function organizationJsonLd(site) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand,
    url: site.url,
    logo: `${site.url}/assets/brand/icon-512.png`,
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
  };
}

// ---------------------------------------------------------------------------

export function home(ctx) {
  const { site, catalog, manifest } = ctx;
  const items = faqItems(site);
  const bySlug = Object.fromEntries(catalog.products.map((p) => [p.slug, p]));
  const pv = (slug, page) => manifest.products[slug].previews.find((x) => x.page === page);
  const inside = [
    ["weekly-focus-planner", 5, "A daily page from the Weekly Focus Planner: three must-dos, a task list and an hour-by-hour schedule."],
    ["meeting-notes-action-tracker", 4, "The meeting notes page, with room for decisions and action items as they come up."],
    ["creator-planning-bundle", 7, "The production checklist from the Creator Planning Bundle, used once per piece of content."],
  ];
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div>
      <h1>Simple templates for better organized work.</h1>
      <p class="lead">Download practical planning and workflow templates designed to make everyday work easier.</p>
      <a class="btn" href="/shop/">Browse Templates</a>
      <p class="hero-note">Printable PDFs with editable Word or spreadsheet versions. One-time purchase, from ${money(Math.min(...catalog.products.map((p) => p.price)))}.</p>
    </div>
    <img class="hero-art" src="/assets/img/hero-pages.webp" width="1100" height="900" alt="Three ${esc(site.brand)} template pages: a 90-day plan overview, a meeting notes page and a daily task page">
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head">
      <h2>Practical tools. Clear organization. Instant access.</h2>
      <p>${esc(site.description)}</p>
    </div>
    <div class="benefits">
      <div class="benefit"><h3>Instant digital delivery</h3><p>Your files are ready to download the moment your payment is confirmed. There's nothing to wait for and nothing shipped.</p></div>
      <div class="benefit"><h3>Editable, practical templates</h3><p>Every product comes as a print-ready PDF plus Word or spreadsheet files you can change to fit the way you work.</p></div>
      <div class="benefit"><h3>One-time purchases</h3><p>You pay once and keep the files. No subscription, no account to set up and no recurring charges.</p></div>
    </div>
  </div>
</section>

<section class="section band" id="templates">
  <div class="container">
    <div class="split-head">
      <div><h2>Featured templates</h2><p>Three single templates at ${money(1299)} and three larger toolkits at ${money(1999)}.</p></div>
      <a class="text-link" href="/shop/">Compare all templates</a>
    </div>
    <div class="product-grid">${catalog.products.map((p) => productCard(ctx, p)).join("")}</div>
  </div>
</section>

<section class="section" id="inside">
  <div class="container">
    <div class="section-head"><h2>A look inside</h2><p>These are actual pages from the files you download, not mock-ups. Every product page shows a full list of what's included.</p></div>
    <div class="inside-grid">${inside
      .map(([slug, page, caption]) => {
        const img = pv(slug, page);
        return `<figure><div class="page"><img src="${img.src}" width="${img.width}" height="${img.height}" alt="${esc(caption)}" loading="lazy"></div><figcaption>${esc(caption)} <a href="/products/${slug}/">${esc(bySlug[slug].name)}</a></figcaption></figure>`;
      })
      .join("")}</div>
  </div>
</section>

<section class="section band" id="how-it-works">
  <div class="container">
    <div class="section-head"><h2>How it works</h2></div>
    <ol class="steps">
      <li><h3>Choose a template</h3><p>Each product page lists every page and file you'll get, with previews.</p></li>
      <li><h3>Complete secure checkout</h3><p>Review your order, then pay on Stripe's secure payment page.</p></li>
      <li><h3>Receive your digital files</h3><p>Download each file, or everything as one ZIP, from your order page.</p></li>
      <li><h3>Start using them immediately</h3><p>Print the PDFs, or open the Word and spreadsheet files and make them your own.</p></li>
    </ol>
  </div>
</section>

<section class="section" id="faq">
  <div class="container narrow">
    <h2>Frequently asked questions</h2>
    ${faqHtml(items)}
    <p class="muted">Still have a question? Email ${mailto(site)} or call ${phoneLink(site)}. More answers on the <a href="/faq/">FAQ page</a>.</p>
  </div>
</section>`;
  return {
    path: "/",
    title: "Printable Planner, Meeting and Workflow Templates",
    description:
      "Practical productivity templates: weekly planner, meeting notes and action tracker, content planning calendar and workflow toolkits. Printable PDF plus editable Word and Excel files. One-time purchase in USD.",
    nav: "/",
    body,
    jsonLd: [organizationJsonLd(site), { "@context": "https://schema.org", "@type": "WebSite", name: site.brand, url: site.url }, faqJsonLd(items)],
  };
}

export function shop(ctx) {
  const { catalog, contents } = ctx;
  const singles = catalog.products.filter((p) => p.price === 1299);
  const bundles = catalog.products.filter((p) => p.price === 1999);
  const rows = catalog.products
    .map((p) => {
      const pages = contents[p.slug].pdfs.reduce((n, d) => n + d.pages, 0);
      const sheets = contents[p.slug].workbooks.reduce((n, w) => n + w.sheets.length - 1, 0);
      return `<tr><th scope="row"><a href="/products/${p.slug}/">${esc(p.name)}</a></th><td>${esc(p.goodFor[0])}</td><td>${pages}</td><td>${p.formats.join(", ")}${sheets ? ` (${sheets} spreadsheet tabs)` : ""}</td><td>${priceHtml(p.price)}</td></tr>`;
    })
    .join("");
  const body = `
${pageHeader({
  title: "Templates",
  intro: "Printable and editable templates for planning your week, running meetings, scheduling content and documenting how work gets done. Each one is a one-time purchase delivered as digital files.",
  crumbs: [["/", "Home"], ["/shop/", "Shop"]],
})}
<section class="section-sm">
  <div class="container">
    <div class="group">
      <div class="split-head"><h2>Single templates</h2><span class="muted">${money(1299)} each</span></div>
      <div class="product-grid">${singles.map((p) => productCard(ctx, p)).join("")}</div>
    </div>
    <div class="group">
      <div class="split-head"><h2>Toolkits and bundles</h2><span class="muted">${money(1999)} each</span></div>
      <div class="product-grid">${bundles.map((p) => productCard(ctx, p)).join("")}</div>
    </div>
    <div class="group">
      <div class="split-head"><div><h2>Compare the templates</h2><p>The Complete Productivity Toolkit includes the full Weekly Focus Planner and Meeting Notes &amp; Action Tracker, so there's no need to buy those separately if you choose it.</p></div></div>
      <div class="compare-wrap"><table class="compare">
        <thead><tr><th scope="col">Template</th><th scope="col">Good for</th><th scope="col">Printable pages</th><th scope="col">Files</th><th scope="col">Price</th></tr></thead>
        <tbody>${rows}</tbody>
      </table></div>
      <p class="small muted">All prices are in US dollars (USD). Sales tax, where it applies, is shown on the payment page before you pay.</p>
    </div>
  </div>
</section>`;
  return {
    path: "/shop/",
    title: "Shop Planner and Productivity Templates",
    description:
      "Shop printable productivity templates: weekly planner template, meeting notes template, content planning calendar, small business workflow templates and productivity toolkits. Instant download, prices in USD.",
    nav: "/shop/",
    body,
  };
}

export function product(ctx, p) {
  const { site, catalog, manifest, contents } = ctx;
  const m = manifest.products[p.slug];
  const c = contents[p.slug];
  const files = m.files.map((id) => manifest.files[id]);
  const zip = manifest.files[m.zip];
  const bySlug = Object.fromEntries(catalog.products.map((x) => [x.slug, x]));
  const pdfPages = c.pdfs.reduce((n, d) => n + d.pages, 0);
  const previews = m.previews;

  const notices = [];
  if (p.contains?.length) {
    notices.push(
      `<div class="notice info">Includes the full ${listJoin(p.contains.map((s) => `<a href="/products/${s}/">${esc(bySlug[s].name)}</a>`))}. If you buy this toolkit, you don't need to buy ${p.contains.length > 1 ? "them" : "it"} separately.</div>`
    );
  }
  if (p.bundledIn?.length) {
    notices.push(
      `<div class="notice">Also included in the ${listJoin(p.bundledIn.map((s) => `<a href="/products/${s}/">${esc(bySlug[s].name)}</a> (${money(bySlug[s].price)})`))}.</div>`
    );
  }

  const gallery = `
<div class="gallery">
  <button type="button" class="gallery-main" data-lightbox aria-label="Enlarge preview"><img id="gallery-main" src="${previews[0].src}" width="${previews[0].width}" height="${previews[0].height}" alt="${esc(p.name)}, page ${previews[0].page}"></button>
  <div class="gallery-thumbs">${previews
    .map(
      (pv, i) =>
        `<button type="button" data-src="${pv.src}" data-alt="${esc(p.name)}, page ${pv.page}"${i === 0 ? ' aria-current="true"' : ""} aria-label="Show page ${pv.page}"><img src="${pv.src}" width="${pv.width}" height="${pv.height}" alt="" loading="lazy"></button>`
    )
    .join("")}</div>
  <p class="gallery-note">Actual pages from the ${esc(p.name)} files. Click the large image to enlarge it.</p>
</div>
<dialog class="lightbox" id="lightbox"><form method="dialog"><button type="submit">Close</button></form><img id="lightbox-img" src="${previews[0].src}" alt=""></dialog>`;

  const tocHtml = c.pdfs
    .map(
      (d) => `<p class="doc-title">${esc(d.file)}</p><p class="doc-meta">${d.pages} pages, US Letter${d.orientation.length > 1 ? ", portrait and landscape" : ""}</p>
<ul class="toc-list">${d.sections.map((s) => `<li><span>${esc(sentenceCase(s.name))}</span><span class="pg">p. ${s.pages}</span></li>`).join("")}</ul>`
    )
    .join("");
  const sheetsHtml = c.workbooks
    .map((w) => `<p class="doc-title">${esc(w.file)}</p><p class="doc-meta">Spreadsheet tabs</p><ul class="toc-list">${w.sheets.map((s) => `<li><span>${esc(s)}</span></li>`).join("")}</ul>`)
    .join("");
  const hasDocx = files.some((f) => f.format === "DOCX");

  const fileRows = files
    .map((f) => `<tr><td><span class="file-name">${esc(f.filename)}</span><br><span class="small muted">${esc(f.label)}</span></td><td>${f.format}</td><td class="num">${fileSize(f.bytes)}</td></tr>`)
    .join("");

  const body = `
<div class="container">
  <div class="product-layout">
    ${gallery}
    <div class="buy-box">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/shop/">Shop</a></li><li aria-current="page">${esc(p.name)}</li></ol></nav>
      <h1>${esc(p.name)}</h1>
      <p><strong>${esc(p.description)}</strong></p>
      <p class="intro">${esc(p.intro)}</p>
      <div class="buy-price">${priceHtml(p.price)}<span class="note">One-time payment. Sales tax, if any, is shown before you pay.</span></div>
      <div class="buy-actions">
        <button class="btn" type="button" data-buy-now="${p.slug}">Buy now</button>
        <button class="btn btn-secondary" type="button" data-add-to-cart="${p.slug}">Add to cart</button>
      </div>
      <p class="small muted hidden" data-cart-feedback="${p.slug}" role="status"></p>
      <div class="stack">${notices.join("")}</div>
      <ul class="key-facts">
        <li><strong>You get</strong><span>${esc(productFacts(ctx, p.slug))}, plus a ZIP of everything</span></li>
        <li><strong>Formats</strong><span>${p.formats.join(", ")}</span></li>
        <li><strong>Paper size</strong><span>US Letter, 8.5 × 11 in (prints on A4 with “fit to page”)</span></li>
        <li><strong>Delivery</strong><span>Instant download after payment. <a href="/delivery/">Delivery policy</a></span></li>
        <li><strong>Refunds</strong><span>Faulty or not as described? We'll fix it or refund you. <a href="/refunds/">Refund policy</a></span></li>
      </ul>
    </div>
  </div>

  <section class="detail">
    <h2>What's included</h2>
    <div class="detail-body">
      <ul class="check-list">${p.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <p class="muted">${pdfPages} printable pages in total${hasDocx ? ", with an editable Word version of every page" : ""}. Here's exactly what's in each file:</p>
      ${tocHtml}${sheetsHtml}
    </div>
  </section>
  <section class="detail">
    <h2>Who it's for</h2>
    <div class="detail-body"><ul>${p.goodFor.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
  </section>
  <section class="detail">
    <h2>Files you'll receive</h2>
    <div class="detail-body">
      <table class="file-table">
        <thead><tr><th>File</th><th>Format</th><th class="num">Size</th></tr></thead>
        <tbody>${fileRows}<tr><td><span class="file-name">${esc(zip.filename)}</span><br><span class="small muted">All of the above in one ZIP file</span></td><td>ZIP</td><td class="num">${fileSize(zip.bytes)}</td></tr></tbody>
      </table>
    </div>
  </section>
  <section class="detail">
    <h2>Works with</h2>
    <div class="detail-body"><ul>${p.formats.map((f) => `<li><strong>${f}:</strong> ${esc(FORMAT_HELP[f])}</li>`).join("")}</ul></div>
  </section>
  <section class="detail">
    <h2>License and the small print</h2>
    <div class="detail-body">
      <p>You can use and edit these templates for your own personal use or inside your business, including for work you do for clients. Please don't resell, share or upload the files for others to download. The full license is in our <a href="/terms/#license">Terms of Service</a>.</p>
      <p>These are organizational templates. They aren't legal, financial, accounting, tax or other professional advice.</p>
      <p>Questions before you buy? Email ${mailto(site)} or call ${phoneLink(site)}.</p>
    </div>
  </section>
  <div class="section-sm"></div>
</div>`;

  return {
    path: `/products/${p.slug}/`,
    title: p.seo.title,
    description: p.seo.description,
    nav: "/shop/",
    ogType: "product",
    ogImage: m.ogImage,
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description,
        sku: p.slug,
        image: [`${site.url}${m.ogImage}`, ...previews.map((pv) => site.url + pv.src)],
        brand: { "@type": "Brand", name: site.brand },
        offers: {
          "@type": "Offer",
          url: `${site.url}/products/${p.slug}/`,
          price: (p.price / 100).toFixed(2),
          priceCurrency: catalog.currency,
          availability: "https://schema.org/InStock",
          seller: { "@type": "Organization", name: site.brand },
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: `${site.url}/` },
          { "@type": "ListItem", position: 2, name: "Shop", item: `${site.url}/shop/` },
          { "@type": "ListItem", position: 3, name: p.name, item: `${site.url}/products/${p.slug}/` },
        ],
      },
    ],
  };
}

export function checkout(ctx) {
  const { site, catalog, manifest } = ctx;
  const data = {
    currency: catalog.currency,
    products: catalog.products.map((p) => ({ slug: p.slug, name: p.name, price: p.price, formats: p.formats, contains: p.contains || [], image: manifest.products[p.slug].image })),
  };
  const body = `
${pageHeader({ title: "Your cart", crumbs: [["/", "Home"], ["/checkout/", "Cart"]] })}
<div class="container">
  <div class="checkout-layout">
    <section aria-labelledby="order-heading">
      <div class="seller-box">You're buying from <strong>${esc(site.brand)}</strong>, ${esc(site.sellerLocation)}. All prices are in <strong>US dollars (USD)</strong>. These are digital products; nothing will be shipped.</div>
      <h2 id="order-heading" class="visually-hidden">Items in your cart</h2>
      <noscript><div class="notice warn">The cart needs JavaScript. Please turn it on, or email ${mailto(site)} and we'll help you place your order.</div></noscript>
      <div id="cart-empty" class="empty-state hidden">
        <h3>Your cart is empty</h3>
        <p class="muted">Have a look around the shop and add a template.</p>
        <a class="btn" href="/shop/">Browse Templates</a>
      </div>
      <ul id="cart-items" class="cart-items" aria-live="polite"></ul>
      <div id="cart-notices" class="stack"></div>
    </section>

    <aside class="panel summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Order summary</h2>
      <div class="summary-rows">
        <div class="summary-row"><span>Subtotal</span><span id="summary-subtotal">${money(0)}</span></div>
        <div class="summary-row"><span>Sales tax</span><span class="muted small">Calculated on the payment page, if it applies</span></div>
        <div class="summary-row total"><span>Total before tax</span><span id="summary-total">${money(0)}</span></div>
      </div>
      <ul class="terms-list">
        <li><strong>One-time payment.</strong> You're charged once, in USD. No subscription, no recurring charges and no extras added.</li>
        <li><strong>Digital delivery.</strong> Your files are ready to download on your order page as soon as payment is confirmed.</li>
        <li><strong>Secure payment.</strong> You'll pay on Stripe's secure payment page. We never see or store your full card number.</li>
        <li><strong>Accepted payments.</strong> ${esc(site.acceptedPayments)}. Other methods may be offered on the payment page.</li>
        ${site.statementDescriptor ? `<li><strong>On your statement.</strong> The charge will appear as ${esc(site.statementDescriptor)}.</li>` : ""}
      </ul>
      <form id="checkout-form" novalidate>
        <div class="consent">
          <label><input type="checkbox" name="acceptTerms" id="accept-terms" required><span>I agree to the <a href="/terms/" target="_blank" rel="noopener">Terms of Service</a> and the <a href="/refunds/" target="_blank" rel="noopener">Refund Policy</a>, and I've read the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>
          <label><input type="checkbox" name="digitalConsent" id="digital-consent" required><span>I understand my files will be available to download right after payment. Refunds are given for faulty or not-as-described files and duplicate purchases, not for a change of mind once the files are available (where the law allows).</span></label>
        </div>
        <div id="checkout-error" class="notice error hidden" role="alert"></div>
        <button class="btn btn-block" type="submit" id="checkout-submit" disabled>Continue to secure payment</button>
      </form>
      <p class="policy-links"><a href="/refunds/">Refund Policy</a> · <a href="/terms/">Terms of Service</a> · <a href="/privacy/">Privacy Policy</a> · <a href="/delivery/">Digital Delivery</a></p>
    </aside>
  </div>
</div>
<script type="application/json" id="catalog-data">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`;
  return {
    path: "/checkout/",
    title: "Your cart",
    description: `Review your ${site.brand} order: products, prices in USD, one-time payment and digital delivery details.`,
    nav: "/checkout/",
    noindex: true,
    scripts: ["/assets/js/checkout.js"],
    body,
  };
}

export function order(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({ title: "Your order", crumbs: [["/", "Home"], ["/order/", "Order"]] })}
<div class="container narrow">
  <div class="prose" id="order-root" aria-live="polite">
    <noscript><div class="notice warn">Your downloads load with JavaScript. Please turn it on, or email ${mailto(site)} with your order details and we'll send your files.</div></noscript>
    <p id="order-loading" class="muted">Loading your order…</p>
  </div>
</div>`;
  return { path: "/order/", title: "Your order", description: `Download the files from your ${site.brand} order.`, noindex: true, scripts: ["/assets/js/order.js"], body };
}

export function about(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({ title: `About ${site.brand}`, intro: esc(site.tagline), crumbs: [["/", "Home"], ["/about/", "About"]] })}
<div class="container">
  <div class="prose">
    <p>${esc(site.brand)} develops original digital productivity resources focused on planning, organization and workflow management.</p>
    <p>${esc(site.description)}</p>

    <h2>What we make</h2>
    <p>Templates: pages and spreadsheets that give a clear shape to work you do again and again, like planning a week, running a meeting, scheduling content or writing down how a task gets done. Every product is designed and produced by ${esc(site.brand)}, and each one comes as a printable PDF together with editable Word and/or spreadsheet files.</p>
    <ul>
      <li><a href="/products/weekly-focus-planner/">Weekly Focus Planner</a>: weekly and daily planning, with priorities, a weekly review and a goal tracker.</li>
      <li><a href="/products/meeting-notes-action-tracker/">Meeting Notes &amp; Action Tracker</a>: agendas, notes, decisions, action items and follow-ups.</li>
      <li><a href="/products/content-planning-calendar/">Content Planning Calendar</a>: 90 days of content and campaigns, planned week by week.</li>
      <li><a href="/products/complete-productivity-toolkit/">Complete Productivity Toolkit</a>, <a href="/products/small-business-workflow-toolkit/">Small Business Workflow Toolkit</a> and <a href="/products/creator-planning-bundle/">Creator Planning Bundle</a>: larger sets for specific kinds of work.</li>
    </ul>

    <h2>How the templates are put together</h2>
    <ul>
      <li><strong>Room to write.</strong> Printable pages use US Letter paper, with writing lines a little over a quarter inch apart and tables sized for handwriting rather than squeezed in.</li>
      <li><strong>Short instructions on every page.</strong> Each page says what it's for in a sentence or two, and each file starts with a page on how to use it.</li>
      <li><strong>Nothing to install.</strong> The files open in apps most people already have. The spreadsheets use ordinary formulas and drop-down lists, with no macros.</li>
      <li><strong>Straightforward pricing.</strong> Each product is a single payment in US dollars. There are no subscriptions or accounts.</li>
    </ul>

    <h2>What the templates are not</h2>
    <p>They're organizational tools. They don't provide legal, financial, accounting, tax, investment, medical or other professional advice, and they don't replace a qualified professional.</p>

    <h2>Business details</h2>
    <p>${esc(site.brand)}${site.legalName ? ` (${esc(site.legalName)})` : ""}<br><address>${addressLines(site).map(esc).join("<br>")}</address></p>
    <p>Email: ${mailto(site)}<br>Phone: ${phoneLink(site)}<br>Website: <a href="${esc(site.url)}/">${esc(site.domain)}</a></p>
  </div>
</div>`;
  return {
    path: "/about/",
    title: "About",
    description: `${site.brand} makes original printable and editable templates for planning, meetings, projects, content and everyday workflows.`,
    nav: "/about/",
    body,
  };
}

export function faq(ctx) {
  const { site } = ctx;
  const items = faqItems(site).concat([
    { q: "Is this a subscription?", a: `<p>No. Each product is a one-time payment. You're charged once at checkout and never again.</p>` },
    { q: "Which payment methods do you accept?", a: `<p>${esc(site.acceptedPayments)}. Depending on your device and location, the payment page may also offer other options. Payments are processed by Stripe.</p>` },
    { q: "What currency are prices in?", a: `<p>All prices are in US dollars (USD), and you're charged in USD. If your card is in another currency, your bank may convert the amount and may charge its own fee.</p>` },
    { q: "Do you charge sales tax?", a: `<p>Prices on the site don't include sales tax. If sales tax applies to your purchase, it's calculated and shown on the payment page before you confirm payment.</p>` },
    ...(site.statementDescriptor ? [{ q: "How will the charge appear on my statement?", a: `<p>As <strong>${esc(site.statementDescriptor)}</strong>. If you see a charge you don't recognize, email ${mailto(site)} before contacting your bank and we'll look into it straight away.</p>` }] : []),
    { q: "Can I cancel an order?", a: `<p>Orders are delivered instantly, so there's usually nothing left to cancel once you've paid. If your payment is still processing, email us and we'll stop it if we can, or refund it as soon as it completes. After delivery, the <a href="/refunds/">Refund Policy</a> applies.</p>` },
    { q: "Do the toolkits include the single templates?", a: `<p>The <a href="/products/complete-productivity-toolkit/">Complete Productivity Toolkit</a> includes the full Weekly Focus Planner and Meeting Notes &amp; Action Tracker, plus four more planners and a spreadsheet. The Small Business Workflow Toolkit and the Creator Planning Bundle have their own templates.</p>` },
    { q: "What paper size are the PDFs?", a: `<p>US Letter (8.5 × 11 in). To print on A4 paper, choose “Fit to page” or “Scale to fit” in your print settings. The Word files can be switched to any paper size.</p>` },
    { q: "I lost my download link. What should I do?", a: `<p>Email ${mailto(site)} from the address you used at checkout, or include your order reference, and we'll send you the link to your order page again.</p>` },
    { q: "Is my payment information safe?", a: `<p>Yes. You enter your card details on Stripe's secure payment page, not on our site. Stripe is certified as a PCI Service Provider Level 1, the highest level of certification in the payments industry. ${esc(site.brand)} never receives or stores your full card number. The whole site uses an encrypted (HTTPS) connection.</p>` },
  ]);
  const body = `
${pageHeader({ title: "Frequently asked questions", intro: "Files, delivery, payments, refunds and licensing, answered.", crumbs: [["/", "Home"], ["/faq/", "FAQ"]] })}
<div class="container narrow"><div class="prose">${faqHtml(items)}
<p class="muted">Can't find what you need? Email ${mailto(site)} or call ${phoneLink(site)}.</p></div></div>`;
  return {
    path: "/faq/",
    title: "FAQ",
    description: `Answers about ${site.brand} templates: what you receive, delivery, editable files, payment methods, USD pricing, sales tax, refunds and licensing.`,
    nav: "/faq/",
    body,
    jsonLd: [faqJsonLd(items)],
  };
}

export function contact(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({ title: "Contact us", intro: "Questions about a template, an order or a download? Get in touch and a real person will reply.", crumbs: [["/", "Home"], ["/contact/", "Contact"]] })}
<div class="container">
  <div class="prose">
    <div class="contact-grid">
      <div><h2>Email</h2><p>${mailto(site)}</p><p class="small muted">Best for order and download questions.</p></div>
      <div><h2>Phone</h2><p>${phoneLink(site)}</p><p class="small muted">If we can't pick up, leave a message or send an email.</p></div>
      <div><h2>Mail</h2><address>${esc(site.brand)}<br>${addressLines(site).map(esc).join("<br>")}</address></div>
    </div>
    <h2>Help with an order</h2>
    <p>Please include your order reference, which starts with DN- and is shown on your order page. If you don't have it, write from the email address you used at checkout. If a file won't open, looks incomplete or doesn't match its description, tell us which file and what you see, and we'll put it right. The <a href="/refunds/">Refund Policy</a> and <a href="/delivery/">Digital Delivery Policy</a> explain what happens next.</p>
    <h2>Billing questions</h2>
    <p>Charges appear on card statements as ${esc(site.statementDescriptor || site.brand)}. If you don't recognize a charge or think you've been charged twice, contact us first. We can usually sort it out faster than a bank dispute.</p>
    <h2>Privacy requests</h2>
    <p>To access, correct or delete the personal information we hold about you, email ${mailto(site)}. Our <a href="/privacy/">Privacy Policy</a> explains your rights.</p>
    <h2>Business details</h2>
    <p>${esc(site.brand)}${site.legalName ? ` (${esc(site.legalName)})` : ""}, ${esc(addressLines(site).join(", "))}. Website: ${esc(site.domain)}.</p>
  </div>
</div>`;
  return {
    path: "/contact/",
    title: "Contact",
    description: `Contact ${site.brand}: email ${site.email}, phone ${site.phoneDisplay}, mailing address ${addressLines(site).join(", ")}.`,
    nav: "/contact/",
    body,
    jsonLd: [organizationJsonLd(site)],
  };
}

export function notFound() {
  return {
    path: "/404.html",
    file: "404.html",
    title: "Page not found",
    description: "The page you were looking for could not be found.",
    noindex: true,
    body: `<section class="section"><div class="container narrow"><h1>Page not found</h1><p class="lead">That page doesn't exist or has moved.</p><p><a class="btn" href="/shop/">Browse Templates</a></p></div></section>`,
  };
}
