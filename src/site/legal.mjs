// Legal and policy pages. Written to describe how this site actually works:
// - no accounts, no analytics, no advertising or tracking cookies
// - cart kept in the visitor's browser (localStorage) until checkout
// - payment on the payment processor's hosted page; we never receive full card numbers
// - files delivered on an order page linked to the payment session; files stored privately
import { addressLines, esc, pageHeader } from "./ui.mjs";

function legalPage(ctx, { path, title, description, intro, sections, nav }) {
  const { site } = ctx;
  const toc = sections.length > 5
    ? `<nav class="toc" aria-label="Contents"><ol>${sections.map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join("")}</ol></nav>`
    : "";
  const body = `
${pageHeader({ title, crumbs: [["/", "Home"], [path, title]] })}
<div class="container narrow">
  <article class="prose">
    <p class="updated">Last updated: ${esc(site.policiesUpdatedDisplay)}</p>
    ${intro}
    ${toc}
    ${sections.map((s) => `<section id="${s.id}"><h2>${esc(s.title)}</h2>${s.html}</section>`).join("\n")}
  </article>
</div>`;
  return { path, title, description, body, nav };
}

const businessBlock = (site) => `
<p>
  Trading name: ${esc(site.brand)}<br>
  ${site.legalName ? `Legal business name: ${esc(site.legalName)}<br>` : ""}
  ${site.registrationNumber ? `Registration number: ${esc(site.registrationNumber)}<br>` : ""}
  Business address: ${esc(addressLines(site).join(", "))}<br>
  Email: <a href="mailto:${esc(site.email)}">${esc(site.email)}</a><br>
  Phone: <a href="tel:${esc(site.phone.replace(/\s/g, ""))}">${esc(site.phoneDisplay)}</a>
</p>`;

const operator = (site) => (site.legalName ? `${esc(site.legalName)}, trading as ${esc(site.brand)}` : esc(site.brand));

// ---------------------------------------------------------------------------

