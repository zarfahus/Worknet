# ClearWeek Studio (evadeclaw.com)

Storefront for **ClearWeek Studio**, which sells two downloadable planning kits:

| Product | Price | Page |
|---|---|---|
| Weekly Focus Planner | $12.99 USD, one-time | `/products/weekly-focus-planner/` |
| Project Workflow Bundle | $19.99 USD, one-time | `/products/project-workflow-bundle/` |

This folder is a **separate project**. It shares nothing with the DeskNest Studio store in the rest of this
repository: it has its own data, build, Cloudflare Pages project (`clearweek-studio`) and domain.

- Live: https://clearweek-studio.pages.dev and https://evadeclaw.com (once Cloudflare finishes the SSL certificate)
- Static HTML/CSS generated from `src/` into `dist/`. No framework, no runtime dependencies, no Functions.
- No cookies, no local storage, no analytics, no third-party requests. Fonts are self-hosted (SIL OFL).

## Current status

**Phase 1 (this folder): static store and legal pages. Done and deployed.**

Online checkout is **not** switched on (`"checkoutOpen": false` in `src/data/site.json`). Product and order pages
say so plainly, and the order button is disabled. Nothing on the site takes payment or pretends to.

**Phase 2 (not built yet): checkout and delivery.** See "What checkout must do" below. The policies already
describe how it has to behave, so the backend must match them.

## Commands

```bash
cd clearweek
npm ci
npm run build      # writes dist/ and lists anything only the owner can supply
npm run check      # build + link/anchor/policy checks over every page
CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=... npm run deploy
```

`npm run deploy` builds, checks, creates the `clearweek-studio` Pages project if needed, deploys, attaches
`evadeclaw.com` and `www.evadeclaw.com`, and creates proxied CNAME records if the token can edit the zone.
It never changes other Pages projects, and never overwrites existing DNS records.

## Where things are

| Path | What it is |
|---|---|
| `src/data/site.json` | Business details, policy settings (link lifetime, refund window, reply time), checkout switch. **Edit here.** |
| `src/data/products.json` | The two products: exact descriptions, prices, contents, files, who they're for |
| `src/data/previews.json` | Preview image list (written by `scripts/previews.py`) |
| `src/site/pages.mjs` | Home, Shop, product pages, order review, How it works, FAQ, About, Contact, Download help, 404 |
| `src/site/legal.mjs` | Terms, Delivery and Refund Policy, Privacy, Cookies, Legal Notice, Accessibility |
| `src/site/ui.mjs` | Layout, header, footer, shared pieces |
| `src/static/` | CSS, the small `site.js`, fonts, icons, product images |
| `scripts/build.mjs` | Build; refuses to build if prices or products differ from the two above, or if placeholder text appears |
| `scripts/check.mjs` | Link, anchor and per-page compliance checks |
| `scripts/deploy.mjs` | Deploy to Cloudflare Pages and connect the domain |
| `scripts/previews.py` | Renders preview images from the real product PDFs |
| `products/` | Product file generator. Planner: finished. Bundle printables, spreadsheets and setup guide: drafted, not yet reviewed (product work was paused). |

## Owner to-do before launch

Things only you can supply or decide. The site never shows blanks for these; it leaves them out.

1. **Legal name of the seller.** Who legally owns ClearWeek Studio (your name if you're a sole proprietor, or
   the company name). Add `legalName` (and `entityType`, `registrationNumber`, `taxRegistration` if they apply)
   in `src/data/site.json`. Terms, Privacy, Legal Notice and the order page pick them up automatically.
2. **Business name and domain.** The brand is ClearWeek Studio but the domain is evadeclaw.com. That's allowed,
   but Stripe and customers both look for a match. Use "ClearWeek Studio" everywhere in Stripe, and consider a
   matching domain later.
3. **Support mailbox.** `support@evadeclaw.com` is printed on every page. Make sure it receives mail, for example
   with Cloudflare Email Routing (Email › Email Routing for evadeclaw.com).
4. **Phone.** +1 (417) 354-2273 is printed on every page. Make sure it's answered or has voicemail.
5. **Commitments in the policies.** Confirm or change in `site.json`: email replies within 2 business days,
   refunds issued within 5 business days, download links valid 14 days, free new links for 24 months, and a
   full refund within 14 days for orders with no downloads.
6. **Governing law.** Set to the State of Hawaii, based on the business address. Have a lawyer review the
   Terms and policies for your situation; this is not legal advice.
