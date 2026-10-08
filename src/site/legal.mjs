// Legal and policy pages. They describe how this store actually works:
// - digital products only; one-time payments in USD; no subscriptions, accounts, promotions or trials
// - payment on Stripe's hosted payment page; card numbers never reach our servers
// - files delivered on an order page linked to the payment; stored privately
// - no analytics, advertising or tracking; the cart lives in the visitor's browser
// The headings follow the disclosures in Stripe's website checklist and the card network rules it cites.
import { addressLines, esc, pageHeader, tel } from "./ui.mjs";

function legalPage(ctx, { path, title, description, summary, intro = "", sections }) {
  const { site } = ctx;
  const body = `
${pageHeader({ title, crumbs: [["/", "Home"], [path, title]] })}
<div class="container">
  <article class="prose">
    <p class="updated">Last updated: ${esc(site.policiesUpdatedDisplay)}</p>
    ${intro}
    <div class="summary-box"><h2>The short version</h2><ul>${summary.map((s) => `<li>${s}</li>`).join("")}</ul></div>
    <nav class="toc" aria-label="On this page"><p>On this page</p><ol>${sections.map((s) => `<li><a href="#${s.id}">${esc(s.title.replace(/^\d+\.\s*/, ""))}</a></li>`).join("")}</ol></nav>
    ${sections.map((s) => `<section id="${s.id}"><h2>${esc(s.title)}</h2>${s.html}</section>`).join("\n")}
  </article>
</div>`;
  return { path, title, description, body };
}

const S = (id, title, html) => ({ id, title, html });
const mail = (site) => `<a href="mailto:${esc(site.email)}">${esc(site.email)}</a>`;
const phone = (site) => `<a href="tel:${esc(tel(site))}">${esc(site.phoneDisplay)}</a>`;
const operator = (site) => (site.legalName ? `${esc(site.legalName)}, doing business as ${esc(site.brand)}` : esc(site.brand));

const contactBlock = (site) => `
<table><tbody>
<tr><th scope="row">Business name</th><td>${esc(site.brand)}${site.legalName ? ` (legal name: ${esc(site.legalName)})` : ""}</td></tr>
${site.registrationNumber ? `<tr><th scope="row">Registration number</th><td>${esc(site.registrationNumber)}</td></tr>` : ""}
<tr><th scope="row">Mailing address</th><td>${esc(addressLines(site).join(", "))}</td></tr>
<tr><th scope="row">Email</th><td>${mail(site)}</td></tr>
<tr><th scope="row">Phone</th><td>${phone(site)}</td></tr>
<tr><th scope="row">Website</th><td><a href="${esc(site.url)}/">${esc(site.domain)}</a></td></tr>
</tbody></table>`;

// ---------------------------------------------------------------------------