export function terms(ctx) {
  const { site } = ctx;
  const S = (id, title, html) => ({ id, title, html });
  const email = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  return legalPage(ctx, {
    path: "/terms/",
    title: "Terms of Service",
    description: `Terms of Service for purchases of digital templates from ${site.brand}.`,
    intro: `<p>These Terms of Service (“Terms”) govern your use of the ${esc(site.brand)} website at ${esc(site.domain)} and your purchase of digital products from ${esc(site.brand)} (“${esc(site.brand)}”, “we”, “us” or “our”). Please read them before completing an order.</p>
<div class="callout">Nothing in these Terms limits any consumer rights that cannot legally be excluded.</div>`,
    sections: [
      S("introduction", "1. Introduction", `<p>${esc(site.brand)} sells original digital productivity and organization templates. By using this website or purchasing a product, you agree to these Terms. If you do not agree with these Terms, please do not use the website or purchase our products.</p><p>Our <a href="/privacy/">Privacy Policy</a>, <a href="/refunds/">Refund Policy</a>, <a href="/delivery/">Digital Delivery Policy</a> and <a href="/cookies/">Cookie Policy</a> also apply and form part of these Terms.</p>`),
      S("business", "2. Business identity", `<p>This website and the products sold on it are operated by ${operator(site)}.</p>${businessBlock(site)}`),
      S("eligibility", "3. Eligibility", `<p>To place an order you must be at least 18 years old, or the age of legal majority where you live, and able to enter into a binding contract. If you buy on behalf of a business, you confirm that you are authorised to do so. You agree to provide accurate contact and billing information.</p>`),
      S("products", "4. Products and digital goods", `<p>${esc(site.brand)} sells downloadable digital productivity, planning, workflow and content-organization templates. Products may include PDF, DOCX and XLSX files, as described on the applicable product page, which lists the included templates, file formats and files you will receive.</p><p>We make reasonable efforts to ensure that product descriptions, previews, included files and compatibility information are accurate. Previews show actual pages from the product files.</p><p>Our products are organizational tools only. They are not legal, accounting, tax, financial, investment, medical, employment-law or other professional advice, and they do not replace advice from a qualified professional.</p>`),
      S("orders", "5. Orders and payment", `<p>All prices on this website are shown in euros (EUR). The price that applies is the price displayed at checkout before you submit payment. Any VAT or sales tax that applies to your purchase is calculated and shown on the payment page before you confirm payment.</p><p>Our products are one-time purchases. We do not create subscriptions or recurring charges, and we do not add paid extras to your order.</p><p>Payments are processed by our third-party payment processor using the payment methods offered at checkout. Your payment details are entered on the payment processor's secure page; we do not receive or store your full card number.</p><p>Your order is placed when you complete checkout and your payment is successfully authorized, and the contract between you and us is formed at that point. We may cancel or refuse an order where reasonably necessary to prevent fraud, unauthorized transactions or unlawful activity, or where a product was listed at an obviously incorrect price; in that case any payment taken will be refunded in full.</p>`),
      S("delivery", "6. Digital delivery", `<p>Our products are digital products. No physical goods are shipped.</p><p>After your payment is confirmed you are taken to your order page, which shows your order reference and where the purchased files are available to download. Your payment receipt is sent to the email address you provide at checkout. You can return to your order page to download your files again.</p><p>If you experience a delivery problem, contact us at ${email} with your order reference so that we can assist you. Please keep a copy of the files you download. See the <a href="/delivery/">Digital Delivery Policy</a>.</p>`),
      S("license", "7. License to purchased materials", `<p>Unless a product page expressly states otherwise, your purchase gives you a limited, non-exclusive, non-transferable license to use the purchased templates for your own personal purposes or the internal purposes of your business, including organizing work you carry out for your own clients.</p><p>You may edit, adapt and print the templates for that use, and keep copies on your own devices.</p><p>You may not resell, redistribute, sublicense, publish, upload for others to download, share or otherwise commercially distribute the original files or substantially similar copies of them, whether on their own or as part of another template product.</p>`),
      S("acceptable-use", "8. Acceptable use", `<p>You agree to use this website and our products lawfully and in a way that does not interfere with the website's operation or other people's use of it. You must not attempt to gain unauthorized access to the website, its systems or other customers' orders, or use automated tools to download content in bulk.</p>`),
      S("ip", "9. Intellectual property", `<p>The ${esc(site.brand)} website, branding, product designs, template structures and original content are owned by ${esc(site.brand)} or used with appropriate permission. Third-party software names mentioned on this website (for example, the apps that can open our files) belong to their respective owners and are mentioned only to describe compatibility.</p><p>You may not copy, reproduce or redistribute our products except as expressly permitted by these Terms.</p>`),
      S("prohibited", "10. Prohibited use", `<p>You may not use our products or website for unlawful purposes, fraud, infringement of third-party rights, or any activity prohibited by applicable law.</p><p>You may not represent our templates as your own original template products, offer them for resale, or remove copyright and licensing notices from the files when sharing printed or edited copies outside your own use.</p>`),
      S("refunds", "11. Refunds", `<p>Because our products are digital goods, refund availability may depend on whether digital fulfillment has begun and on applicable consumer-protection law.</p><p>At checkout you are asked to request immediate access to the files and to acknowledge that, where the law allows, you lose your right of withdrawal once the files are made available to you. If you are a consumer in the European Union, the United Kingdom or another country that grants a withdrawal period for digital content, this acknowledgement is how that right ends once supply has begun.</p><p>If a product is defective, inaccessible, corrupted, materially different from its description or otherwise fails to function as described, contact us and we will review the issue and provide an appropriate remedy where required, such as a corrected file, a replacement or a refund.</p><p>Nothing in these Terms limits any consumer rights that cannot legally be excluded. Please see our separate <a href="/refunds/">Refund Policy</a> for additional information.</p>`),
      S("availability", "12. Product availability", `<p>We may update, modify or discontinue products from time to time. Changes will not remove your ability to access products you have already purchased where access is contractually required, except where a change is necessary for legal, security or technical reasons. We may update the content of the website and correct errors at any time.</p>`),
      S("disclaimer", "13. Disclaimer", `<p>Our products are provided as practical organizational resources. We do not guarantee that use of a template will produce a particular business, financial, professional or personal result. You are responsible for deciding whether a template is suitable for your circumstances and for the information you enter into it.</p><p>Except as stated in these Terms and as required by law, the website and products are provided without further warranties. Your statutory rights, including the right to receive digital content that matches its description and is of satisfactory quality, are not affected.</p>`),
      S("liability", "14. Limitation of liability", `<p>To the maximum extent permitted by applicable law, ${esc(site.brand)} will not be responsible for indirect, incidental, special or consequential losses, or for loss of profits, business or data, arising from your use of the website or products, and our total liability in connection with any order is limited to the amount you paid for that order.</p><p>Nothing in these Terms excludes or limits liability that cannot legally be excluded or limited, including liability for fraud, or for death or personal injury caused by negligence.</p>`),
      S("indemnity", "15. Indemnity where legally permitted", `<p>Where permitted by law, and only if you use our products in the course of a business, you agree to compensate ${esc(site.brand)} for reasonable losses and costs arising from your breach of the license or prohibited-use provisions of these Terms. This section does not apply to consumers to the extent that applicable consumer law does not permit it.</p>`),
      S("changes", "16. Changes to these terms", `<p>We may update these Terms from time to time. The latest version will be published on this page with its updated date. The version of the Terms in force when you place an order applies to that order.</p>`),
      S("law", "17. Governing law", `<p>These Terms are governed by the laws of ${esc(site.governingLaw)}, subject to any mandatory consumer-protection rights that apply to you under the law of the country where you live. If you are a consumer, you may bring proceedings in the courts of the place where you live, and nothing in this section deprives you of the protection of mandatory provisions of that law.</p>`),
      S("contact", "18. Contact information", `<p>For questions about these Terms, orders, refunds or products:</p>${businessBlock(site)}`),
    ],
  });
}

