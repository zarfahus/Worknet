// Page definitions. Each function returns { path, title, description, body, ... } for layout().
import { addressLines, esc, fileSize, icons, listJoin, money, pageHeader, productCard } from "./ui.mjs";

const FORMAT_HELP = {
  PDF: "Printable PDF (A4). Print at home, or fill it in on a tablet or computer with any PDF app that supports annotations.",
  DOCX: "Editable Word document. Opens in Microsoft Word, Google Docs, LibreOffice Writer and Apple Pages.",
  XLSX: "Editable spreadsheet with drop-down lists and automatic dates. Opens in Microsoft Excel, Google Sheets, LibreOffice Calc and Apple Numbers.",
};

export function faqItems(site) {
  return [
    {
      q: "What do I receive?",
      a: `<p>You receive the digital files listed on the product page: printable PDF templates and editable DOCX and/or XLSX files, depending on the product. Every order also includes a ZIP archive with all of the product's files. WorkNest Studio sells digital products only; nothing physical is shipped.</p>`,
    },
    {
      q: "When will I receive my files?",
      a: `<p>As soon as your payment is confirmed you are taken to your order page, where each file can be downloaded straight away. Card payments are usually confirmed within seconds. Some payment methods take longer to confirm; in that case your order page shows that payment is processing and the downloads appear once it is confirmed.</p><p>You can return to your order page at any time using the same link, so we recommend bookmarking it. See our <a href="/delivery/">Digital Delivery Policy</a> for details.</p>`,
    },
    {
      q: "Are the files editable?",
      a: `<p>Yes. DOCX files can be edited in any word processor and XLSX files in any spreadsheet app, so you can rename headings, add rows or remove sections. PDF files are designed for printing or for writing on with a PDF annotation app; they are not intended for editing the layout.</p>`,
    },
    {
      q: "Do I need special software?",
      a: `<p>No. PDFs open in any web browser or free PDF reader. DOCX files work in Microsoft Word, Google Docs, LibreOffice Writer (free) and Apple Pages. XLSX files work in Microsoft Excel, Google Sheets, LibreOffice Calc (free) and Apple Numbers. The templates do not use macros or add-ons.</p>`,
    },
    {
      q: "Can I use the templates commercially?",
      a: `<p>You can use the templates in your own business: to plan your work, run meetings, organise projects and manage your operations, including work you do for your own clients. What you can't do is resell, share or redistribute the template files themselves, or publish them (or close copies of them) as your own templates. The full licence is in our <a href="/terms/#license">Terms of Service</a>.</p>`,
    },
    {
      q: "Do you offer refunds?",
      a: `<p>If a file is defective, will not open, is corrupted or is materially different from its description, contact us and we will put it right, which can include a replacement file or a refund. Because our products are delivered digitally, a refund may not be available simply because you changed your mind once the download has been made available, where the law allows this. Your statutory consumer rights are not affected. Read the full <a href="/refunds/">Refund Policy</a>.</p>`,
    },
    {
      q: "How can I contact support?",
      a: `<p>Email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> and include your order reference (shown on your order page) or the email address you used at checkout, so we can find your purchase quickly. You can also call <a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phoneDisplay)}</a> or write to us at ${esc(addressLines(site).join(", "))}.</p>`,
    },
  ];
}

const faqHtml = (items) =>
  `<div class="faq">${items
    .map((it) => `<details><summary>${esc(it.q)}</summary><div class="answer">${it.a}</div></details>`)
    .join("")}</div>`;

const faqJsonLd = (items) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((it) => ({
    "@type": "Question",
    name: it.q,
    acceptedAnswer: { "@type": "Answer", text: it.a.replace(/<[^>]+>/g, "") },
  })),
});

