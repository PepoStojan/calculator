# CalcHaven: a static calculator site you can scale to hundreds of pages

Plain Node, zero dependencies. One definition file per calculator becomes an SEO-ready page (title, meta description,
canonical, FAQ + WebApplication + Breadcrumb schema, internal links, sitemap). Everything runs in the visitor's browser,
so hosting is free and pages load fast.

## Quick start

```
node build.js            # production build  -> dist/
npm run preview          # same site with file:// friendly links -> preview/index.html (double-click it)
npm test                 # known-answer tests for every calculator
```

Before you deploy, edit `site.config.js` (site name, contact email) and build with your real domain:

```
SITE_URL=https://yourdomain.com node build.js
```

## Deploy (free)

Cloudflare Pages, Netlify or Vercel: connect the repo, build command `node build.js`, output directory `dist`,
environment variable `SITE_URL=https://yourdomain.com`. Then add the domain in Google Search Console and submit
`/sitemap.xml`. `dist/_headers` already sets long caching for hashed assets.

## What's in the box

| Path | Purpose |
|---|---|
| `src/calcs/*.js` | Calculator definitions: fields, `compute(v, H)`, article copy, FAQs, related links, keyword variants |
| `src/pages.js` | Expands each definition and its `variants` into pages |
| `src/helpers.js` | Shared math/date/format helpers (used in the browser and in tests) |
| `src/runtime.js` | Browser form engine (number, select, date, time, text, repeating rows, show/hide rules) |
| `src/custom/` | Hand-built pages: the retro 70s calculator and the scientific calculator |
| `build.js` | Generator: pages, hubs, home, 404, sitemap.xml, robots.txt |
| `scripts/analyze.py` | Turns an Ahrefs export into `src/data/keyword-map.json` and `data/backlog.csv` |
| `data/backlog.csv` | 500 uncovered calculator topics ranked by traffic potential ÷ difficulty |
| `STRATEGY.md` | What the keyword data says and what to build in which order |

## Add a calculator (about 15 minutes)

Add an object to one of the files in `src/calcs/`:

```js
{ slug: 'cd-calculator', cat: 'finance', icon: '🏦', title: 'CD Calculator', h1: '...', desc: '120-160 characters for the meta description',
  fields: [ n('amount','Deposit',10000,{pre:'$'}), n('apy','APY',4.5,{suf:'%'}), n('years','Term',2,{suf:'years'}) ],
  compute: function (v, H) { /* only use v and H: it is copied into the page */
    var fv = v.amount * Math.pow(1 + v.apy/100, v.years);
    return { res: [ { l: 'Balance at maturity', v: H.money(fv), big: 1 }, { l: 'Interest earned', v: H.money(fv - v.amount) } ] }; },
  about: '<p>...</p>', formula: '...', faqs: [['Question?','Answer.']], related: ['compound-interest-calculator'] }
```

Run `npm test`, then `node build.js`. Field types: `number`, `select`, `date` (defaults like `'today+30'`), `time`, `text`, and `rows` (repeating table rows).
`show: { id: 'mode', in: ['a','b'] }` hides a field unless another field has one of those values.
Add a `variants` array to target extra search phrases with the same engine (see `loan-calculator` → `personal-loan-calculator`).

## Monetization

Everything here is **off by default**. With nothing set, the build output has no ad slots, no consent script, no `ads.txt` and no analytics, so the live pages are unchanged. Turn features on with environment variables (in Cloudflare Pages: Settings, Variables and Secrets, Production), then redeploy.

| Variable | What it does |
|---|---|
| `ADS_CLIENT` | Ad publisher ID, e.g. `ca-pub-1234567890123456`. Enables the ad slots, the consent banner and the footer "Cookie settings" link. |
| `ADS_TXT_LINES` | Lines for `/ads.txt`, separated by newlines. Empty means no `ads.txt` file is written. |
| `CF_ANALYTICS_TOKEN` | Cloudflare Web Analytics token. Adds the cookieless beacon to every page. |

**Ad slots.** With `ADS_CLIENT` set, up to three slots appear on calculator pages only: after the tool and results table, after the About and formula section (only when the page has FAQs), and before "Related calculators". Each has an "Advertisement" label and a reserved height (250px on mobile, 280px on desktop) so the page does not jump when an ad loads. There are never ads above the tool, between the inputs and the results, or on the home, hub, 404, about, privacy and terms pages. AdSense ad units normally also need a `data-ad-slot` ID from your AdSense account: `src/consent.js` creates the `<ins>` elements, so add the ID there when you have one.

**Consent.** `src/consent.js` shows a small Accept / Decline banner and stores the choice in `localStorage`. The ad script is injected only after Accept; Decline hides the slots; the footer "Cookie settings" link reopens the banner. With only analytics configured the banner stays hidden, because Cloudflare Web Analytics sets no cookies. **This banner is a basic gate, not a legal guarantee.** Visitors from the EEA and UK who see AdSense ads require a Google-certified consent management platform (CMP) that supports the IAB TCF. Install one before serving ads to those regions, and have the privacy policy reviewed.

**Privacy policy.** When ads, analytics or any affiliate link is configured, `/privacy/` gets extra paragraphs describing them. Without them the text is unchanged.

**Affiliate box.** Add an optional `affiliate` property to any calculator definition in `src/calcs/*.js` (keyword variants inherit it):

```js
affiliate: { title: 'Product or service name', text: 'One honest sentence on why it helps with this calculation.', url: 'https://example-partner.com/?ref=you', cta: 'See the offer' }
```

It renders a "Recommended" box after the results with `rel="sponsored nofollow noopener"` and the line "We may earn a commission if you use this link." `url` must start with `https://` or the build fails. No affiliate entries ship in the repo.

To check the generated output, run `node test-build.js` (it builds with the features off and on and asserts the rules above).

## Honest SEO notes

* **Variant pages share the base article.** Each has its own title, H1, intro, meta description and an FAQ, which is a fair start, but give your best-performing variants unique copy, examples and screenshots over time. Thin, near-duplicate pages are what programmatic SEO gets penalized for.
* **Do not mass-produce state or city pages without real local data** (e.g. state mortgage pages need real property-tax and insurance data). The generator makes this easy, so the discipline has to come from you.
* The legal pages (`about`, `privacy`, `terms`) are short starter text. Have them reviewed, and update the privacy policy when you add analytics or ads.
* Health, finance and tax tools are "your money or your life" topics: keep the disclaimers, cite sources for formulas, and re-verify numbers (tax tables, limits) every year.