export function refunds(ctx) {
  const { site } = ctx;
  const S = (id, title, html) => ({ id, title, html });
  const email = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  return legalPage(ctx, {
    path: "/refunds/",
    title: "Refund Policy",
    description: `Refund policy for ${site.brand} digital products: defective, inaccessible or not-as-described files, duplicate purchases and your statutory rights.`,
    intro: `<p>${esc(site.brand)} sells digital products that are delivered electronically. This policy explains when refunds are available and how to request one.</p>`,
    sections: [
      S("digital-products", "Digital products", `<p>Because our products are digital goods, we cannot accept ordinary physical returns.</p><p>We will nevertheless review refund requests where:</p><ul><li>a purchased file is technically defective;</li><li>the download is inaccessible or corrupted;</li><li>the delivered product is materially different from its description; or</li><li>a refund is required by applicable consumer-protection law.</li></ul><p>Please contact support promptly if a file is defective, inaccessible, corrupted or materially different from its description. Where a problem can be fixed, we may first offer a corrected or replacement file; if we cannot resolve it, we will refund you.</p>`),
      S("how-to", "How to request a refund", `<p>Email ${email} with your order reference (shown on your order page) or the email address you used at checkout, the product concerned and a short description of the issue. Screenshots are helpful but not required. We review every request and reply by email.</p>`),
      S("fulfillment", "Digital fulfillment and the right of withdrawal", `<p>Where permitted by applicable law, a refund may be unavailable after digital fulfillment has begun because the product has already been supplied electronically. Digital fulfillment begins when your files are made available on your order page after payment.</p><p>Consumers in the European Union, the United Kingdom and some other countries normally have a 14-day right to withdraw from online purchases. For digital content, this right ends once supply begins if you have expressly requested immediate supply and acknowledged that you lose the right of withdrawal. You give this request and acknowledgement at checkout. If, for any reason, supply had not begun, you may withdraw within 14 days of your purchase by emailing us, and we will refund your payment.</p><p>This does not affect any mandatory statutory consumer rights, including your rights if a product is faulty or not as described.</p>`),
      S("duplicates", "Duplicate purchases", `<p>If you accidentally purchase the same product more than once, contact support promptly so that we can review the transaction.</p>`),
      S("processing", "Processing", `<p>Approved refunds are returned using the original payment method where technically possible. We do not charge a fee for processing a refund. Refund processing times may depend on the payment provider and financial institution; refunds to cards usually appear within 5 to 10 business days of approval.</p><p>When an order is refunded, its download links stop working.</p>`),
      S("contact", "Contact", `<p>${email}<br>${esc(site.brand)}<br>${esc(addressLines(site).join(", "))}</p>`),
    ],
  });
}