export function terms(ctx) {
  const { site } = ctx;
  return legalPage(ctx, {
    path: "/terms/",
    title: "Terms of Service",
    description: `Terms of Service for buying digital templates from ${site.brand}: orders, USD pricing, payment, digital delivery, license, refunds and governing law.`,
    intro: `<p>These Terms of Service (the “Terms”) apply when you use ${esc(site.domain)} (the “website”) or buy a product from ${esc(site.brand)} (“${esc(site.brand)}”, “we”, “us” or “our”). Please read them before you place an order.</p>
<p class="callout">Nothing in these Terms limits any consumer rights that cannot legally be excluded.</p>`,
    summary: [
      "We sell downloadable templates (PDF, DOCX and XLSX files). Nothing physical is shipped.",
      "Prices are in US dollars. You pay once; there are no subscriptions or recurring charges.",
      "Payment is handled by Stripe. We never see or store your full card number.",
      "Your files are available to download as soon as your payment is confirmed.",
      "You may use the templates for yourself or inside your business, but not resell or share them.",
      `Faulty or not-as-described files are fixed or refunded. See the <a href="/refunds/">Refund Policy</a>.`,
    ],
    sections: [
      S("introduction", "1. Introduction", `<p>${esc(site.brand)} sells original digital productivity and organization templates. By using the website or buying a product, you agree to these Terms. If you don't agree, please don't use the website or buy from us.</p><p>These policies also apply and form part of these Terms: the <a href="/privacy/">Privacy Policy</a>, the <a href="/refunds/">Refund Policy</a>, the <a href="/delivery/">Digital Delivery Policy</a> and the <a href="/cookies/">Cookie Policy</a>.</p>`),
      S("business", "2. Business identity", `<p>The website and the products sold on it are operated by ${operator(site)}. We are based in the United States.</p>${contactBlock(site)}`),
      S("eligibility", "3. Eligibility", `<p>To place an order you must be at least 18 years old (or the age of majority where you live) and able to enter into a binding contract. If you're buying for a business, you confirm you're authorized to do so. Please give accurate contact and billing details.</p><p>We can't sell to anyone located in a country or region subject to comprehensive U.S. sanctions, or to anyone on a U.S. government restricted-party list.</p>`),
      S("products", "4. Products and digital goods", `<p>We sell downloadable digital productivity, planning, workflow and content-organization templates. Each product page describes what's included, lists every page and file, shows previews of actual pages and states the file formats (PDF, DOCX and/or XLSX). Printable PDFs are US Letter size (8.5 × 11 in).</p><p>We take care to make descriptions, previews and compatibility information accurate. If something on a product page is wrong, we'll correct it, and if it affected your purchase you're covered by the <a href="/refunds/">Refund Policy</a>.</p><p>Our products are organizational tools only. They aren't legal, accounting, tax, financial, investment, medical, employment or other professional advice, and they don't replace advice from a qualified professional.</p><h3>Legal and export restrictions</h3><p>We aren't aware of any export restrictions that apply to our templates. You're responsible for making sure that buying and using them is lawful where you are. See section 3 for the sanctions restriction.</p>`),
      S("orders", "5. Orders and payment", `<h3>Prices and currency</h3><p>All prices are shown and charged in US dollars (USD). The price that applies is the one shown at checkout before you pay. If your card is in another currency, your card issuer may convert the amount and charge its own fee.</p><h3>Sales tax</h3><p>Prices don't include sales tax. Where sales tax applies to your purchase, it's calculated from your billing details and shown on the payment page before you confirm payment.</p><h3>One-time payments only</h3><p>Every product is a one-time purchase. We don't offer subscriptions, memberships, free trials or automatic renewals, and we never add paid extras to your order.</p><h3>Promotions</h3><p>We don't currently run promotions, discount codes or trials. If we offer one in future, its terms will be shown next to the offer and will apply alongside these Terms.</p><h3>Payment methods and processing</h3><p>We accept ${esc(site.acceptedPayments.charAt(0).toLowerCase() + site.acceptedPayments.slice(1))}. Other payment methods may be offered on the payment page depending on your location and device.</p><p>Payments are processed by Stripe, our third-party payment processor. You enter your payment details on Stripe's secure payment page, and they're sent directly to Stripe over an encrypted connection. Stripe is certified as a PCI Service Provider Level 1. ${esc(site.brand)} never receives or stores your full card number.</p>${site.statementDescriptor ? `<h3>Your card statement</h3><p>Charges appear on your statement as <strong>${esc(site.statementDescriptor)}</strong>.</p>` : ""}<h3>When your order is accepted</h3><p>Your order is placed when you complete checkout and your payment is authorized. That's when the contract between you and us is formed. We may cancel or refuse an order where reasonably necessary to prevent fraud, unauthorized transactions or unlawful activity, or where a product was listed at an obviously wrong price. If we do, we'll refund any payment in full.</p>`),
      S("delivery", "6. Digital delivery", `<p>Our products are digital products. No physical goods are shipped, and there are no delivery charges.</p><p>As soon as your payment is confirmed, you're taken to your order page, which shows your order reference and lets you download each file or a ZIP of everything. Your payment receipt is emailed to the address you enter at checkout. You can return to your order page later to download your files again.</p><p>If anything goes wrong with delivery, contact us at ${mail(site)} with your order reference and we'll get your files to you. Please keep copies of the files you download. Full details are in the <a href="/delivery/">Digital Delivery Policy</a>.</p>`),
      S("license", "7. License to purchased materials", `<p>Unless a product page says otherwise, your purchase gives you a limited, non-exclusive, non-transferable license to use the purchased templates for your own personal purposes or for the internal purposes of your business, including organizing work you do for your own clients.</p><p>You may edit, adapt and print the templates for that use and keep copies on your own devices.</p><p>You may not resell, redistribute, sublicense, publish, upload for others to download, share or otherwise commercially distribute the original files or substantially similar copies, whether on their own or as part of another product.</p>`),
      S("acceptable-use", "8. Acceptable use", `<p>Use the website and our products lawfully and in a way that doesn't interfere with the website or with other people using it. Don't try to access the website's systems or other customers' orders without permission, and don't use automated tools to copy or download content in bulk.</p>`),
      S("ip", "9. Intellectual property", `<p>The ${esc(site.brand)} website, name, logo, product designs, template layouts and written content belong to ${esc(site.brand)} or are used with permission, and are protected by copyright and other laws. Software names mentioned on the website (for example, the apps that can open our files) belong to their owners and are mentioned only to describe compatibility. They don't imply any endorsement.</p><p>You may not copy, reproduce or redistribute our products except as these Terms allow.</p>`),
      S("prohibited", "10. Prohibited use", `<p>You may not use our products or the website for anything unlawful or fraudulent, to infringe anyone's rights, or for any activity prohibited by applicable law.</p><p>You may not present our templates as your own original template products, offer them for sale, or remove copyright or licensing notices from the files.</p>`),
      S("refunds", "11. Refunds", `<p>Because our products are digital goods that are delivered instantly, we don't offer refunds just because you changed your mind once your files are available to download, where the law allows. That's why we ask you to confirm this at checkout.</p><p>If a product is defective, won't download or open, is corrupted, is materially different from its description or otherwise doesn't work as described, contact us within ${site.refundReportDays} days of purchase. We'll send a corrected or replacement file or give you a full refund. We'll still consider later requests where the law gives you longer. We also refund accidental duplicate purchases.</p><p>If you have a problem with a charge, please contact us before opening a dispute with your bank. We can usually resolve it quickly, and doing so doesn't affect your right to dispute a charge.</p><p>Nothing in these Terms limits any consumer rights that cannot legally be excluded. Please read the separate <a href="/refunds/">Refund Policy</a> for the full process.</p>`),
      S("availability", "12. Product availability", `<p>We may update, change or stop selling products from time to time. If we do, you keep access to products you've already bought for as long as we're required to provide it, except where a change is necessary for legal, security or technical reasons. We may also update the website's content and correct errors at any time.</p>`),
      S("disclaimer", "13. Disclaimer", `<p>Our products are practical organizational resources. We don't promise that using a template will produce any particular business, financial, professional or personal result. You're responsible for deciding whether a template suits your circumstances, and for the information you put into it.</p><p>Except as stated in these Terms, and to the extent the law allows, the website and products are provided “as is” without other warranties. This doesn't affect your rights under consumer protection law, including your right to receive files that match their description.</p>`),
      S("liability", "14. Limitation of liability", `<p>To the fullest extent permitted by law, ${esc(site.brand)} isn't liable for indirect, incidental, special or consequential losses, or for lost profits, business or data, arising from your use of the website or products. Our total liability for any order is limited to the amount you paid for it.</p><p>Nothing in these Terms excludes or limits liability that can't legally be excluded or limited, including liability for fraud.</p>`),
      S("indemnity", "15. Indemnity where legally permitted", `<p>Where the law allows, and only if you use our products in the course of a business, you agree to cover reasonable losses and costs ${esc(site.brand)} incurs because you breached the license (section 7) or the prohibited-use rules (section 10). This section doesn't apply to consumers where consumer law doesn't permit it.</p>`),
      S("changes", "16. Changes to these terms", `<p>We may update these Terms from time to time. The current version is always on this page, with the date it was last updated. The Terms in force when you place an order apply to that order.</p>`),
      S("law", "17. Governing law", `<p>These Terms are governed by the laws of ${esc(site.governingLaw)}, without regard to its conflict-of-law rules, subject to any mandatory consumer protection rights that apply to you where you live. Any dispute that can't be resolved informally may be brought in the state or federal courts located in Alaska, unless the law where you live gives you the right to bring it in your local courts.</p>`),
      S("contact", "18. Contact information", `<p>Questions about these Terms, an order, a refund or a product? Contact us:</p>${contactBlock(site)}`),
    ],
  });
}