export function organizationJsonLd(site) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: site.brand,
    url: site.url,
    logo: `${site.url}/assets/brand/icon-512.png`,
    email: site.email,
    telephone: site.phone.replace(/\s/g, ""),
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
  const { site, catalog } = ctx;
  const items = faqItems(site);
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div>
      <span class="eyebrow">Digital productivity templates</span>
      <h1>Simple templates for better organized work.</h1>
      <p class="lead">Download practical planning and workflow templates designed to make everyday work easier.</p>
      <div class="hero-actions"><a class="btn" href="/shop/">Browse Templates</a><a class="btn btn-secondary" href="#how-it-works">How it works</a></div>
      <p class="hero-note">Printable PDF, editable DOCX and XLSX files · One-time purchase from ${money(Math.min(...catalog.products.map((p) => p.price)))}</p>
    </div>
    <img class="hero-art" src="/assets/img/hero.svg" width="560" height="460" alt="Illustration of WorkNest Studio planner, tracker and calendar template pages">
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head center center">
      <h2>Practical tools. Clear organization. Instant access.</h2>
      <p class="muted">${esc(site.description)}</p>
    </div>
    <div class="benefits">
      <div class="benefit"><div class="benefit-icon">${icons.download}</div><h3>Instant digital delivery</h3><p>Your files are ready to download on your order page as soon as your payment is confirmed. Nothing to wait for, nothing shipped.</p></div>
      <div class="benefit"><div class="benefit-icon">${icons.edit}</div><h3>Editable, practical templates</h3><p>Print-ready PDFs plus editable Word and spreadsheet files you can adapt to the way you work, in the apps you already use.</p></div>
      <div class="benefit"><div class="benefit-icon">${icons.receipt}</div><h3>One-time purchases</h3><p>Pay once for each product and keep the files. No subscriptions, no accounts to manage and no recurring charges.</p></div>
    </div>
  </div>
</section>

<section class="section section-alt" id="templates">
  <div class="container">
    <div class="section-head">
      <h2>Featured templates</h2>
      <p class="muted">Three focused templates at ${money(1299)} and three larger toolkits at ${money(1999)}. Every product page shows exactly which files you receive.</p>
    </div>
    <div class="product-grid">${catalog.products.map((p) => productCard(ctx, p)).join("")}</div>
  </div>
</section>

<section class="section" id="how-it-works">
  <div class="container">
    <div class="section-head"><h2>How it works</h2></div>
    <ol class="steps">
      <li><h3>Choose a template</h3><p>Browse the shop and check the included pages, formats and files on each product page.</p></li>
      <li><h3>Complete secure checkout</h3><p>Review your order and pay on our payment processor's secure payment page.</p></li>
      <li><h3>Receive your digital files</h3><p>Download each file, or everything as one ZIP, from your order page.</p></li>
      <li><h3>Start using them immediately</h3><p>Print the PDFs or open the editable files in Word, Excel, Google Docs or similar apps.</p></li>
    </ol>
  </div>
</section>

<section class="section section-alt" id="faq">
  <div class="container narrow">
    <div class="section-head"><h2>Frequently asked questions</h2></div>
    ${faqHtml(items)}
    <p class="small muted">More questions? See the <a href="/faq/">full FAQ</a> or <a href="/contact/">contact us</a>.</p>
  </div>
</section>`;
  return {
    path: "/",
    title: "Productivity Templates for Planning, Meetings & Workflows",
    description:
      "Practical digital productivity templates: weekly planner, meeting notes and action tracker, content planning calendar and workflow toolkits. Printable PDF and editable DOCX/XLSX. One-time purchase.",
    nav: "/",
    body,
    jsonLd: [
      organizationJsonLd(site),
      { "@context": "https://schema.org", "@type": "WebSite", name: site.brand, url: site.url },
      faqJsonLd(items),
    ],
  };
}

export function shop(ctx) {
  const { catalog } = ctx;
  const singles = catalog.products.filter((p) => p.price === 1299);
  const bundles = catalog.products.filter((p) => p.price === 1999);
  const body = `
${pageHeader({
  title: "Templates",
  intro: "Printable and editable templates for planning, meetings, content and day-to-day operations. Each product is a one-time purchase delivered as digital files.",
  crumbs: [["/", "Home"], ["/shop/", "Shop"]],
})}
<section class="section-tight">
  <div class="container">
    <div class="group">
      <div class="group-title"><h2>Single templates</h2><span class="muted small">${money(1299)} each</span></div>
      <div class="product-grid">${singles.map((p) => productCard(ctx, p)).join("")}</div>
    </div>
    <div class="group">
      <div class="group-title"><h2>Toolkits &amp; bundles</h2><span class="muted small">${money(1999)} each</span></div>
      <div class="product-grid">${bundles.map((p) => productCard(ctx, p)).join("")}</div>
    </div>
    <p class="small muted">The Complete Productivity Toolkit includes the Weekly Focus Planner and the Meeting Notes &amp; Action Tracker, so you don't need to buy those separately if you choose the toolkit.</p>
  </div>