export function delivery(ctx) {
  const { site } = ctx;
  const S = (id, title, html) => ({ id, title, html });
  const email = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  return legalPage(ctx, {
    path: "/delivery/",
    title: "Digital Delivery Policy",
    description: `How ${site.brand} delivers digital products: download on your order page after payment, file formats, delivery problems and support.`,
    intro: `<div class="callout">Products sold by ${esc(site.brand)} are digital products. No physical goods are shipped.</div>`,
    sections: [
      S("how", "How delivery works", `<ol><li>Complete checkout on our payment processor's secure payment page.</li><li>Once your payment is confirmed, you are returned to your order page on this website.</li><li>Download each file individually, or all files at once as a ZIP archive.</li></ol><p>After successful payment, customers receive access to the purchased files through the website. Your order page shows your order reference, and your payment receipt is emailed to the address you provide at checkout.</p>`),
      S("timing", "Delivery time", `<p>Files are available immediately after payment is confirmed, which for card payments is usually within seconds. Some payment methods take longer to confirm. In that case your order page shows that payment is processing, and the downloads appear on the same page as soon as the payment is confirmed.</p>`),
      S("access", "Access to your files", `<p>Your order page is linked to your payment, so you can return to it to download your files again. We recommend bookmarking it and keeping a copy of the downloaded files. If you lose the link, email ${email} from the address you used at checkout, or with your order reference, and we will send it to you again.</p><p>Download links stop working if an order is refunded.</p>`),
      S("formats", "Formats and requirements", `<p>Products are delivered as PDF, DOCX and/or XLSX files, as listed on each product page. PDFs open in any web browser or PDF reader; DOCX files in Microsoft Word, Google Docs, LibreOffice Writer or Apple Pages; and XLSX files in Microsoft Excel, Google Sheets, LibreOffice Calc or Apple Numbers. You will need a device that can download and open files of these types.</p>`),
      S("costs", "Delivery costs and locations", `<p>There are no shipping or delivery charges. Digital products can be purchased from any location where our payment processor's payment methods are available.</p>`),
      S("problems", "If delivery fails", `<p>If automated delivery fails, for example the order page does not load, a download does not start or a file will not open, contact support at ${email} with your order reference. We will send you the files or a working link. See also our <a href="/refunds/">Refund Policy</a>.</p>`),
    ],
  });
}