export function refunds(ctx) {
  const { site } = ctx;
  const days = site.refundReportDays;
  return legalPage(ctx, {
    path: "/refunds/",
    title: "Refund Policy",
    description: `${site.brand} refund, return and cancellation policy for digital templates: faulty or not-as-described files, duplicate purchases, how to ask for a refund and how long it takes.`,
    intro: `<p>${esc(site.brand)} sells digital products that are delivered electronically. This policy explains when you can get a refund, how to ask for one, and how returns and cancellations work for digital files.</p>`,
    summary: [
      `File faulty, won't open, incomplete or not as described? Tell us within ${days} days and we'll fix it or refund you in full.`,
      "Bought the same product twice by mistake? We'll refund the duplicate.",
      "Refunds go back to your original payment method, with no fees, usually within 5–10 business days.",
      "Because files are delivered instantly, we don't refund a change of mind once they're available, where the law allows.",
      `To ask, email ${mail(site)} with your order reference.`,
    ],
    sections: [
      S("refunds", "When you can get a refund", `<p>Because our products are digital goods, we can't accept ordinary physical returns. We will review refund requests, and give a refund or a working replacement, where:</p><ul><li>a purchased file is technically defective;</li><li>the download is inaccessible or corrupted;</li><li>the delivered product is materially different from its description;</li><li>you were charged more than once for the same product by mistake; or</li><li>a refund is required by applicable consumer protection law.</li></ul><p>Please contact support promptly if a file is defective, inaccessible, corrupted or materially different from its description, ideally within ${days} days of purchase. We'll still consider later requests where the law gives you longer.</p>`),
      S("change-of-mind", "Change of mind and digital fulfillment", `<p>Where permitted by applicable law, a refund may not be available once digital fulfillment has begun, because the product has already been supplied electronically. Digital fulfillment begins when your files are made available on your order page after payment. You confirm that you understand this at checkout.</p><p>If you live in a country that gives consumers a right to withdraw from online purchases (for example the European Union or the United Kingdom), that right ends once you've asked for immediate access and the files have been made available to you. If, for any reason, the files hadn't been made available, you can cancel within 14 days of purchase for a full refund.</p><p>This doesn't affect any mandatory statutory consumer rights.</p>`),
      S("how-to", "How to request a refund", `<ol><li>Email ${mail(site)} (or call ${phone(site)}).</li><li>Include your order reference, which starts with WN- and is shown on your order page, or the email address you used at checkout.</li><li>Tell us which product and file the problem is with and what you see. A screenshot helps but isn't required.</li></ol><p>We'll reply by email. If the problem can be fixed, we'll usually send a corrected file first. If it can't, or if you'd rather have your money back for a valid reason above, we'll refund you in full.</p>`),
      S("processing", "How refunds are paid", `<p>Approved refunds go back to the original payment method where technically possible. We don't charge any fee for refunds. Once we've issued a refund, it usually appears on your statement within 5 to 10 business days, depending on your bank or card issuer.</p><p>When an order is refunded, its download links stop working.</p>`),
      S("returns", "Returns", `<p>Our products are digital files, so there's nothing to send back. You don't need to return or prove deletion of a file to get a refund under this policy.</p>`),
      S("cancellations", "Cancellations", `<p>Every purchase is a one-time payment, so there's no subscription to cancel and you'll never be charged again automatically.</p><p>Orders are delivered as soon as payment is confirmed, so in most cases there's nothing left to cancel. If your payment is still processing (some payment methods take longer to confirm), you can email us to cancel the order. We'll stop it if we can, or refund it in full as soon as the payment completes.</p>`),
      S("duplicates", "Duplicate purchases", `<p>If you accidentally buy the same product more than once, contact support promptly and we'll refund the duplicate purchase.</p>`),
      S("disputes", "Problems with a charge", `<p>If you don't recognize a charge from ${esc(site.statementDescriptor || site.brand)}, or think something has gone wrong, please contact us before disputing the charge with your bank. We can usually sort it out quickly. Contacting us doesn't affect your right to dispute a charge with your card issuer.</p>`),
      S("contact", "Contact", `<p>${mail(site)}<br>${phone(site)}<br>${esc(site.brand)}<br>${esc(addressLines(site).join(", "))}</p>`),
    ],
  });
}