</section>`;
  return {
    path: "/shop/",
    title: "Shop Productivity Templates",
    description:
      "Shop digital productivity templates: weekly planner template, meeting notes template, content planning calendar, workflow templates and productivity toolkits. Instant download.",
    nav: "/shop/",
    body,
  };
}

export function product(ctx, p) {
  const { site, catalog, manifest } = ctx;
  const m = manifest.products[p.slug];
  const files = m.files.map((id) => manifest.files[id]);
  const zip = manifest.files[m.zip];
  const bySlug = Object.fromEntries(catalog.products.map((x) => [x.slug, x]));
  const pdfPages = files.filter((f) => f.format === "PDF").reduce((n, f) => n + f.pages, 0);
  const previews = m.previews;

  const notices = [];
  if (p.contains?.length) {
    notices.push(
      `<div class="notice info">This toolkit already includes the ${listJoin(
        p.contains.map((s) => `<a href="/products/${s}/">${esc(bySlug[s].name)}</a>`)
      )}, so there is no need to buy ${p.contains.length > 1 ? "them" : "it"} separately.</div>`
    );
  }
  if (p.bundledIn?.length) {
    notices.push(
      `<div class="notice">Also included in the ${listJoin(
        p.bundledIn.map((s) => `<a href="/products/${s}/">${esc(bySlug[s].name)}</a> (${money(bySlug[s].price)})`)
      )}.</div>`
    );
  }

  const gallery = `
<div class="gallery">
  <div class="gallery-main"><img id="gallery-main" src="${previews[0].src}" width="${previews[0].width}" height="${previews[0].height}" alt="${esc(p.name)}, page ${previews[0].page} preview"></div>
  <div class="gallery-thumbs" role="list">${previews
    .map(
      (pv, i) =>
        `<button type="button" role="listitem" data-src="${pv.src}" data-alt="${esc(p.name)}, page ${pv.page} preview"${
          i === 0 ? ' aria-current="true"' : ""
        } aria-label="Show page ${pv.page}"><img src="${pv.src}" width="${pv.width}" height="${pv.height}" alt="" loading="lazy"></button>`
    )
    .join("")}</div>
  <p class="gallery-note">Previews of actual pages from the ${esc(p.name)} files.</p>
</div>`;

  const formatRows = p.formats
    .map((f) => `<li><strong>${f}</strong> — ${esc(FORMAT_HELP[f])}</li>`)
    .join("");

  const fileRows = files
    .map(
      (f) =>
        `<tr><td><span class="file-name">${esc(f.filename)}</span><br><span class="small muted">${esc(f.label)}</span></td><td>${f.format}</td><td class="num">${fileSize(f.bytes)}</td></tr>`
    )
    .join("");

  const body = `