export function privacy(ctx) {
  const { site } = ctx;
  const S = (id, title, html) => ({ id, title, html });
  const email = `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
  const pp = site.paymentProcessor;
  return legalPage(ctx, {
    path: "/privacy/",
    title: "Privacy Policy",
    description: `How ${site.brand} collects, uses and protects personal information when you visit the website and buy digital products.`,
    intro: `<p>This policy explains what personal information ${esc(site.brand)} collects when you visit ${esc(site.domain)} or buy from us, why we use it, who we share it with and the choices and rights you have. We collect only what we need to sell and deliver our digital products and to provide support.</p>`,
    sections: [
      S("controller", "Who is responsible", `<p>The controller of your personal information is ${operator(site)}.</p>${businessBlock(site)}<p>For any privacy question or request, email ${email}.</p>`),
      S("collected", "Information we collect", `<p><strong>Order information.</strong> When you buy, we receive the products purchased, prices, taxes, currency, order reference, date and time, and the status of the payment and of any refund.</p><p><strong>Email address.</strong> You enter your email address on the payment page. We receive it with your order so that we can identify your purchase and help you with it.</p><p><strong>Payment-related information.</strong> Your card or other payment details are entered directly on our payment processor's secure page. We do not receive or store your full card number. We may receive limited information such as the payment method type, card brand, last four digits, billing name and billing country or address where needed to calculate tax and handle your order.</p><p><strong>Checkout confirmations.</strong> We record that you accepted the Terms of Service and requested immediate access to digital content, together with the time, as evidence of your choices at checkout.</p><p><strong>Customer support information.</strong> If you contact us, we receive your name, email address or phone number and the content of your message.</p><p><strong>Technical information.</strong> When you visit the website, our hosting provider processes technical data needed to deliver and secure it, such as your IP address, browser type, requested pages and the time of the request.</p><p><strong>Website analytics.</strong> We do not use analytics tools, advertising networks or tracking pixels on this website.</p>`),
      S("cookies", "Cookies and local storage", `<p>This website does not set advertising or analytics cookies. Your cart is kept in your own browser's local storage and is not sent to us until you go to payment. Our hosting provider may set strictly necessary security cookies to protect the website from abuse, and the payment processor's payment page may set its own cookies for security and fraud prevention. See our <a href="/cookies/">Cookie Policy</a>.</p>`),
      S("purposes", "Why we use your information", `<table><thead><tr><th>Purpose</th><th>Information</th><th>Legal basis (where the GDPR or UK GDPR applies)</th></tr></thead><tbody>
<tr><td>Processing your order, delivering your files and providing access to your order page</td><td>Order information, email address, payment-related information</td><td>Performance of a contract with you</td></tr>
<tr><td>Handling refunds, delivery problems and support requests</td><td>Order and support information</td><td>Performance of a contract; our legitimate interest in helping customers</td></tr>
<tr><td>Keeping tax and accounting records</td><td>Order and payment-related information</td><td>Compliance with legal obligations</td></tr>
<tr><td>Recording your checkout confirmations</td><td>Confirmation and timestamp</td><td>Compliance with legal obligations; our legitimate interest in demonstrating compliance</td></tr>
<tr><td>Preventing fraud and keeping the website and orders secure</td><td>Technical information, order and payment-related information</td><td>Our legitimate interest in protecting customers and our business</td></tr>
</tbody></table><p>We do not sell your personal information, use it for advertising or use it for automated decisions that have legal or similarly significant effects on you. We do not send marketing emails.</p>`),
      S("providers", "Service providers", `<p>We share personal information only with service providers that help us run the shop, and only as needed for the purposes above:</p><ul>
<li><strong>Payment processing:</strong> ${esc(pp.name)} processes payments, sends payment receipts and helps prevent fraud. ${esc(pp.name)} acts as an independent controller for some processing it carries out for its own legal and fraud-prevention purposes. See <a href="${esc(pp.privacyUrl)}" rel="noopener">${esc(pp.name)}'s privacy policy</a>.</li>
<li><strong>Website hosting, security and file storage:</strong> Cloudflare, Inc. hosts this website, protects it from abuse and stores the product files. See <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">Cloudflare's privacy policy</a>.</li>
<li><strong>Email:</strong> the email service provider we use to send and receive support emails.</li>
<li><strong>Professional advisers and authorities:</strong> accountants, legal advisers or public authorities where required by law or to establish or defend legal claims.</li></ul>`),
      S("retention", "How long we keep information", `<ul><li>Order, payment and tax records: for the period required by applicable tax and accounting laws.</li><li>Support correspondence: for as long as needed to resolve your request and for a reasonable period afterwards, normally no longer than three years.</li><li>Technical logs: kept by our hosting provider for a limited period for security and operations.</li><li>Your cart: stays in your browser until you remove the items, complete your purchase or clear your browser storage.</li></ul>`),
      S("security", "Security", `<p>The website is served only over encrypted HTTPS connections. Payments are handled on our payment processor's secure payment page. Product files are stored privately and can be downloaded only through an order page linked to a completed payment. Access to our business accounts is restricted and protected. No method of transmission or storage is completely secure, but we take reasonable measures appropriate to the information we hold.</p>`),
      S("rights", "Your rights", `<p>Depending on where you live, you may have the right to:</p><ul><li>access the personal information we hold about you and receive a copy;</li><li>correct inaccurate information;</li><li>ask us to delete your information, unless we must keep it, for example for tax records;</li><li>restrict or object to certain processing, including processing based on legitimate interests;</li><li>receive your information in a portable format; and</li><li>withdraw consent where we rely on consent.</li></ul><p>To make a request, email ${email}. We may need to confirm your identity, for example by asking you to write from the email address used for your order. We will respond within the time required by law, normally one month. If you are in the EEA, the UK or Switzerland, you also have the right to complain to your local data protection authority.</p>`),
      S("transfers", "International transfers", `<p>${esc(site.brand)} is based in the United States, and our service providers may process information in the United States and other countries. Where personal information of people in the EEA, the UK or Switzerland is transferred to a country without an adequacy decision, we rely on appropriate safeguards, such as the European Commission's Standard Contractual Clauses or, where applicable, the provider's certification under the EU-U.S. Data Privacy Framework and its UK and Swiss extensions.</p>`),
      S("children", "Children", `<p>This website and our products are not directed to children, and we do not knowingly collect personal information from anyone under 16.</p>`),
      S("changes", "Changes to this policy", `<p>We may update this policy from time to time. The latest version will always be published on this page with its updated date.</p>`),
      S("contact", "Contact", `<p>For questions about this policy or your personal information:</p>${businessBlock(site)}`),
    ],
  });
}

