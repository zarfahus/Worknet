// Store pages. Each function returns { path, title, description, body, ... } for layout().
import {
  addressInline,
  addressLines,
  checkList,
  crumbs,
  esc,
  faqJsonLd,
  faqList,
  kitCard,
  listJoin,
  mail,
  money,
  organizationJsonLd,
  pageHeader,
  phone,
  priceHtml,
  sellerName,
  tick,
} from "./ui.mjs";

const bySlug = (ctx) => Object.fromEntries(ctx.products.products.map((p) => [p.slug, p]));

// ---------------------------------------------------------------------------------------
// FAQ content, shared by the FAQ page, the home page and the product pages.

export function faqGroups(ctx) {
  const { site } = ctx;
  const p = bySlug(ctx);
  const planner = p["weekly-focus-planner"];
  const bundle = p["project-workflow-bundle"];
  return [
    {
      title: "The products",
      items: [
        {
          id: "what-do-i-get",
          q: "What exactly do I get?",
          a: `<p>Downloadable files. Nothing is posted to you.</p><ul><li><strong>${esc(planner.name)}</strong> (${money(planner.price)}): two PDF files with the same 7 pages, one sized for A4 paper and one for US Letter.</li><li><strong>${esc(bundle.name)}</strong> (${money(bundle.price)}): the complete planner, a PDF of project printables (monthly overview, 12-week timeline and a task checklist) in both paper sizes, two editable Excel spreadsheets (a project tracker and a content calendar) and a PDF setup guide.</li></ul><p>Each product page lists every file and every page.</p>`,
        },
        {
          id: "difference",
          q: "What's the difference between the planner and the bundle?",
          a: `<p>The bundle includes the whole planner, then adds tools for managing projects and a publishing schedule: the project tracker and content calendar spreadsheets, the printables and a setup guide. You don't need to buy both.</p><p>If you mainly want to plan your own week on paper, the planner is enough. If you also track projects, deadlines or content, the bundle covers that too. If you buy the planner and later want the bundle, the bundle is a separate purchase at its normal price.</p>`,
        },
        {
          q: "Are the planner pages dated?",
          a: `<p>No. Every page is undated, so you can start any week and print only the pages you need.</p>`,
        },
        {
          q: "Which paper size should I print on?",
          a: `<p>Both sizes come with your order. Use the A4 files on A4 paper (common outside North America) and the US Letter files on 8.5 × 11 in paper. Print at “Actual size” or “Scale 100%”.</p>`,
        },
        {
          q: "Can I edit the files?",
          a: `<p>The spreadsheets are fully editable: rename columns, add your team's names, change the drop-down options. The PDFs are made for printing or for writing on with a tablet app that supports PDF annotation. Their layout and printed text aren't editable.</p>`,
        },
        {
          q: "Will these make me more productive?",
          a: `<p>We can't promise that, and we'd be wary of anyone who does. These are organizing tools: they give your plans a clear place to live. How much they help depends on how you use them.</p>`,
        },
      ],
    },
    {
      title: "Buying and payment",
      items: [
        ...(!site.checkoutOpen
          ? [
              {
                id: "can-i-buy",
                q: "Can I buy right now?",
                a: `<p>Not yet. Online checkout isn't switched on, so we can't take payments on this site at the moment. The product and order pages already show the full prices, terms and order details, so you can see exactly what you'd be agreeing to. Questions in the meantime are welcome at ${mail(site)}.</p>`,
              },
            ]
          : []),
        {
          q: "How much does it cost, and in which currency?",
          a: `<p>The ${esc(planner.name)} costs ${money(planner.price)} and the ${esc(bundle.name)} costs ${money(bundle.price)}. You're charged in US dollars. If your card is in another currency, your bank converts the amount and may add a foreign transaction fee; that fee comes from your bank, not from us.</p>`,
        },
        {
          id: "tax",
          q: "Is tax added at checkout?",
          a: `<p>No. Prices include any sales tax, VAT or GST that we have to collect, so the price on the product page is the total you pay. Nothing is added at checkout.</p>`,
        },
        {
          q: "Is this a subscription?",
          a: `<p>No. Each product is a single payment. There are no subscriptions, trials, renewals or add-ons, and we never charge your card again.</p>`,
        },
        {
          q: "How do I pay, and is it secure?",
          a: `<p>Payment happens on Stripe's secure checkout page. You can pay by ${esc(listJoin(site.acceptedCards, "or"))} card, and Stripe may offer other options depending on where you are. Your card details go straight to Stripe, which is certified to PCI DSS Level 1, the highest standard for card payments. We never see or store your full card number.</p>`,
        },
        {
          q: "What will the charge look like on my statement?",
          a: `<p>It appears as <strong>${esc(site.statementDescriptor)}</strong>. If you see a charge you don't recognize, email ${mail(site)} and we'll look into it.</p>`,
        },
        { q: "Do I need to create an account?", a: `<p>No. You only need an email address so we can send your download link and receipt.</p>` },
      ],
    },
    {
      title: "Delivery and downloads",
      items: [
        {
          id: "delivery",
          q: "How and when do I get my files?",
          a: `<p>As soon as your payment is confirmed, which normally takes a few seconds, you'll see a download page, and we'll email you a download link and an order confirmation. Stripe emails your payment receipt separately. Nothing is shipped.</p>`,
        },
        {
          q: "How long does the download link work?",
          a: `<p>For ${site.downloadLinkDays} days, and you can download as many times as you need during that time. Please save the files somewhere safe. If the link expires, email us within ${site.redownloadMonths} months of your purchase and we'll send a new one free of charge.</p>`,
        },
        {
          q: "I can't find the email with my link.",
          a: `<p>Check your spam or promotions folder and search for “${esc(site.brand)}”. If it isn't there, email ${mail(site)} from the address you used at checkout, or tell us that address, and we'll resend it. The <a href="/download-help/">download help page</a> covers other problems.</p>`,
        },
      ],
    },
    {
      title: "Refunds and cancellations",
      items: [
        {
          id: "refunds",
          q: "Can I get a refund?",
          a: `<p>Yes, in these cases:</p><ul><li>a file is faulty, won't open, is incomplete or isn't as described, and we can't fix it;</li><li>you were charged twice or charged the wrong amount;</li><li>you haven't downloaded any file yet and ask within ${site.unusedRefundDays} days of buying, for any reason.</li></ul><p>Once you've downloaded the files, we don't refund a simple change of mind, because the files can't be returned. This never limits your legal rights. The <a href="/refund-policy/">Delivery and Refund Policy</a> has the details.</p>`,
        },
        {
          id: "withdrawal",
          q: "I'm in the EU or UK. What about my 14-day right to cancel?",
          a: `<p>For digital files, the law lets that right end once the download is made available, but only if you agree to it. Before you pay, we ask you to tick a separate box to agree to immediate delivery. If you'd rather keep your 14-day right, don't download anything: you can still cancel within ${site.unusedRefundDays} days for a full refund under our own policy. Your rights for faulty or misdescribed files aren't affected either way.</p>`,
        },
        {
          q: "Can I cancel an order?",
          a: `<p>There's nothing to cancel after a purchase because there's no subscription. If you change your mind before downloading anything, ask within ${site.unusedRefundDays} days and we'll refund you in full.</p>`,
        },
      ],
    },
    {
      title: "Using the files",
      items: [
        {
          id: "license",
          q: "Can I use the templates for work, or with my team?",
          a: `<p>Yes. You can use them for yourself and for internal work in your own business or organization, including by the people who work there. You can also share filled-in copies, such as a project plan you send to a client. See the license in our <a href="/terms/#license">Terms and Conditions</a>.</p>`,
        },
        {
          q: "Can I share or resell the templates?",
          a: `<p>No. Please don't share the blank templates outside your organization, upload them anywhere for others to download, resell them or include them in something you sell or give away.</p>`,
        },
        {
          id: "apps",
          q: "Which apps open the spreadsheets?",
          a: `<p>Microsoft Excel 2016 or later, Microsoft 365, Excel for the web, Google Sheets and LibreOffice Calc 7 or later all support every feature. Apple Numbers opens the files and keeps the formulas, but it doesn't support the color rules, so the overdue highlights and timeline bars won't show. The files contain no macros.</p>`,
        },
      ],
    },
    {
      title: "Privacy and support",
      items: [
        {
          q: "What do you do with my information?",
          a: `<p>We use it only to process your order, deliver your files, handle support and keep the records the law requires. We don't use analytics or advertising trackers, we don't sell personal information and we don't send marketing emails. The <a href="/privacy/">Privacy Policy</a> has the full details.</p>`,
        },
        {
          q: "How do I contact you?",
          a: `<p>Email ${mail(site)} or call ${phone(site)}. We reply to emails within ${site.replyBusinessDays} business days (Monday to Friday, ${esc(site.timeZoneLabel)}). The <a href="/contact/">contact page</a> lists everything that helps us answer quickly.</p>`,
        },
      ],
    },
  ];
}