export function delivery(ctx) {
  const { site } = ctx;
  return legalPage(ctx, {
    path: "/delivery/",
    title: "Digital Delivery Policy",
    description: `How ${site.brand} delivers digital products: instant download after payment, no shipping, file formats, access to your files and what to do if delivery fails.`,
    intro: `<p class="callout">Products sold by ${esc(site.brand)} are digital products. No physical goods are shipped.</p>`,
    summary: [
      "Your files are ready to download as soon as your payment is confirmed.",
      "Delivery is free and works wherever our payment methods are available.",
      "Download each file separately, or everything in one ZIP.",
      `If something goes wrong, email ${mail(site)} and we'll send your files.`,
    ],
    sections: [
      S("method", "How delivery works", `<ol><li>Complete checkout on Stripe's secure payment page.</li><li>When your payment is confirmed, you're returned to your order page on this website.</li><li>Download each file, or all of them at once as a ZIP file.</li></ol><p>After a successful payment, you receive access to your purchased files through the website. Your order page shows your order reference, and your payment receipt is emailed to the address you enter at checkout.</p>`),
      S("timing", "Delivery time", `<p>Immediate. Card payments are usually confirmed within seconds, and your files are available as soon as that happens. Some payment methods take longer to confirm. If yours does, your order page will say the payment is processing and will show your downloads as soon as it's confirmed.</p>`),
      S("cost", "Delivery cost and locations", `<p>There are no shipping or delivery charges. You can buy and download our products from anywhere our payment processor's payment methods are available, except countries or regions subject to comprehensive U.S. sanctions (see section 3 of the <a href="/terms/#eligibility">Terms of Service</a>).</p>`),
      S("formats", "What you receive and what you need", `<p>Products are delivered as PDF, DOCX and/or XLSX files, as listed on each product page, plus a ZIP file with everything. Printable PDFs are US Letter size (8.5 × 11 in).</p><ul><li>PDF: opens in any web browser or PDF reader.</li><li>DOCX: opens in Microsoft Word, Google Docs, Apple Pages or LibreOffice Writer.</li><li>XLSX: opens in Microsoft Excel, Google Sheets, Apple Numbers or LibreOffice Calc.</li></ul>`),
      S("access", "Keeping access to your files", `<p>Your order page is linked to your payment, so you can go back and download your files again. We recommend bookmarking it and saving copies of your files. If you lose the link, email ${mail(site)} from the address you used at checkout, or with your order reference, and we'll send it to you again.</p><p>Download links stop working if an order is refunded.</p>`),
      S("problems", "If delivery fails", `<p>If automated delivery fails, for example if the order page doesn't load, a download won't start or a file won't open, contact support at ${mail(site)} or ${phone(site)} with your order reference. We'll send you the files or a working link. If we can't fix the problem, you're covered by our <a href="/refunds/">Refund Policy</a>.</p>`),
    ],
  });
}