<div class="container">
  <div class="product-layout">
    ${gallery}
    <div class="buy-box">
      <nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="/">Home</a></li><li><a href="/shop/">Shop</a></li><li aria-current="page">${esc(p.name)}</li></ol></nav>
      <h1>${esc(p.name)}</h1>
      <p>${esc(p.description)}</p>
      <span class="price">${money(p.price)}</span>
      <p class="price-note">One-time purchase · Digital download · Price in euros; any applicable tax is shown at checkout before you pay</p>
      <div class="formats">${p.formats.map((f) => `<span class="tag">${f}</span>`).join("")}</div>
      <div class="buy-actions">
        <button class="btn" type="button" data-buy-now="${p.slug}">Buy now</button>
        <button class="btn btn-secondary" type="button" data-add-to-cart="${p.slug}">Add to cart</button>
      </div>
      <p class="small muted hidden" data-cart-feedback="${p.slug}" role="status"></p>
      <div class="stack">${notices.join("")}</div>
      <ul class="assurances">
        <li>${icons.download}<span>Instant digital delivery: download on your order page as soon as payment is confirmed. <a href="/delivery/">Delivery policy</a></span></li>
        <li>${icons.once}<span>One-time payment. No subscription and no recurring charges.</span></li>
        <li>${icons.lock}<span>Secure checkout through our payment processor. We never see or store your full card number.</span></li>
        <li>${icons.info}<span>Problem with a file? We'll fix it or refund it. <a href="/refunds/">Refund policy</a></span></li>
      </ul>
    </div>
  </div>

  <div class="detail-grid">
    <section class="panel">
      <h2>What's included</h2>
      <ul class="check-list">${p.includes.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      ${pdfPages ? `<p class="small muted mt-0">${pdfPages} printable PDF pages in total${files.some((f) => f.format === "DOCX") ? ", plus editable versions" : ""}.</p>` : ""}
    </section>
    <section class="panel">
      <h2>Formats</h2>
      <ul>${formatRows}</ul>
    </section>
    <section class="panel">
      <h2>Files you'll receive</h2>
      <table class="file-table">
        <thead><tr><th>File</th><th>Format</th><th class="num">Size</th></tr></thead>
        <tbody>${fileRows}<tr><td><span class="file-name">${esc(zip.filename)}</span><br><span class="small muted">All of the above in one ZIP archive</span></td><td>ZIP</td><td class="num">${fileSize(zip.bytes)}</td></tr></tbody>
      </table>
    </section>
    <section class="panel">
      <h2>Licence &amp; good to know</h2>
      <ul>
        <li>Use and edit the templates for your own personal or internal business purposes, including organising work you do for clients.</li>
        <li>Please don't resell, share or redistribute the files or publish them as templates. <a href="/terms/#license">Full licence</a></li>
        <li>PDF pages are A4; choose “Fit to page” to print on US Letter.</li>
        <li>These are organisational templates, not legal, financial, accounting, tax or other professional advice.</li>
        <li>Questions before buying? Email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</li>
      </ul>
    </section>
  </div>
</div>`;

  return {
    path: `/products/${p.slug}/`,
    title: p.seo.title,
    description: p.seo.description,
    nav: "/shop/",
    ogType: "product",
    ogImage: m.ogImage,
    scripts: [],
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
          itemCondition: "https://schema.org/NewCondition",
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
    products: catalog.products.map((p) => ({
      slug: p.slug,
      name: p.name,
      price: p.price,
      formats: p.formats,
      contains: p.contains || [],
      image: manifest.products[p.slug].image,
    })),
  };
  const body = `
${pageHeader({ title: "Cart & checkout", crumbs: [["/", "Home"], ["/checkout/", "Checkout"]] })}
<div class="container">
  <div class="checkout-layout">
    <section aria-labelledby="order-heading">
      <div class="seller">${icons.receipt}<span>Seller: <strong>${esc(site.brand)}</strong> · Digital products</span></div>
      <h2 id="order-heading" class="visually-hidden">Your order</h2>
      <noscript><div class="notice warn">Checkout needs JavaScript to read your cart. Please enable JavaScript, or email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> and we will help you place your order.</div></noscript>
      <div id="cart-empty" class="empty-state hidden">
        <h3>Your cart is empty</h3>
        <p class="muted">Browse the shop and add a template to get started.</p>
        <a class="btn" href="/shop/">Browse Templates</a>
      </div>
      <ul id="cart-items" class="cart-items" aria-live="polite"></ul>
      <div id="cart-notices" class="stack"></div>
      <p class="small muted">Prices are in euros (EUR). Each product is a one-time purchase of digital files; nothing is shipped.</p>
    </section>

    <aside class="panel summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Order summary</h2>
      <div class="summary-rows" id="summary-rows">
        <div class="summary-row"><span>Subtotal</span><span id="summary-subtotal">${money(0)}</span></div>
        <div class="summary-row"><span>Tax</span><span class="muted small">Calculated on the payment page before you pay, where applicable</span></div>
        <div class="summary-row total"><span>Total before tax</span><span id="summary-total">${money(0)}</span></div>
      </div>
      <ul class="facts">
        <li>${icons.once}<span><strong>One-time purchase.</strong> You are charged once. No subscription, no recurring billing and no add-ons.</span></li>
        <li>${icons.download}<span><strong>Digital delivery.</strong> No physical goods are shipped. Your files are available to download on your order page as soon as your payment is confirmed.</span></li>
        <li>${icons.lock}<span><strong>Secure payment.</strong> You will enter your payment details on our payment processor's secure page. ${esc(site.brand)} does not receive or store your full card number.</span></li>
      </ul>
      <form id="checkout-form" novalidate>
        <div class="consent">
          <label><input type="checkbox" name="acceptTerms" id="accept-terms" required><span>I have read and agree to the <a href="/terms/" target="_blank" rel="noopener">Terms of Service</a> and the <a href="/refunds/" target="_blank" rel="noopener">Refund Policy</a>, and I have read the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy</a>.</span></label>
          <label><input type="checkbox" name="digitalConsent" id="digital-consent" required><span>I ask for immediate access to the digital files after payment. I understand that, where the law allows, I lose my right to withdraw from the purchase once the files are made available to me. This does not affect my rights if a file is defective or not as described.</span></label>
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
    title: "Checkout",
    description: `Review your ${site.brand} order: product names, prices, one-time payment and digital delivery details.`,
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
    <noscript><div class="notice warn">Your downloads are loaded with JavaScript. Please enable JavaScript, or email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> with your order details and we will send your files.</div></noscript>
    <p id="order-loading" class="muted">Loading your order…</p>
  </div>
</div>`;
  return {
    path: "/order/",
    title: "Your order",
    description: `Download the files from your ${site.brand} order.`,
    noindex: true,
    scripts: ["/assets/js/order.js"],
    body,
  };
}

export function about(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({ title: `About ${site.brand}`, intro: esc(site.tagline), crumbs: [["/", "Home"], ["/about/", "About"]] })}
<div class="container narrow">
  <div class="prose">
    <p>${esc(site.brand)} develops original digital productivity resources focused on planning, organization and workflow management.</p>
    <p>${esc(site.description)}</p>

    <h2>What we make</h2>
    <p>Our products are templates: structured pages and spreadsheets that give a clear shape to recurring work, such as planning a week, running a meeting, scheduling content or documenting how a task gets done. Each product is created by ${esc(site.brand)} and delivered as printable PDF files together with editable DOCX and/or XLSX versions.</p>
    <ul>
      <li><a href="/products/weekly-focus-planner/">Weekly Focus Planner</a>: weekly and daily planning with priorities, reviews and goals.</li>
      <li><a href="/products/meeting-notes-action-tracker/">Meeting Notes &amp; Action Tracker</a>: agendas, notes, decisions and follow-ups.</li>
      <li><a href="/products/content-planning-calendar/">Content Planning Calendar</a>: a 90-day system for content and campaigns.</li>
      <li><a href="/products/complete-productivity-toolkit/">Complete Productivity Toolkit</a>, <a href="/products/small-business-workflow-toolkit/">Small Business Workflow Toolkit</a> and <a href="/products/creator-planning-bundle/">Creator Planning Bundle</a>: larger collections for specific kinds of work.</li>
    </ul>

    <h2>How we approach our templates</h2>
    <ul>
      <li><strong>Practical first.</strong> Every page has a clear job and short instructions, with enough space to actually write.</li>
      <li><strong>Works with tools you already have.</strong> No special software, no accounts and no macros: just files that open in common apps.</li>
      <li><strong>Clear pricing.</strong> Each product is a one-time purchase. There are no subscriptions or recurring charges.</li>
      <li><strong>Transparent licensing.</strong> You can use the templates in your own work and business; you just can't resell or redistribute them.</li>
    </ul>

    <h2>What our templates are not</h2>
    <p>Our templates are organizational tools. They do not provide legal, financial, accounting, tax, investment, medical or other professional advice, and they do not replace advice from a qualified professional.</p>

    <h2>Business details</h2>
    <p>${esc(site.brand)}${site.legalName ? ` is a trading name of ${esc(site.legalName)}` : ""}<br>
    <address>${addressLines(site).map(esc).join("<br>")}</address></p>
    <p>Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br>Phone: <a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phoneDisplay)}</a></p>
  </div>
</div>`;
  return {
    path: "/about/",
    title: "About",
    description: `${site.brand} develops original digital productivity templates for planning, meetings, projects, content and workflows.`,
    nav: "/about/",
    body,
  };
}