const allFaq = (ctx) => faqGroups(ctx).flatMap((g) => g.items);
const pickFaq = (ctx, ids) => allFaq(ctx).filter((i) => ids.includes(i.id)).sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));

function checkoutNotice(site, where) {
  if (site.checkoutOpen) return "";
  if (where === "buy") {
    return `<div class="notice notice-soon" role="note"><p><strong>Checkout opens soon.</strong> Online payment isn't switched on yet, so this kit can't be bought today. You can still review the full order details below.</p></div>`;
  }
  return `<div class="notice notice-soon" role="note"><p><strong>Checkout isn't open yet.</strong> We haven't switched on online payments, so this page can't take an order and nothing here will charge you. It shows exactly what your order will look like once checkout opens. Questions in the meantime: ${mail(site)}.</p></div>`;
}

// ---------------------------------------------------------------------------------------

export function home(ctx) {
  const { site, products, previews } = ctx;
  const p = bySlug(ctx);
  const planner = p["weekly-focus-planner"];
  const bundle = p["project-workflow-bundle"];
  const look = [previews.previews["weekly-focus-planner"][0], previews.previews["weekly-focus-planner"][1], previews.previews["project-workflow-bundle"][0]];
  const faq = pickFaq(ctx, ["difference", "delivery", "tax", "refunds"]);
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-text">
      <h1>Plan your week on paper. Keep your projects in <span class="mark">one spreadsheet</span>.</h1>
      <p class="lead">${esc(site.brand)} sells two downloadable kits: an undated Weekly Focus Planner and a Project Workflow Bundle with editable spreadsheets. You pay once, in US dollars, and download the files. Nothing is shipped and nothing renews.</p>
      <div class="hero-actions">
        <a class="btn" href="/shop/">See both kits</a>
        <a class="btn btn-ghost" href="/how-it-works/">How buying works</a>
      </div>
      <ul class="hero-prices" aria-label="Prices">
        <li><a href="/products/${planner.slug}/">${esc(planner.name)}</a> ${priceHtml(planner.price)}</li>
        <li><a href="/products/${bundle.slug}/">${esc(bundle.name)}</a> ${priceHtml(bundle.price)}</li>
      </ul>
    </div>
    <figure class="hero-figure">
      <img src="/assets/img/hero.webp" width="1200" height="900" alt="Three printed pages from the Weekly Focus Planner: the daily priorities page, the weekly plan and the weekly review" fetchpriority="high">
      <figcaption>Pages from the Weekly Focus Planner, printed on A4.</figcaption>
    </figure>
  </div>
</section>

<section class="section" aria-labelledby="kits-heading">
  <div class="container">
    <div class="section-head">
      <h2 id="kits-heading">The two kits</h2>
      <p>That's the whole shop. The bundle already contains the full planner, so you only ever need one of them.</p>
    </div>
    <div class="kit-grid">${products.products.map((x) => kitCard(ctx, x)).join("")}</div>
  </div>
</section>

<section class="section band" aria-labelledby="look-heading">
  <div class="container">
    <div class="section-head">
      <h2 id="look-heading">What the pages look like</h2>
      <p>These images are made from the actual files, not mock-ups. Lines are light grey so they print clearly on a home printer, in color or black and white.</p>
    </div>
    <div class="look-grid">${look
      .map(
        (img) =>
          `<figure class="page-shot"><img src="${img.src}" width="${img.width}" height="${img.height}" alt="${esc(img.caption)}" loading="lazy"><figcaption>${esc(img.caption)}</figcaption></figure>`
      )
      .join("")}</div>
  </div>
</section>

<section class="section" aria-labelledby="facts-heading">
  <div class="container">
    <div class="section-head"><h2 id="facts-heading">Before you buy</h2><p>The practical details, in one place.</p></div>
    <dl class="fact-grid">
      <div><dt>What you get</dt><dd>PDF files in A4 and US Letter sizes. The bundle adds two Excel spreadsheets (XLSX) and a setup guide.</dd></div>
      <div><dt>What you need</dt><dd>Any PDF reader or a printer. For the spreadsheets: Excel, Google Sheets or LibreOffice (Apple Numbers works with limits).</dd></div>
      <div><dt>Delivery</dt><dd>A download page and an emailed link as soon as payment is confirmed. The link works for ${site.downloadLinkDays} days.</dd></div>
      <div><dt>Price</dt><dd>${money(planner.price)} or ${money(bundle.price)}, charged once. Taxes are included, so nothing is added at checkout.</dd></div>
      <div><dt>Refunds</dt><dd>Faulty or not as described? We fix it or refund you. Haven't downloaded yet? Full refund within ${site.unusedRefundDays} days. <a href="/refund-policy/">Refund policy</a></dd></div>
      <div><dt>Help</dt><dd>${mail(site)} or ${phone(site)}. Email replies within ${site.replyBusinessDays} business days.</dd></div>
    </dl>
  </div>
</section>

<section class="section band" aria-labelledby="how-heading">
  <div class="container">
    <div class="section-head"><h2 id="how-heading">How buying works</h2></div>
    <ol class="steps">
      <li><h3>Choose a kit</h3><p>Each product page lists every file and page, with previews.</p></li>
      <li><h3>Review your order</h3><p>Our order page shows the seller, the price in USD, taxes and what you're agreeing to.</p></li>
      <li><h3>Pay with Stripe</h3><p>Enter your card on Stripe's secure checkout page. We never see your card number.</p></li>
      <li><h3>Download your files</h3><p>Straight away from the download page, or later from the link we email you.</p></li>
    </ol>
    <p class="after-steps"><a href="/how-it-works/">Read the full step-by-step guide</a></p>
  </div>
</section>

<section class="section" aria-labelledby="faq-heading">
  <div class="container narrow">
    <h2 id="faq-heading">Common questions</h2>
    ${faqList(faq)}
    <p class="muted">More answers on the <a href="/faq/">FAQ page</a>, or email ${mail(site)}.</p>
  </div>
</section>`;
  return {
    path: "/",
    fullTitle: `${site.brand} | Printable Weekly Planner and Project Workflow Templates`,
    title: site.brand,
    description: `${site.brand} sells two downloadable kits: the Weekly Focus Planner (${money(planner.price)}) and the Project Workflow Bundle (${money(bundle.price)}). One-time payment, instant digital delivery, nothing shipped.`,
    nav: "/",
    body,
    jsonLd: [organizationJsonLd(site), { "@context": "https://schema.org", "@type": "WebSite", name: site.brand, url: site.url }],
  };
}

export function shop(ctx) {
  const { site, products } = ctx;
  const p = bySlug(ctx);
  const planner = p["weekly-focus-planner"];
  const bundle = p["project-workflow-bundle"];
  const rows = [
    ["Weekly plan page", true, true],
    ["Daily priorities and task-list worksheet", true, true],
    ["Monthly habit tracker", true, true],
    ["Weekly review worksheet", true, true],
    ["Printing and how-to-use instructions", true, true],
    ["Project tracker spreadsheet (XLSX): projects, tasks, 26-week timeline, monthly overview", false, true],
    ["Content calendar spreadsheet (XLSX): calendar, month view, ideas list", false, true],
    ["Printable monthly overview and 12-week project timeline", false, true],
    ["Reusable weekly task-management checklist (printable and in the tracker)", false, true],
    ["PDF setup guide", false, true],
  ];
  const cell = (yes) => (yes ? `<td class="yes">${tick}<span class="visually-hidden">Included</span></td>` : `<td class="no"><span aria-hidden="true">–</span><span class="visually-hidden">Not included</span></td>`);
  const body = `
${pageHeader({
  title: "Shop",
  intro: "Two kits, both delivered as downloadable files. Prices are in US dollars and are charged once. Nothing is shipped.",
  trail: [["/", "Home"], ["/shop/", "Shop"]],
})}
<section class="section-sm">
  <div class="container">
    ${!site.checkoutOpen ? checkoutNotice(site, "buy") : ""}
    <div class="kit-grid">${products.products.map((x) => kitCard(ctx, x, { headingLevel: 2 })).join("")}</div>
  </div>
</section>
<section class="section band" id="compare" aria-labelledby="compare-heading">
  <div class="container">
    <div class="section-head">
      <h2 id="compare-heading">Which one do you need?</h2>
      <p>Choose the <a href="/products/${planner.slug}/">planner</a> if you want to plan your own week on paper. Choose the <a href="/products/${bundle.slug}/">bundle</a> if you also manage projects, deadlines or a publishing schedule and want spreadsheets for them. The bundle includes the whole planner.</p>
    </div>
    <div class="table-wrap" role="region" aria-label="Comparison table" tabindex="0">
      <table class="compare">
        <thead><tr><th scope="col">What's included</th><th scope="col">${esc(planner.name)}</th><th scope="col">${esc(bundle.name)}</th></tr></thead>
        <tbody>
          ${rows.map(([label, a, b]) => `<tr><th scope="row">${esc(label)}</th>${cell(a)}${cell(b)}</tr>`).join("")}
          <tr><th scope="row">Paper sizes</th><td>A4 and US Letter</td><td>A4 and US Letter</td></tr>
          <tr><th scope="row">Price (one-time, taxes included)</th><td>${priceHtml(planner.price)}</td><td>${priceHtml(bundle.price)}</td></tr>
        </tbody>
      </table>
    </div>
    <p class="small muted">Prices are in US dollars (USD) and include any sales tax, VAT or GST we have to collect. Card payments are processed by Stripe. See <a href="/how-it-works/">how buying works</a> and the <a href="/refund-policy/">Delivery and Refund Policy</a>.</p>
  </div>
</section>`;
  return {
    path: "/shop/",
    title: "Shop: Weekly Focus Planner and Project Workflow Bundle",
    description: `Compare the ${planner.name} (${money(planner.price)}) and the ${bundle.name} (${money(bundle.price)}). Digital downloads, one-time payment in USD, taxes included.`,
    nav: "/shop/",
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        itemListElement: products.products.map((x, i) => ({ "@type": "ListItem", position: i + 1, url: `${site.url}/products/${x.slug}/`, name: x.name })),
      },
    ],
  };
}

export function product(ctx, p) {
  const { site, previews } = ctx;
  const all = bySlug(ctx);
  const planner = all["weekly-focus-planner"];
  const isBundle = p.slug === "project-workflow-bundle";
  const shots = previews.previews[p.slug];
  const other = isBundle ? planner : all["project-workflow-bundle"];

  const gallery = `
<div class="gallery" data-gallery>
  <figure class="gallery-main">
    <img src="${shots[0].src}" width="${shots[0].width}" height="${shots[0].height}" alt="${esc(shots[0].caption)}" data-gallery-image>
    <figcaption data-gallery-caption>${esc(shots[0].caption)}</figcaption>
  </figure>
  <ul class="gallery-thumbs" aria-label="More pages">${shots
    .map(
      (s, i) =>
        `<li><a href="${s.src}" data-src="${s.src}" data-width="${s.width}" data-height="${s.height}" data-caption="${esc(s.caption)}"${i === 0 ? ' aria-current="true"' : ""}><img src="${s.src}" width="${s.width}" height="${s.height}" alt="" loading="lazy"><span class="visually-hidden">Show: ${esc(s.caption)}</span></a></li>`
    )
    .join("")}</ul>
</div>`;

  const buy = `
<aside class="buy-box" aria-labelledby="buy-heading">
  <h2 id="buy-heading" class="visually-hidden">Price and purchase</h2>
  <p class="buy-price">${priceHtml(p.price)}</p>
  <p class="buy-terms">One-time payment. Taxes included. No subscription.</p>
  ${checkoutNotice(site, "buy")}
  <a class="btn btn-block" href="/checkout/${p.slug}/">${site.checkoutOpen ? `Buy now for ${money(p.price)}` : "Review order details"}</a>
  <dl class="facts">
    <div><dt>Format</dt><dd>${esc(p.format)}</dd></div>
    <div><dt>Delivery</dt><dd>Download page and emailed link right after payment. Nothing is shipped.</dd></div>
    <div><dt>Refunds</dt><dd>Faulty or not as described: fixed or refunded. Not downloaded yet: full refund within ${site.unusedRefundDays} days. <a href="/refund-policy/">Policy</a></dd></div>
    <div><dt>License</dt><dd>Personal use and your own internal work. <a href="/terms/#license">License terms</a></dd></div>
  </dl>
</aside>`;

  const plannerPages = planner.pages
    .map(([name, desc], i) => `<li><span class="pg">${i + 1}</span><div><strong>${esc(name)}</strong><p>${esc(desc)}</p></div></li>`)
    .join("");

  const contentsHtml = isBundle
    ? `
<section class="detail" aria-labelledby="inside-heading">
  <h2 id="inside-heading">What's inside</h2>
  <div class="detail-body">
    <h3>1. The complete Weekly Focus Planner</h3>
    <p>The same 7-page undated planner sold on its own, in A4 and US Letter: weekly plan, daily priorities and task list, habit tracker, weekly review, notes, and printing instructions. <a href="/products/${planner.slug}/">See the planner's pages</a>.</p>
    <h3>2. Project tracker spreadsheet</h3>
    <p class="file-line">${esc(p.spreadsheets[0].file)}</p>
    <dl class="sheet-list">${p.spreadsheets[0].sheets.map(([n, d]) => `<div><dt>${esc(n)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>
    <h3>3. Content calendar spreadsheet</h3>
    <p class="file-line">${esc(p.spreadsheets[1].file)}</p>
    <dl class="sheet-list">${p.spreadsheets[1].sheets.map(([n, d]) => `<div><dt>${esc(n)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>
    <h3>4. Project printables</h3>
    <p>A PDF in A4 and US Letter with three pages to print:</p>
    <dl class="sheet-list">${p.printables.map(([n, d]) => `<div><dt>${esc(n)}</dt><dd>${esc(d)}</dd></div>`).join("")}</dl>
    <h3>5. Setup guide</h3>
    <p>A short PDF that explains every file, which apps to use, how the formulas and drop-down lists work, and what to do if something looks wrong.</p>
    <p class="muted small">In the spreadsheets, white cells are for typing, grey cells calculate on their own, and yellow cells are settings such as the month to show. You don't need to know formulas to use them.</p>
  </div>
</section>`
    : `
<section class="detail" aria-labelledby="inside-heading">
  <h2 id="inside-heading">What's inside</h2>
  <div class="detail-body">
    <p>One undated, 7-page PDF, supplied in A4 and US Letter. Print the pages you need, as often as you need them for your own use.</p>
    <ol class="page-list">${plannerPages}</ol>
  </div>
</section>`;

  const files = `
<section class="detail" aria-labelledby="files-heading">
  <h2 id="files-heading">Files you'll receive</h2>
  <div class="detail-body">
    <div class="table-wrap" role="region" aria-label="Table of files" tabindex="0">
      <table class="file-table">
        <thead><tr><th scope="col">File</th><th scope="col">Type</th><th scope="col">Contents</th></tr></thead>
        <tbody>${p.files.map((f) => `<tr><td class="file-name">${esc(f.name)}</td><td>${f.type}</td><td>${esc(f.detail)}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <p class="small muted">Download the files one by one, or all together as a single ZIP file.</p>
  </div>
</section>`;

  const compat = isBundle
    ? `
<section class="detail" aria-labelledby="compat-heading">
  <h2 id="compat-heading">Software you'll need</h2>
  <div class="detail-body">
    <div class="table-wrap" role="region" aria-label="Software compatibility table" tabindex="0">
      <table class="compat">
        <thead><tr><th scope="col">App</th><th scope="col">Editing and formulas</th><th scope="col">Drop-down lists</th><th scope="col">Highlights and timeline bars</th></tr></thead>
        <tbody>
          <tr><th scope="row">Microsoft Excel 2016 or later, Microsoft 365, Excel for the web</th><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><th scope="row">Google Sheets</th><td>Yes, after File › Save as Google Sheets</td><td>Yes</td><td>Yes</td></tr>
          <tr><th scope="row">LibreOffice Calc 7 or later (free)</th><td>Yes</td><td>Yes</td><td>Yes</td></tr>
          <tr><th scope="row">Apple Numbers</th><td>Yes</td><td>May need recreating as pop-up menus</td><td>No: Numbers doesn't support these color rules</td></tr>
        </tbody>
      </table>
    </div>
    <ul>
      <li>The spreadsheets contain no macros, scripts or add-ins.</li>
      <li>Phone and tablet spreadsheet apps can open the files, but the timeline and month views are hard to use on a small screen.</li>
      <li>The PDFs open in any PDF reader, including the one built into your web browser.</li>
    </ul>
  </div>
</section>`
    : `
<section class="detail" aria-labelledby="compat-heading">
  <h2 id="compat-heading">Printing and using it</h2>
  <div class="detail-body">
    <ul>
      <li>Opens in any PDF reader, including the one built into your web browser.</li>
      <li>Print at “Actual size” or “Scale 100%”. The habit tracker is a landscape page.</li>
      <li>Prints clearly in black and white; the lines are light grey so your handwriting stands out.</li>
      <li>On a tablet, import it into an app that lets you write on PDFs, such as GoodNotes, Notability, Xodo or Adobe Acrobat Reader. The pages don't have fillable form fields.</li>
      <li>The PDF is flat artwork, so its printed text can't be edited.</li>
    </ul>
  </div>
</section>`;

  const fit = `
<section class="detail" aria-labelledby="fit-heading">
  <h2 id="fit-heading">Is it right for you?</h2>
  <div class="detail-body fit">
    <div><h3>A good fit if…</h3><ul>${p.goodFor.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
    <div><h3>Probably not if…</h3><ul>${p.notFor.map((g) => `<li>${esc(g)}</li>`).join("")}</ul></div>
  </div>
</section>`;

  const relation = isBundle
    ? `<p>The bundle includes the complete <a href="/products/${planner.slug}/">${esc(planner.name)}</a>, so there's no need to buy both.</p>`
    : `<p>Want project and content spreadsheets too? The <a href="/products/${other.slug}/">${esc(other.name)}</a> (${money(other.price)}) includes this whole planner plus a project tracker, a content calendar, project printables and a setup guide. You only need one of the two.</p>`;

  const smallPrint = `
<section class="detail" aria-labelledby="print-heading">
  <h2 id="print-heading">License, delivery and refunds</h2>
  <div class="detail-body">
    ${relation}
    <p><strong>License.</strong> Use the files for yourself and for internal work in your own business or organization. Please don't share the blank templates outside it, resell them or publish them. The full license is in the <a href="/terms/#license">Terms and Conditions</a>.</p>
    <p><strong>Delivery.</strong> After your payment is confirmed you'll see a download page, and we'll email you a link that works for ${site.downloadLinkDays} days. See the <a href="/refund-policy/#delivery">delivery details</a>.</p>
    <p><strong>Refunds.</strong> If a file is faulty or not as described, we'll fix it or refund you. If you haven't downloaded anything, you can ask for a full refund within ${site.unusedRefundDays} days. Read the <a href="/refund-policy/">Delivery and Refund Policy</a>.</p>
    <p><strong>No promises we can't keep.</strong> These are organizing templates. They don't guarantee any productivity, business or financial result, and they aren't professional advice.</p>
    <p>Questions before you buy? Email ${mail(site)} or call ${phone(site)}.</p>
  </div>
</section>`;

  const faq = pickFaq(ctx, isBundle ? ["difference", "apps", "license", "delivery", "refunds"] : ["difference", "delivery", "tax", "refunds", "withdrawal"]);

  const body = `
<div class="container product">
  <div class="product-top">
    <div class="product-intro">
      ${crumbs([["/", "Home"], ["/shop/", "Shop"], [`/products/${p.slug}/`, p.name]])}
      <h1>${esc(p.name)}</h1>
      <p class="product-desc">${esc(p.description)}</p>
      ${checkList(p.includes.map((i) => (i === "Everything in the Weekly Focus Planner" ? `Everything in the <a href="/products/${planner.slug}/">${esc(planner.name)}</a>` : esc(i))))}
    </div>
    ${gallery}
    ${buy}
  </div>
  ${contentsHtml}
  ${files}
  ${compat}
  ${fit}
  ${smallPrint}
  <section class="detail" aria-labelledby="pfaq-heading">
    <h2 id="pfaq-heading">Questions</h2>
    <div class="detail-body">${faqList(faq)}<p class="muted"><a href="/faq/">All questions and answers</a></p></div>
  </section>
</div>`;

  const offer = {
    "@type": "Offer",
    url: `${site.url}/products/${p.slug}/`,
    price: (p.price / 100).toFixed(2),
    priceCurrency: "USD",
    ...(site.checkoutOpen ? { availability: "https://schema.org/InStock" } : {}),
    seller: { "@type": "Organization", name: site.brand },
  };
  return {
    path: `/products/${p.slug}/`,
    title: p.seo.title,
    ogTitle: `${p.name} (${money(p.price)})`,
    description: p.seo.description,
    nav: "/shop/",
    ogType: "product",
    ogImage: `/assets/img/og-${p.slug}.jpg`,
    body,
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: p.name,
        description: p.description,
        sku: p.slug,
        image: [`${site.url}/assets/img/${p.slug}.webp`, ...shots.map((s) => site.url + s.src)],
        brand: { "@type": "Brand", name: site.brand },
        offers: offer,
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

export function checkout(ctx, p) {
  const { site } = ctx;
  const planner = bySlug(ctx)["weekly-focus-planner"];
  const open = site.checkoutOpen;
  const body = `
${pageHeader({ title: "Review your order", trail: [["/", "Home"], ["/shop/", "Shop"], [`/products/${p.slug}/`, p.name], [`/checkout/${p.slug}/`, "Review order"]] })}
<div class="container">
  ${checkoutNotice(site, "checkout")}
  <div class="checkout-grid">
    <div class="checkout-main">
      <section class="panel" aria-labelledby="item-heading">
        <h2 id="item-heading">You're buying</h2>
        <div class="order-item">
          <img src="/assets/img/${p.slug}.webp" width="160" height="120" alt="">
          <div>
            <p class="order-name"><a href="/products/${p.slug}/">${esc(p.name)}</a></p>
            <p class="small">${esc(p.format)}. Digital download, quantity 1.</p>
            ${p.contains ? `<p class="small">Includes the complete ${esc(planner.name)}.</p>` : ""}
          </div>
          <p class="order-price">${priceHtml(p.price)}</p>
        </div>
      </section>

      <section class="panel" aria-labelledby="after-heading">
        <h2 id="after-heading">What happens after you pay</h2>
        <ol class="mini-steps">
          <li>Stripe confirms your payment, normally within a few seconds.</li>
          <li>You're brought back to a download page on this site with your order number and your files.</li>
          <li>We email you an order confirmation with a download link that works for ${site.downloadLinkDays} days. Stripe emails your payment receipt.</li>
          <li>If the link runs out, ask us for a new one, free, for up to ${site.redownloadMonths} months.</li>
        </ol>
        <p class="small muted">Nothing is shipped. If anything goes wrong, see <a href="/download-help/">download help</a> or email ${mail(site)}.</p>
      </section>

      <section class="panel" aria-labelledby="seller-heading">
        <h2 id="seller-heading">Who you're buying from</h2>
        <dl class="seller">
          <div><dt>Seller</dt><dd>${esc(sellerName(site))}</dd></div>
          <div><dt>Address</dt><dd>${esc(addressInline(site))}</dd></div>
          <div><dt>Merchant location</dt><dd>${esc(site.address.country)}</dd></div>
          <div><dt>Support</dt><dd>${mail(site)} · ${phone(site)}</dd></div>
          <div><dt>On your card statement</dt><dd>${esc(site.statementDescriptor)}</dd></div>
        </dl>
      </section>

      <section class="panel" aria-labelledby="pay-heading">
        <h2 id="pay-heading">How payment works</h2>
        <p>You'll enter your card details on Stripe's secure checkout page, not on this site. Stripe is certified to PCI DSS Level 1, and we never see or store your full card number. Accepted cards: ${esc(listJoin(site.acceptedCards))}. Stripe may show other payment options depending on your location.</p>
        <p>You're charged in US dollars. If your card uses another currency, your bank converts the amount and may charge a foreign transaction fee.</p>
      </section>
    </div>

    <aside class="panel summary" aria-labelledby="summary-heading">
      <h2 id="summary-heading">Order summary</h2>
      <dl class="summary-rows">
        <div><dt>${esc(p.name)}</dt><dd>${money(p.price)}</dd></div>
        <div><dt>Sales tax, VAT or GST</dt><dd>Included in price</dd></div>
        <div><dt>Shipping</dt><dd>None, digital download</dd></div>
        <div class="total"><dt>Total</dt><dd>${money(p.price)}</dd></div>
      </dl>
      <p class="small">One-time payment, charged once. No subscription, trial or renewal.</p>

      <form class="consent-form" method="post" action="/api/checkout" data-checkout data-open="${open ? "true" : "false"}">
        <input type="hidden" name="product" value="${p.slug}">
        <fieldset>
          <legend>Before you continue</legend>
          <div class="consent">
            <input type="checkbox" id="accept-terms" name="accept_terms" value="yes" required>
            <label for="accept-terms">I have read and agree to the <a href="/terms/" target="_blank" rel="noopener">Terms and Conditions<span class="visually-hidden"> (opens in a new tab)</span></a>, and I have read the <a href="/refund-policy/" target="_blank" rel="noopener">Delivery and Refund Policy<span class="visually-hidden"> (opens in a new tab)</span></a> and the <a href="/privacy/" target="_blank" rel="noopener">Privacy Policy<span class="visually-hidden"> (opens in a new tab)</span></a>.</label>
          </div>
          <div class="consent">
            <input type="checkbox" id="digital-consent" name="digital_consent" value="yes" required aria-describedby="digital-consent-help">
            <label for="digital-consent">I expressly consent to the immediate supply of the digital content and acknowledge that, where applicable law permits, I lose my right of withdrawal once the supply begins.</label>
          </div>
          <details class="consent-help" id="digital-consent-help">
            <summary>What does this mean?</summary>
            <p>In the EU, the UK and some other countries, you normally have 14 days to cancel an online purchase. For digital files that are delivered straight away, that right ends once the download is made available, but only if you agree to it. That's what this box is for.</p>
            <p>It doesn't affect your right to a repair, replacement or refund if a file is faulty or not as described. Under our own policy, you can still get a full refund within ${site.unusedRefundDays} days if you haven't downloaded anything. We'll include this consent in your order confirmation email.</p>
          </details>
        </fieldset>
        <p class="form-error" role="alert" data-checkout-error hidden></p>
        <button class="btn btn-block" type="submit" data-checkout-submit${open ? "" : " disabled"}>${open ? "Continue to secure payment" : "Checkout opens soon"}</button>
        <p class="small muted">${open ? "Next, you'll see Stripe's checkout page, where you can check the amount again before paying." : "Online payment isn't switched on yet, so this button doesn't work."}</p>
      </form>
      <p class="policy-links"><a href="/terms/">Terms</a> · <a href="/refund-policy/">Delivery and Refunds</a> · <a href="/privacy/">Privacy</a></p>
    </aside>
  </div>
</div>`;
  return {
    path: `/checkout/${p.slug}/`,
    title: `Review your order: ${p.name}`,
    description: `Order summary for the ${p.name}: ${money(p.price)}, one-time payment, taxes included, digital download.`,
    nav: "/shop/",
    noindex: true,
    body,
  };
}

export function howItWorks(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({
  title: "How buying works",
  intro: "From choosing a kit to printing your first page, including what happens if something goes wrong.",
  trail: [["/", "Home"], ["/how-it-works/", "How it works"]],
})}
<div class="container narrow">
  ${checkoutNotice(site, "buy")}
  <ol class="timeline-steps">
    <li>
      <h2>Choose a kit</h2>
      <p>There are two: the <a href="/products/weekly-focus-planner/">Weekly Focus Planner</a> and the <a href="/products/project-workflow-bundle/">Project Workflow Bundle</a>. Each product page lists every file and page, with previews of the real pages. The <a href="/shop/#compare">comparison table</a> shows the difference at a glance.</p>
    </li>
    <li>
      <h2>Review your order</h2>
      <p>Select the button on the product page to see the order summary: the product, the seller, the price in US dollars, taxes (already included) and a description of delivery. To continue, you tick two boxes:</p>
      <ul>
        <li>one to agree to our <a href="/terms/">Terms and Conditions</a>;</li>
        <li>a separate one to ask us to deliver the files straight away. In the EU, the UK and some other places, this is what lets your 14-day right to cancel end once the download is available. <a href="/refund-policy/#withdrawal">Read more</a>.</li>
      </ul>
      <p>Neither box is ticked for you.</p>
    </li>
    <li>
      <h2>Pay on Stripe's checkout page</h2>
      <p>You're taken to Stripe, our payment provider, to enter your card details. The page shows ${esc(site.brand)} as the seller and the amount in USD before you confirm. We never see your full card number.</p>
      <p>If your payment is declined or you close the page, nothing is charged and you can try again. If you're charged but don't get your files, email us and we'll sort it out.</p>
    </li>
    <li>
      <h2>Download your files</h2>
      <p>When the payment is confirmed, usually within seconds, you return to a download page on this site. We also email you:</p>
      <ul>
        <li>an order confirmation with your order number and a download link that works for ${site.downloadLinkDays} days;</li>
        <li>a payment receipt, sent by Stripe on our behalf.</li>
      </ul>
      <p>Download as often as you like while the link works, and save the files somewhere safe. After that, we'll send a fresh link free of charge for up to ${site.redownloadMonths} months after your purchase.</p>
    </li>
    <li>
      <h2>Print or open the files</h2>
      <p>Print the PDFs on A4 or US Letter paper (both sizes are included), or write on them in a tablet app. Open the spreadsheets in Excel, Google Sheets or LibreOffice. The bundle's setup guide walks you through each file.</p>
    </li>
  </ol>

  <section class="prose-block" aria-labelledby="wrong-heading">
    <h2 id="wrong-heading">If something goes wrong</h2>
    <dl class="trouble">
      <div><dt>The download doesn't start or a file won't open</dt><dd>Try the steps on the <a href="/download-help/">download help page</a>. If that doesn't fix it, email us and we'll send the files another way.</dd></div>
      <div><dt>A file is damaged, incomplete or not what the product page described</dt><dd>Tell us. We'll send a corrected file, or refund you if we can't fix it. See the <a href="/refund-policy/">Delivery and Refund Policy</a>.</dd></div>
      <div><dt>You bought the wrong kit or bought twice</dt><dd>Email us. If you haven't downloaded the files, or it was a duplicate charge, we'll refund it.</dd></div>
      <div><dt>You don't recognize a charge</dt><dd>Look for <strong>${esc(site.statementDescriptor)}</strong> on your statement, then email us. We can usually explain or fix it faster than a bank dispute.</dd></div>
    </dl>
  </section>

  <section class="prose-block" aria-labelledby="dont-heading">
    <h2 id="dont-heading">What we don't do</h2>
    <ul>
      <li>No subscriptions, trials, automatic renewals or extra charges.</li>
      <li>No accounts or passwords to remember.</li>
      <li>No marketing emails. We only email you about your order.</li>
      <li>No physical products. Nothing is ever shipped.</li>
    </ul>
    <p>Questions? Email ${mail(site)} or call ${phone(site)}.</p>
  </section>
</div>`;
  return {
    path: "/how-it-works/",
    title: "How buying works",
    description: `How to buy from ${site.brand}: review your order, pay securely with Stripe, download your files straight away, and what to do if something goes wrong.`,
    nav: "/how-it-works/",
    body,
  };
}

export function faq(ctx) {
  const { site } = ctx;
  const groups = faqGroups(ctx);
  const body = `
${pageHeader({
  title: "Frequently asked questions",
  intro: "About the products, payment, delivery, refunds and using the files.",
  trail: [["/", "Home"], ["/faq/", "FAQ"]],
})}
<div class="container narrow">
  <nav class="jump" aria-label="Topics"><ul>${groups.map((g, i) => `<li><a href="#topic-${i + 1}">${esc(g.title)}</a></li>`).join("")}</ul></nav>
  ${groups.map((g, i) => `<section class="faq-group" id="topic-${i + 1}" aria-labelledby="topic-${i + 1}-h"><h2 id="topic-${i + 1}-h">${esc(g.title)}</h2>${faqList(g.items)}</section>`).join("")}
  <p class="muted">Didn't find your answer? Email ${mail(site)} or call ${phone(site)}.</p>
</div>`;
  return {
    path: "/faq/",
    title: "FAQ",
    description: `Answers about ${site.brand}: what's in each kit, paper sizes, software, USD pricing and taxes, delivery, download links, refunds, the EU/UK right to cancel and the license.`,
    nav: "/faq/",
    body,
    jsonLd: [faqJsonLd(groups.flatMap((g) => g.items))],
  };
}

export function about(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({ title: `About ${site.brand}`, trail: [["/", "Home"], ["/about/", "About"]] })}
<div class="container narrow prose">
  <p class="lead">${esc(site.brand)} is a small online shop that sells two digital products: the <a href="/products/weekly-focus-planner/">Weekly Focus Planner</a> and the <a href="/products/project-workflow-bundle/">Project Workflow Bundle</a>.</p>
  <p>Both are original templates designed by ${esc(site.brand)}. We sell them directly to customers through this website, ${esc(site.domain)}. The business is based in ${esc(site.address.city)}, ${esc(site.address.regionName)}, and prices are in US dollars.</p>

  <h2>What we make</h2>
  <p>Templates for the planning most people do anyway: deciding what matters this week, keeping track of what's due, and looking back at how things went. The planner is for doing that on paper. The bundle adds spreadsheets for projects and a publishing schedule, for people who manage more than their own week.</p>

  <h2>How the kits are put together</h2>
  <ul>
    <li><strong>Made for ordinary printers.</strong> Pages come in A4 and US Letter, with light grey lines that print clearly in black and white and leave room for real handwriting.</li>
    <li><strong>Undated.</strong> Start any week, skip a week, and print only what you use.</li>
    <li><strong>Plain spreadsheets.</strong> Standard formulas and drop-down lists, no macros, nothing to install. White cells are for typing; grey cells work things out for you.</li>
    <li><strong>Instructions included.</strong> Each file explains itself, and the bundle comes with a setup guide.</li>
  </ul>

  <h2>What we don't do</h2>
  <ul>
    <li>We don't sell subscriptions, memberships, courses or physical products.</li>
    <li>We don't promise productivity, business or financial results. These are tools; the work is yours.</li>
    <li>We don't track visitors with analytics or advertising tools, and we don't send marketing emails.</li>
  </ul>

  <h2>Get in touch</h2>
  <p>Email ${mail(site)} or call ${phone(site)}. Our mailing address is ${esc(addressInline(site))}. Full business details are on the <a href="/legal-notice/">legal notice</a> page.</p>
</div>`;
  return {
    path: "/about/",
    title: "About",
    description: `${site.brand} is a small online shop selling two original digital planning kits: the Weekly Focus Planner and the Project Workflow Bundle. Based in Kailua, Hawaii.`,
    nav: "/about/",
    body,
    jsonLd: [organizationJsonLd(site)],
  };
}

export function contact(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({
  title: "Contact and support",
  intro: "Questions about a kit, an order, a download or a refund? Get in touch and a person will reply.",
  trail: [["/", "Home"], ["/contact/", "Contact"]],
})}
<div class="container">
  <div class="contact-grid">
    <section class="panel" aria-labelledby="c-email">
      <h2 id="c-email">Email</h2>
      <p class="contact-main">${mail(site)}</p>
      <p>Best for orders, downloads and refunds. We reply within ${site.replyBusinessDays} business days, Monday to Friday, ${esc(site.timeZoneLabel)}.</p>
    </section>
    <section class="panel" aria-labelledby="c-phone">
      <h2 id="c-phone">Phone</h2>
      <p class="contact-main">${phone(site)}</p>
      <p>If we can't pick up, leave a message with your name and email address and we'll get back to you.</p>
    </section>
    <section class="panel" aria-labelledby="c-post">
      <h2 id="c-post">Mail</h2>
      <address class="contact-main">${esc(site.brand)}<br>${addressLines(site).map(esc).join("<br>")}</address>
      <p>For letters only. Our products are digital, so there's never anything to send back.</p>
    </section>
  </div>

  <div class="narrow prose contact-more">
    <h2>Help with an order</h2>
    <p>To help us answer in one go, please include:</p>
    <ul>
      <li>your order number (it starts with CW- and is in your confirmation email), or the email address you used at checkout;</li>
      <li>which product it's about;</li>
      <li>what happened, and a screenshot if something looks wrong.</li>
    </ul>
    <h2>Quick links</h2>
    <ul>
      <li><a href="/download-help/">The download didn't work, or the link expired</a></li>
      <li><a href="/refund-policy/#how-to-ask">Ask for a refund</a></li>
      <li><a href="/refund-policy/#withdrawal">Cancel within 14 days (EU and UK customers)</a></li>
      <li><a href="/privacy/#your-rights">Access, correct or delete your personal information</a></li>
    </ul>
    <h2>A charge you don't recognize?</h2>
    <p>Our charges appear as <strong>${esc(site.statementDescriptor)}</strong>. If something looks wrong, contact us before disputing it with your bank. We can usually sort it out faster, and contacting us doesn't affect your right to dispute a charge.</p>
  </div>
</div>`;
  return {
    path: "/contact/",
    title: "Contact and customer support",
    description: `Contact ${site.brand}: email ${site.email}, phone ${site.phoneDisplay}, mail ${addressInline(site)}. Replies within ${site.replyBusinessDays} business days.`,
    nav: "/contact/",
    body,
    jsonLd: [organizationJsonLd(site)],
  };
}

export function downloadHelp(ctx) {
  const { site } = ctx;
  const body = `
${pageHeader({
  title: "Download help",
  intro: "Most download problems take a minute to fix. If these steps don't help, email us and we'll get your files to you.",
  trail: [["/", "Home"], ["/download-help/", "Download help"]],
})}
<div class="container narrow">
  <dl class="trouble big">
    <div id="no-email"><dt>I can't find the email with my download link</dt><dd>
      <p>It usually arrives within a few minutes of payment. Check your spam, junk or promotions folder and search your inbox for “${esc(site.brand)}”.</p>
      <p>Still nothing? Email ${mail(site)} from the address you used at checkout, or tell us that address, and we'll resend it.</p>
    </dd></div>
    <div id="expired"><dt>My download link has expired</dt><dd>
      <p>Links work for ${site.downloadLinkDays} days. Email us with your order number or checkout email address and we'll send a new link free of charge, for up to ${site.redownloadMonths} months after your purchase.</p>
    </dd></div>
    <div id="wont-start"><dt>The download won't start or stops partway</dt><dd>
      <ul>
        <li>Try a different browser, or turn off any download-manager extension.</li>
        <li>Try another network. Some work and school networks block file downloads.</li>
        <li>On a phone or tablet, choose “Download” or “Save to Files” rather than opening the file in the browser.</li>
      </ul>
    </dd></div>
    <div id="zip"><dt>I can't open the ZIP file</dt><dd>
      <ul>
        <li><strong>Windows:</strong> right-click the file and choose “Extract All”.</li>
        <li><strong>Mac:</strong> double-click the file.</li>
        <li><strong>iPhone and iPad:</strong> open the Files app and tap the file.</li>
        <li><strong>Android:</strong> open your Files app and tap the file, then “Extract”.</li>
      </ul>
      <p>You can also skip the ZIP and download each file on its own.</p>
    </dd></div>
    <div id="wont-open"><dt>A file won't open</dt><dd>
      <ul>
        <li><strong>PDF:</strong> open it in your web browser or any PDF reader.</li>
        <li><strong>XLSX:</strong> open it in Microsoft Excel, Google Sheets (upload it, then choose File › Save as Google Sheets) or the free LibreOffice Calc.</li>
      </ul>
    </dd></div>
    <div id="damaged"><dt>A file looks damaged, incomplete or different from the description</dt><dd>
      <p>First, download it again: an interrupted download can produce a broken file. If it's still wrong, email us with the file name and what you see (a screenshot helps). We'll send a corrected file or, if we can't fix it, a refund. See the <a href="/refund-policy/">Delivery and Refund Policy</a>.</p>
    </dd></div>
  </dl>
  <div class="panel help-panel">
    <h2>Still stuck?</h2>
    <p>Email ${mail(site)} or call ${phone(site)} with your order number, the product and what happened. We reply within ${site.replyBusinessDays} business days, and we'll find a way to get your files to you.</p>
  </div>
</div>`;
  return {
    path: "/download-help/",
    title: "Download help",
    description: `What to do if your ${site.brand} download link is missing or expired, a download fails, or a file won't open.`,
    body,
  };
}

export function notFound(ctx) {
  return {
    path: "/404.html",
    file: "404.html",
    title: "Page not found",
    description: "The page you were looking for doesn't exist.",
    noindex: true,
    body: `<section class="section"><div class="container narrow"><h1>Page not found</h1><p class="lead">That page doesn't exist or has moved.</p><p><a class="btn" href="/">Go to the home page</a> <a class="btn btn-ghost" href="/shop/">See the shop</a></p></div></section>`,
  };
}