export function privacy(ctx) {
  const { site } = ctx;
  const pp = site.paymentProcessor;
  return legalPage(ctx, {
    path: "/privacy/",
    title: "Privacy Policy",
    description: `How ${site.brand} collects, uses and protects personal information when you visit ${site.domain} or buy digital templates, including your US state privacy rights.`,
    intro: `<p>This policy explains what personal information ${esc(site.brand)} collects when you visit ${esc(site.domain)} or buy from us, why we use it, who we share it with, and the rights and choices you have. We collect only what we need to sell and deliver our digital products and to help you when you contact us.</p>`,
    summary: [
      "We collect your email address, order details and limited payment information when you buy.",
      "Your card details go straight to Stripe. We never see or store your full card number.",
      "No analytics, no advertising, no tracking. We don't sell or share your personal information.",
      "We don't send marketing emails.",
      `You can ask to see, correct or delete your information by emailing ${mail(site)}.`,
    ],
    sections: [
      S("controller", "Who we are", `<p>${operator(site)} is responsible for the personal information described in this policy.</p>${contactBlock(site)}`),
      S("collected", "Information we collect", `<h3>When you buy</h3><ul><li><strong>Order information:</strong> the products you buy, prices, sales tax, order reference, date and time, and the status of your payment and of any refund.</li><li><strong>Email address and name:</strong> entered on the payment page, so we can send your receipt and identify your order if you contact us.</li><li><strong>Billing details:</strong> such as your billing country and ZIP or postal code, used to process the payment and work out any sales tax.</li><li><strong>Payment-related information:</strong> you enter your card or other payment details directly on Stripe's payment page. We don't receive or store your full card number. We may receive limited details from Stripe, such as the card brand, the last four digits and the expiration date.</li><li><strong>Checkout confirmations:</strong> a record that you accepted the Terms of Service and acknowledged the digital delivery terms, with the time.</li></ul><h3>When you contact us</h3><p>Your name, email address or phone number and whatever you tell us in your message.</p><h3>When you browse the website</h3><p>Our hosting provider processes technical information needed to deliver and protect the website, such as your IP address, browser type, the pages you request and when. We don't use analytics tools, advertising networks, social media pixels or other tracking technologies.</p>`),
      S("use", "How we use your information", `<table><thead><tr><th>Purpose</th><th>Information used</th></tr></thead><tbody>
<tr><td>Processing your order, delivering your files and giving you access to your order page</td><td>Order information, email address, payment-related information</td></tr>
<tr><td>Answering questions, fixing delivery problems and handling refunds</td><td>Order and support information</td></tr>
<tr><td>Keeping tax and accounting records</td><td>Order and billing information</td></tr>
<tr><td>Preventing fraud and keeping the website and orders secure</td><td>Technical, order and payment-related information</td></tr>
<tr><td>Showing that you accepted our terms at checkout</td><td>Checkout confirmations</td></tr>
</tbody></table><p>We don't sell your personal information, share it for cross-context behavioral advertising, use it for targeted advertising or profiling, or send you marketing emails.</p><p>If you're in the European Economic Area, the United Kingdom or Switzerland, our legal bases are: performing our contract with you (orders, delivery, support), complying with legal obligations (tax records), and our legitimate interests in preventing fraud, securing our services and helping customers.</p>`),
      S("stripe", "Payments and Stripe", `<p>We use Stripe for payment, analytics, and other business services. Stripe collects identifying information about the devices that connect to its services, including via cookies and similar technologies. Stripe uses this information to operate and improve the services it provides to us, including for fraud detection, authentication, and analytics related to the performance of its services. You can learn more about Stripe and read its privacy policy at <a href="${esc(pp.privacyUrl)}" rel="noopener">https://stripe.com/privacy</a>.</p><p>Stripe collects this information on its own payment page when you pay. Our website itself doesn't load Stripe scripts or set Stripe cookies.</p>`),
      S("sharing", "Who we share information with", `<p>We share personal information only with service providers that help us run the store, and only as needed for the purposes above:</p><ul><li><strong>Stripe</strong>: payment processing, receipts and fraud prevention, as described above.</li><li><strong>Cloudflare, Inc.</strong>: website hosting, security and storage of the product files. See <a href="https://www.cloudflare.com/privacypolicy/" rel="noopener">Cloudflare's privacy policy</a>.</li><li><strong>Our email provider</strong>: sending and receiving support emails.</li><li><strong>Professional advisers and authorities</strong>: accountants, lawyers or government authorities when required by law, or to establish or defend legal claims.</li></ul><p>If our business is ever sold or transferred, customer information may be transferred as part of that transaction, subject to this policy.</p>`),
      S("retention", "How long we keep information", `<ul><li>Order, payment and tax records: as long as tax and accounting laws require (generally up to seven years).</li><li>Support emails: as long as needed to resolve your request, and normally no longer than three years after our last contact.</li><li>Technical logs: kept by our hosting provider for a limited period for security and operations.</li><li>Your cart: stays in your own browser until you remove the items, finish your purchase or clear your browser's site data.</li></ul>`),
      S("security", "Security", `<p>The whole website uses encrypted HTTPS connections. Card payments are entered on Stripe's payment page, and Stripe is certified as a PCI Service Provider Level 1. Product files are stored privately and can only be downloaded from an order page linked to a completed payment. Access to our business accounts is restricted and protected. No system is completely secure, but we take reasonable steps to protect the information we hold.</p>`),
      S("us-rights", "Your US state privacy rights", `<p>Depending on where you live (for example California, Colorado, Connecticut, Virginia, Utah, Texas, Oregon or another state with a consumer privacy law), you may have the right to:</p><ul><li>know what personal information we collect, use and disclose, and get a copy of it;</li><li>correct inaccurate personal information;</li><li>delete personal information, subject to exceptions such as tax records we must keep;</li><li>opt out of the sale or sharing of personal information, targeted advertising and profiling (we don't do any of these); and</li><li>not be treated differently for exercising your rights.</li></ul><p><strong>California residents:</strong> in the last 12 months we collected identifiers (name, email address, IP address), commercial information (products purchased) and limited payment information, from you and from Stripe, for the business purposes described in this policy. We disclosed them only to the service providers listed above. We haven't sold or shared personal information, and we don't knowingly sell or share the personal information of consumers under 16.</p><p><strong>Global Privacy Control and Do Not Track:</strong> we don't track visitors across websites. We treat a Global Privacy Control signal as a request to opt out of sale or sharing, which we already don't do.</p><p>To make a request, email ${mail(site)} or call ${phone(site)}. We'll confirm your identity (usually by asking you to write from the email address on your order) and respond within the time the law requires, normally 45 days. An authorized agent can make a request for you with your written permission. If we decline your request, you can appeal by replying to our decision.</p>`),
      S("international", "Visitors outside the United States", `<p>${esc(site.brand)} is based in the United States, and our service providers may process information in the United States and other countries. If you're in the EEA, the UK or Switzerland, you can also ask to restrict or object to processing, ask for your data in a portable format, and complain to your local data protection authority. Where personal information is transferred from those regions, our providers rely on recognized safeguards, such as the European Commission's Standard Contractual Clauses or the EU-U.S. Data Privacy Framework, where applicable.</p>`),
      S("children", "Children", `<p>The website and our products are for adults. They aren't directed to children under 13, and we don't knowingly collect personal information from children under 13 (or under 16 where local law sets a higher age). If you think a child has given us personal information, contact us and we'll delete it.</p>`),
      S("changes", "Changes to this policy", `<p>We may update this policy from time to time. The current version is always on this page with the date it was last updated. If we make a significant change, we'll make it clear on this page.</p>`),
      S("contact", "Contact", `<p>Questions or requests about your personal information:</p>${contactBlock(site)}`),
    ],
  });
}