export function faq(ctx) {
  const { site } = ctx;
  const items = faqItems(site).concat([
    {
      q: "Is this a subscription?",
      a: `<p>No. Every product is a one-time purchase. You are charged once at checkout and there are no recurring payments.</p>`,
    },
    {
      q: "Do the toolkits include the single templates?",
      a: `<p>The <a href="/products/complete-productivity-toolkit/">Complete Productivity Toolkit</a> includes the full Weekly Focus Planner and the full Meeting Notes &amp; Action Tracker, plus four additional planners and a spreadsheet workbook. The Small Business Workflow Toolkit and the Creator Planning Bundle are separate collections with their own templates.</p>`,
    },
    {
      q: "What page size are the PDFs?",
      a: `<p>A4. To print on US Letter paper, choose “Fit to page” or “Scale to fit” in your print settings. The DOCX versions can be switched to Letter size in your word processor.</p>`,
    },
    {
      q: "I lost my download link. What should I do?",
      a: `<p>Email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a> from the address you used at checkout, or include your order reference, and we will send you a link to your order page again.</p>`,
    },
    {
      q: "Is my payment information safe?",
      a: `<p>Payments are handled on the secure payment page of our payment processor. ${esc(site.brand)} never receives or stores your full card number. See our <a href="/privacy/">Privacy Policy</a> for what information we do receive.</p>`,
    },
  ]);
  const body = `
${pageHeader({ title: "Frequently asked questions", intro: "Answers about files, delivery, licensing, payments and refunds.", crumbs: [["/", "Home"], ["/faq/", "FAQ"]] })}
<div class="container narrow"><div class="prose">${faqHtml(items)}
<p class="small muted">Can't find what you need? <a href="/contact/">Contact us</a>.</p></div></div>`;
  return {
    path: "/faq/",
    title: "FAQ",
    description: `Frequently asked questions about ${site.brand} templates: what you receive, delivery, editable files, software, commercial use, refunds and support.`,
    nav: "/faq/",
    body,
    jsonLd: [faqJsonLd(items)],
  };
}