export function cookies(ctx) {
  const { site } = ctx;
  const S = (id, title, html) => ({ id, title, html });
  return legalPage(ctx, {
    path: "/cookies/",
    title: "Cookie Policy",
    description: `${site.brand} does not use analytics or advertising cookies. This policy explains the browser storage the website uses.`,
    intro: `<p>This policy explains the cookies and similar technologies used on ${esc(site.domain)}. In short: we do not use analytics, advertising or tracking cookies, so there is nothing for you to opt out of.</p>`,
    sections: [
      S("ours", "Cookies we set", `<p>${esc(site.brand)} does not set any cookies on this website.</p>`),
      S("local-storage", "Local storage", `<p>To remember your cart between pages, the website stores the products you add in your browser's local storage under the name <code>worknest_cart</code>. It contains only product identifiers, stays on your device, and is not sent to us until you choose to continue to payment. It is strictly necessary to provide the cart you asked for. You can remove it by emptying your cart or clearing your browser's site data.</p>`),
      S("hosting", "Security cookies from our hosting provider", `<p>Our hosting and security provider, Cloudflare, may set strictly necessary cookies (such as <code>__cf_bm</code> or <code>cf_clearance</code>) when needed to distinguish people from automated traffic and to protect the website from abuse. These cookies do not track you across other websites.</p><table><thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead><tbody><tr><td><code>__cf_bm</code></td><td>Helps identify automated traffic (bot management)</td><td>30 minutes</td></tr><tr><td><code>cf_clearance</code></td><td>Records that a security check was passed</td><td>As set for the security check (30 minutes by default)</td></tr></tbody></table>`),
      S("payment", "Cookies on the payment page", `<p>When you continue to payment, you leave this website for our payment processor's secure payment page. That page is operated by ${esc(site.paymentProcessor.name)}, which may use its own cookies for security, fraud prevention and to complete your payment, as described in its own policies.</p>`),
      S("analytics", "Analytics and advertising", `<p>We do not use analytics, advertising, social media or other third-party tracking technologies. If this ever changes, we will update this policy first and ask for your consent where the law requires it.</p>`),
      S("control", "Managing cookies", `<p>Most browsers let you block or delete cookies and site data in their settings. Blocking strictly necessary storage may stop the cart or security checks from working.</p><p>Questions? Email <a href="mailto:${esc(site.email)}">${esc(site.email)}</a>.</p>`),
    ],
  });
}