export function cookies(ctx) {
  const { site } = ctx;
  return legalPage(ctx, {
    path: "/cookies/",
    title: "Cookie Policy",
    description: `${site.brand} doesn't use analytics, advertising or tracking cookies. This policy lists the only browser storage the website uses.`,
    intro: `<p>This policy explains the cookies and similar technologies used on ${esc(site.domain)}.</p>`,
    summary: [
      `${esc(site.brand)} doesn't set any cookies of its own.`,
      "Your cart is remembered in your browser's local storage, on your device only.",
      "Our hosting provider may set a security cookie to block automated abuse.",
      "No analytics, advertising or tracking cookies, so there's nothing to opt out of.",
    ],
    sections: [
      S("ours", "Cookies we set", `<p>${esc(site.brand)} doesn't set any cookies on this website.</p>`),
      S("local-storage", "Local storage for your cart", `<p>To remember your cart as you move between pages, the website saves the products you add in your browser's local storage, under the name <code>worknest_cart</code>. It contains only product names in code form, stays on your device and isn't sent to us unless you continue to payment. It's strictly necessary for the cart you asked for. You can clear it by emptying your cart or clearing your browser's site data.</p>`),
      S("hosting", "Security cookies from our hosting provider", `<p>Our hosting and security provider, Cloudflare, may set strictly necessary cookies when needed to tell people apart from automated traffic and protect the website from abuse. They don't track you across other websites.</p><table><thead><tr><th>Name</th><th>Purpose</th><th>Duration</th></tr></thead><tbody><tr><td><code>__cf_bm</code></td><td>Helps identify automated (bot) traffic</td><td>30 minutes</td></tr><tr><td><code>cf_clearance</code></td><td>Remembers that a security check was passed</td><td>As set for the check (30 minutes by default)</td></tr></tbody></table>`),
      S("payment", "Cookies on the payment page", `<p>When you continue to payment, you leave this website for Stripe's secure payment page. Stripe may use cookies and similar technologies there for security, fraud prevention and to complete your payment, as described in our <a href="/privacy/#stripe">Privacy Policy</a> and in <a href="${esc(site.paymentProcessor.privacyUrl)}" rel="noopener">Stripe's privacy policy</a>.</p>`),
      S("analytics", "Analytics and advertising", `<p>We don't use analytics, advertising, social media or any other third-party tracking technologies. If that ever changes, we'll update this policy first and ask for your consent where the law requires it.</p>`),
      S("control", "Managing cookies", `<p>Most browsers let you block or delete cookies and site data in their settings. Blocking strictly necessary storage may stop the cart or security checks from working. Questions? Email ${mail(site)}.</p>`),
    ],
  });
}