export function contact(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({ title: "Contact", intro: "Questions about a template, an order or a download? We're happy to help.", crumbs: [["/", "Home"], ["/contact/", "Contact"]] })}
<div class="container">
  <div class="prose">
    <div class="contact-grid">
      <div class="contact-card"><h2>Email support</h2><p><a href="mailto:${esc(site.email)}">${esc(site.email)}</a></p><p class="small muted">Best for orders and downloads. Please include your order reference.</p></div>
      <div class="contact-card"><h2>Phone</h2><p><a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phoneDisplay)}</a></p><p class="small muted">If we can't answer, leave a message or email us.</p></div>
      <div class="contact-card"><h2>Mailing address</h2><address>${esc(site.brand)}<br>${addressLines(site).map(esc).join("<br>")}</address></div>
    </div>
    <div class="narrow">
      <h2>Getting help with an order</h2>
      <p>Your order reference is shown on your order page. If you don't have it, write from the email address you used at checkout. If a file won't open, seems incomplete or doesn't match its description, tell us which product and file it is and what you see, and we will put it right. See the <a href="/refunds/">Refund Policy</a> and the <a href="/delivery/">Digital Delivery Policy</a> for details.</p>
      <h2>Privacy requests</h2>
      <p>To access, correct or delete personal information we hold about you, email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>. Our <a href="/privacy/">Privacy Policy</a> explains your rights.</p>
    </div>
  </div>
</div>`;
  return {
    path: "/contact/",
    title: "Contact",
    description: `Contact ${site.brand}: email ${site.email}, phone ${site.phoneDisplay}, mailing address in ${site.address.city}, ${site.address.region}.`,
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
    body: `<section class="section"><div class="container narrow center"><h1>Page not found</h1><p class="lead">The page you were looking for doesn't exist or has moved.</p><p><a class="btn" href="/shop/">Browse Templates</a></p></div></section>`,
  };
}