7. **Taxes.** Prices are advertised as tax-inclusive (the price shown is the total). Ask a tax adviser about
   Hawaii General Excise Tax, US state sales tax on digital goods, and VAT/GST registration (the EU and UK
   require non-EU sellers of digital products to register from the first sale to consumers there). If you
   enable Stripe Tax, set the prices' tax behavior to **inclusive** so customers still pay exactly $12.99 / $19.99.
8. **EU representative.** If you'll actively sell to EU/UK consumers, ask whether you need a GDPR Article 27
   representative.
9. **Security.** Turn on two-factor authentication for Cloudflare, Stripe and the support mailbox.

## Stripe account settings that must match the site

- **Business details:** business name *ClearWeek Studio*, website `https://evadeclaw.com`, product description
  "Downloadable productivity planner and project-workflow templates (PDF and XLSX), sold as one-time digital purchases."
- **Public details:** support email `support@evadeclaw.com`, support phone `+1 417 354 2273`, support address
  1124 Mokapu Blvd, Kailua, HI 96734; Terms `https://evadeclaw.com/terms/`; Privacy `https://evadeclaw.com/privacy/`.
- **Statement descriptor:** `CLEARWEEK STUDIO` (the site tells customers to look for exactly this).
- **Checkout settings:** turn on contact information, legal policies, and a *refund* policy for digital goods
  linking to `https://evadeclaw.com/refund-policy/`.
- Don't add any product, price or currency that isn't on the site.

## What checkout must do (phase 2)

The pages already promise this behavior, so the backend has to deliver it before `checkoutOpen` is set to `true`:

- `POST /api/checkout` receives `product`, `accept_terms=yes` and `digital_consent=yes` from the order page form.
  Reject the request unless both are present. Look up the price on the server (never from the browser): 1299 or 1999
  cents, USD, `mode=payment`. Create a Stripe Checkout Session and redirect (303) to it.
- Record the consent (time, Terms version = `policiesUpdated`, both checkboxes) in the session metadata and in
  your order record.
- Verify the `checkout.session.completed` webhook signature. Only then create the order (`CW-` order number),
  the 14-day download link and the order confirmation email. The email must restate the consent to immediate
  supply (EU/UK requirement). Don't trust the success URL alone.
- Serve files from private storage (for example an R2 bucket), with expiring signed links, one ZIP plus the
  individual files, and log downloads (time, IP, user agent) for the "refund if not downloaded" rule.
- Pages for success (verified server-side), cancelled and failed payments. Link to `/download-help/`.
- Then set `"checkoutOpen": true`, rebuild and redeploy. The product JSON-LD then also marks the products in stock.

## How the pages map to Stripe's website requirements

Checked against Stripe's [website checklist](https://docs.stripe.com/get-started/checklist/website) and
[business website FAQ](https://support.stripe.com/questions/business-website-for-account-activation-faq):

| Requirement | Where |
|---|---|
| Business name, matching Stripe | Header, footer, every policy, Legal Notice |
| Clear description of goods | Home, Shop, product pages (every file and page listed, real previews) |
| Prices with explicit currency | Every price shows "USD"; tax-inclusive statement on product and order pages |
| Customer service contacts (more than a form) | Footer of every page: email, phone, address; Contact page |
| Refund and dispute policy | `/refund-policy/` (refund table, how to ask, how refunds are paid, chargebacks) |
| Cancellation policy | `/refund-policy/#cancellations`, Terms section 13 |
| Delivery/fulfillment policy | `/refund-policy/#delivery`, How it works, Terms section 7 |
| Return policy | `/refund-policy/#returns` (digital: nothing to return) |
| Legal or export restrictions | Terms section 3 (U.S. sanctions) |
| Privacy policy | `/privacy/` (GDPR, US state laws, Stripe disclosure) |
| Business address | Footer of every page, Contact, Legal Notice |
| Terms of promotions | Terms section 5: no promotions offered |
| Payment security | Order page, FAQ, Terms section 6, Privacy section 10 (Stripe, PCI DSS, HTTPS) |
| Accepted cards | Order page, FAQ, Terms |
| Card-network items | Merchant location and statement descriptor on the order page; terms accepted by an unticked checkbox |
| Accessible without a password | Yes; robots.txt allows all; sitemap.xml lists every public page |

No page claims Stripe approval or endorsement, and there are no reviews, badges, counters or urgency messages.
