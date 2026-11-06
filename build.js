#!/usr/bin/env node
/* Static site generator. Zero dependencies:  node build.js   (PREVIEW=1 appends index.html to links for file:// browsing) */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const CFG = require('./site.config.js'); CFG.url = CFG.url.replace(/\/$/, '');
/* Monetization switches (all empty by default = output identical to a plain build). */
const ADS = CFG.adsClient || '', ANALYTICS = CFG.analyticsToken || '', CONSENT = !!(ADS || ANALYTICS);
if (ADS && !/^ca-pub-[A-Za-z0-9_-]+$/.test(ADS)) throw new Error('adsClient must look like ca-pub-1234567890123456');
if (ANALYTICS && !/^[A-Za-z0-9_-]+$/.test(ANALYTICS)) throw new Error('analyticsToken may only contain letters, digits, - and _');
const SRC = path.join(__dirname, 'src'), OUT = path.join(__dirname, process.env.OUT_DIR || 'dist'), PREVIEW = process.env.PREVIEW === '1';
const read = f => fs.readFileSync(path.join(SRC, f), 'utf8');
const kmap = fs.existsSync(path.join(SRC, 'data/keyword-map.json')) ? JSON.parse(read('data/keyword-map.json')) : {};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const jsonSafe = o => JSON.stringify(o).replace(/</g, '\\u003c').split(String.fromCharCode(8232)).join('\\u2028').split(String.fromCharCode(8233)).join('\\u2029');
const TODAY = new Date().toISOString().slice(0, 10);

const CATS = {
  finance: { name: 'Finance & Loans', slug: 'finance-calculators', h1: 'Finance & Loan Calculators', app: 'FinanceApplication',
    desc: 'Free finance calculators: mortgage, loan, auto loan, compound interest, retirement, salary and tip calculators.',
    intro: 'Plan big purchases and long-term savings with calculators for mortgages, car loans, investments and pay.' },
  health: { name: 'Health & Fitness', slug: 'health-calculators', h1: 'Health & Fitness Calculators', app: 'HealthApplication',
    desc: 'Free health calculators: BMI, calories, TDEE, macros, due date, ovulation and one-rep max.',
    intro: 'Estimate your BMI, daily calories, macros, pregnancy due date and training weights.' },
  math: { name: 'Math & School', slug: 'math-calculators', h1: 'Math & School Calculators', app: 'EducationalApplication',
    desc: 'Free math calculators: scientific, grade, GPA, percentage, fraction, LCM, area, volume, ratio and statistics.',
    intro: 'Quick, accurate tools for homework, grades and everyday math, from percentages to standard deviation.' },
  life: { name: 'Date, Time & Everyday', slug: 'everyday-calculators', h1: 'Date, Time & Everyday Calculators', app: 'UtilitiesApplication',
    desc: 'Free everyday calculators: age, date, days between dates, time clock, concrete and sleep calculators.',
    intro: 'Handy calculators for dates, work hours, home projects and sleep.' }
};

const { defs, pages } = require('./src/pages.js');
const bySlug = Object.fromEntries(pages.map(p => [p.slug, p]));
if (Object.keys(bySlug).length !== pages.length) throw new Error('Duplicate slug');
for (const p of pages) for (const r of p.related || []) if (!bySlug[r]) throw new Error(p.slug + ' relates to unknown ' + r);
const metric = p => (kmap[p.slug] && kmap[p.slug].tp) || 0;

/* Ad slots: calculator pages only, never between the inputs and the results. Renders nothing unless adsClient is set.
   Each slot reserves its height up front (see .ad-slot in style.css) so a late ad cannot shift the page. */
const adSlot = n => ADS ? `<div class="ad-slot" data-ad-pos="${n}"><span class="ad-label">Advertisement</span><div class="ad-box"></div></div>` : '';

/* ---------- links (relative, so the site works on any path and from file://) ---------- */
const mkL = prefix => (slug) => slug === '' ? (PREVIEW ? prefix + 'index.html' : prefix === './' ? './' : prefix) : prefix + slug + '/' + (PREVIEW ? 'index.html' : '');
const canon = slug => CFG.url + '/' + (slug ? slug + '/' : '');

/* ---------- assets with content hashes ---------- */
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, 'assets'), { recursive: true });
const asset = (name, ext, body) => { const n = name + '.' + crypto.createHash('md5').update(body).digest('hex').slice(0, 8) + '.' + ext; fs.writeFileSync(path.join(OUT, 'assets', n), body); return n; };
const CSS = asset('style', 'css', read('style.css'));
const JS = asset('app', 'js', read('helpers.js') + '\n' + read('runtime.js'));

/* ---------- layout ---------- */
function layout({ title, desc, slug, body, ld = [], prefix, noindex, extraHead = '', extraBody = '', cur }) {
  const L = mkL(prefix), url = canon(slug);
  const nav = Object.entries(CATS).map(([k, c]) => `<a href="${L(c.slug)}"${cur === k ? ' aria-current="page"' : ''}>${esc(c.name)}</a>`).join('');
  const pop = pages.filter(p => !p.variant).sort((a, b) => metric(b) - metric(a)).slice(0, 6);
  const foot = Object.entries(CATS).map(([k, c]) => `<div><h3>${esc(c.name)}</h3>${pages.filter(p => p.cat === k && !p.variant).slice(0, 5).map(p => `<a href="${L(p.slug)}">${esc(p.title)}</a>`).join('')}<a href="${L(c.slug)}"><strong>All ${esc(c.name.toLowerCase())} →</strong></a></div>`).join('');
  return `<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="${noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website"><meta property="og:site_name" content="${esc(CFG.name)}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}">
<meta name="twitter:card" content="summary"><meta name="theme-color" content="#0f766e">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%230f766e'/%3E%3Ctext x='16' y='23' font-size='20' text-anchor='middle' fill='white' font-family='Arial' font-weight='700'%3E%3D%3C/text%3E%3C/svg%3E">
<link rel="stylesheet" href="${prefix}assets/${CSS}">${extraHead}
${ld.map(o => `<script type="application/ld+json">${jsonSafe(o)}</script>`).join('\n')}
${CFG.headScripts || ''}
</head><body>
<a class="sr" href="#main">Skip to content</a>
<header class="site"><div class="wrap"><a class="logo" href="${L('')}" aria-label="${esc(CFG.name)} home"><b>=</b>${esc(CFG.name)}</a><nav class="main" aria-label="Calculator categories">${nav}</nav></div></header>
<main id="main" class="wrap">${body}</main>
<footer class="site"><div class="wrap"><div class="cols">${foot}
<div><h3>Popular</h3>${pop.map(p => `<a href="${L(p.slug)}">${esc(p.title)}</a>`).join('')}</div>
<div><h3>${esc(CFG.name)}</h3><a href="${L('about')}">About</a><a href="${L('privacy')}">Privacy policy</a><a href="${L('terms')}">Terms of use</a></div></div>
<p class="fine">© ${new Date().getFullYear()} ${esc(CFG.name)}. Calculators provide estimates for information only and are not financial, medical or legal advice. Results may differ from those of your lender, employer or doctor.</p></div></footer>
${extraBody}</body></html>`;
}

const card = (p, L) => `<a class="card" href="${L(p.slug)}" data-q="${esc((p.title + ' ' + p.desc).toLowerCase())}"><span class="ic" aria-hidden="true">${p.icon || '🧮'}</span><span class="t">${esc(p.title)}</span><span class="d">${esc(p.desc.length > 92 ? p.desc.slice(0, 89).replace(/\s+\S*$/, '') + '…' : p.desc)}</span></a>`;
const crumbs = (items, L) => `<nav class="crumbs" aria-label="Breadcrumb">${items.map((i, k) => i.slug == null ? esc(i.name) : `<a href="${L(i.slug)}">${esc(i.name)}</a>`).join(' › ')}</nav>`;
const ldCrumbs = items => ({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((i, k) => ({ '@type': 'ListItem', position: k + 1, name: i.name, item: canon(i.slug == null ? items[k - 1] && '' : i.slug) })) });

/* ---------- calculator pages ---------- */
function relatedFor(p) {
  const seen = new Set([p.slug]), out = [], add = s => { if (bySlug[s] && !seen.has(s)) { seen.add(s); out.push(bySlug[s]); } };
  (p.related || []).forEach(add);
  pages.filter(x => x.baseSlug === p.baseSlug).forEach(x => add(x.slug));
  pages.filter(x => x.cat === p.cat && !x.variant).sort((a, b) => metric(b) - metric(a)).forEach(x => add(x.slug));
  return out.slice(0, 8);
}
function calcPage(p) {
  const L = mkL('../'), c = CATS[p.cat], faqs = p.faqs || [];
  const items = [{ name: 'Home', slug: '' }, { name: c.name, slug: c.slug }, { name: p.title, slug: p.slug }];
  const about = (p.about || '').replace(/data-link="([^"]+)"/g, (_, s) => `href="${L(s)}"`);
  let tool, extraHead = '', extraBody = '';
  if (p.custom === 'retro') { tool = `<div class="sec-tool">${read('custom/retro.html')}</div>`; extraHead = `<style>${read('custom/retro.css')}</style>`; extraBody = `<script>${read('custom/retro.js')}</script>`; }
  else if (p.custom === 'scientific') { tool = `<div class="sec-tool">${read('custom/scientific.html')}</div>`; extraHead = `<style>${read('custom/scientific.css')}</style>`; extraBody = `<script>${read('custom/sci-parser.js')}</script><script>${read('custom/scientific.js')}</script>`; }
  else {
    tool = `<section class="tool" aria-label="${esc(p.title)}"><form id="form" class="panel" novalidate autocomplete="off"></form><div class="panel sticky"><div id="results" aria-live="polite"></div></div></section><div id="table"></div>`;
    const fields = JSON.stringify(p.fields).replace(/</g, '\\u003c');
    extraBody = `<script>window.__CALC__={fields:${fields}};window.__COMPUTE__=${p.compute.toString().replace(/<\/script/gi, '<\\/script')};</script><script src="../assets/${JS}" defer></script>`;
  }
  const body = `${crumbs(items, L)}<h1>${esc(p.h1)}</h1><p class="lede">${esc(p.lede)}</p>${tool}${adSlot(1)}
<article class="content"><h2>${p.variant ? 'How this calculator works' : 'About the ' + esc(p.title.toLowerCase())}</h2>${about}
${p.formula ? `<h2>Formula</h2><p><code>${esc(p.formula)}</code></p>` : ''}
${faqs.length ? adSlot(2) : ''}${faqs.length ? `<h2>Frequently asked questions</h2>${faqs.map(f => `<h3>${esc(f[0])}</h3><p>${esc(f[1])}</p>`).join('')}` : ''}
${p.disclaimer ? `<p class="disc">${esc(p.disclaimer)}</p>` : ''}</article>${adSlot(3)}
<section aria-labelledby="rel"><h2 id="rel">Related calculators</h2><div class="grid">${relatedFor(p).map(x => card(x, L)).join('')}</div></section>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebApplication', name: p.title, url: canon(p.slug), description: p.desc, applicationCategory: c.app, operatingSystem: 'Any', browserRequirements: 'Requires JavaScript', offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' } },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((i, k) => ({ '@type': 'ListItem', position: k + 1, name: i.name, item: canon(i.slug) })) }];
  if (faqs.length) ld.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faqs.map(f => ({ '@type': 'Question', name: f[0], acceptedAnswer: { '@type': 'Answer', text: f[1] } })) });
  const title = (p.title + ' | ' + CFG.name);
  return layout({ title, desc: p.desc, slug: p.slug, body, ld, prefix: '../', extraHead, extraBody, cur: p.cat });
}

/* ---------- home, hubs, static pages ---------- */
function homePage() {
  const L = mkL('./'), uniq = pages.filter(p => !p.variant), popular = uniq.slice().sort((a, b) => metric(b) - metric(a)).slice(0, 12);
  const sections = Object.entries(CATS).map(([k, c]) => `<section class="cat" data-cat><div class="cat-h"><h2>${esc(c.name)}</h2><a href="${L(c.slug)}">View all</a></div><div class="grid">${pages.filter(p => p.cat === k).map(p => card(p, L)).join('')}</div></section>`).join('');
  const body = `<div class="hero"><h1>Free online calculators</h1><p>${esc(CFG.tagline)}. Fast, private and free: everything runs in your browser.</p>
<div class="search"><label class="sr" for="q">Search calculators</label><input id="q" type="search" placeholder="Search ${pages.length} calculators, e.g. mortgage, BMI, GPA…" autocomplete="off"></div>
<div class="pills">${Object.values(CATS).map(c => `<a href="${L(c.slug)}">${esc(c.name)}</a>`).join('')}</div></div>
<section id="popular"><div class="cat-h"><h2>Most popular</h2></div><div class="grid">${popular.map(p => card(p, L)).join('')}</div></section>
<div id="all">${sections}</div><p id="none" class="msg" hidden>No calculators match your search.</p>`;
  const script = `<script>(function(){var q=document.getElementById('q'),cards=[].slice.call(document.querySelectorAll('#all .card')),pop=document.getElementById('popular');q.addEventListener('input',function(){var t=q.value.trim().toLowerCase(),n=0;cards.forEach(function(c){var m=!t||c.dataset.q.indexOf(t)>=0;c.hidden=!m;if(m)n++});[].slice.call(document.querySelectorAll('[data-cat]')).forEach(function(s){s.hidden=!s.querySelector('.card:not([hidden])')});pop.hidden=!!t;document.getElementById('none').hidden=n>0})})();</script>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'WebSite', name: CFG.name, url: canon('') }];
  return layout({ title: `${CFG.name}: Free Online Calculators`, desc: `${CFG.tagline}. ${pages.length}+ free calculators including mortgage, BMI, GPA, percentage, date and scientific calculators.`, slug: '', body, ld, prefix: './', extraBody: script });
}
function hubPage(k) {
  const c = CATS[k], L = mkL('../'), list = pages.filter(p => p.cat === k).sort((a, b) => (a.variant - b.variant) || metric(b) - metric(a));
  const items = [{ name: 'Home', slug: '' }, { name: c.name, slug: c.slug }];
  const body = `${crumbs(items, L)}<h1>${esc(c.h1)}</h1><p class="lede">${esc(c.intro)}</p><div class="grid">${list.map(p => card(p, L)).join('')}</div>`;
  const ld = [{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: c.h1, url: canon(c.slug) }, { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items.map((i, n) => ({ '@type': 'ListItem', position: n + 1, name: i.name, item: canon(i.slug) })) }];
  return layout({ title: `${c.h1} | ${CFG.name}`, desc: c.desc, slug: c.slug, body, ld, prefix: '../', cur: k });
}
const STATIC = {
  about: ['About', `<p>${esc(CFG.name)} offers free online calculators for money, health, school and everyday tasks. Every calculator runs in your browser, so the numbers you type stay on your device.</p><p>We aim to make each tool accurate and to explain the formula behind it. Calculators give estimates only. Lenders, employers, schools and doctors may use different rules, so confirm important figures with a professional.</p><p>Found a mistake or want a calculator added? Email <a href="mailto:${esc(CFG.contactEmail)}">${esc(CFG.contactEmail)}</a>.</p>`],
  privacy: ['Privacy Policy', `<p>The values you enter into our calculators are processed locally in your browser and are not sent to our servers.</p><p>Like most sites, our hosting provider may keep standard server logs (such as IP address and pages requested) for security and reliability. If we add analytics or advertising, they may use cookies or similar technologies; we will describe them here and, where required, ask for your consent.</p><p>Questions about privacy? Contact <a href="mailto:${esc(CFG.contactEmail)}">${esc(CFG.contactEmail)}</a>.</p>`],
  terms: ['Terms of Use', `<p>${esc(CFG.name)} is provided “as is” for general information. Results are estimates and are not financial, tax, legal or medical advice. You are responsible for decisions you make using the calculators.</p><p>We do our best to keep calculations accurate but make no guarantee that they are error-free or suitable for your situation. To the extent permitted by law, ${esc(CFG.name)} is not liable for losses arising from use of the site.</p>`]
};
function staticPage(slug) {
  const [t, html] = STATIC[slug], L = mkL('../'), items = [{ name: 'Home', slug: '' }, { name: t, slug }];
  return layout({ title: `${t} | ${CFG.name}`, desc: `${t} for ${CFG.name}.`, slug, body: `${crumbs(items, L)}<h1>${t}</h1><div class="content">${html}</div>`, prefix: '../', noindex: slug !== 'about' });
}

/* ---------- write everything ---------- */
const put = (rel, html) => { const f = path.join(OUT, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, html); };
put('index.html', homePage());
for (const p of pages) put(p.slug + '/index.html', calcPage(p));
for (const k of Object.keys(CATS)) put(CATS[k].slug + '/index.html', hubPage(k));
for (const s of Object.keys(STATIC)) put(s + '/index.html', staticPage(s));
const nf = layout({ title: `Page not found | ${CFG.name}`, desc: 'Page not found.', slug: '404', prefix: '/', noindex: true, body: `<h1>Page not found</h1><p class="lede">That page does not exist. Try a calculator below.</p><div class="grid">${pages.filter(p => !p.variant).slice(0, 8).map(p => card(p, mkL('/'))).join('')}</div>` });
put('404.html', nf);
const urls = ['', ...pages.map(p => p.slug), ...Object.values(CATS).map(c => c.slug), 'about'];
put('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(u => `<url><loc>${canon(u)}</loc><lastmod>${TODAY}</lastmod></url>`).join('\n')}\n</urlset>\n`);
put('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${CFG.url}/sitemap.xml\n`);
put('_headers', `/assets/*\n  Cache-Control: public, max-age=31536000, immutable\n/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n`);

/* ---------- report ---------- */
let warn = 0;
for (const p of pages) { const t = (p.title + ' | ' + CFG.name).length; if (t > 62 || p.desc.length > 165 || p.desc.length < 70) { warn++; console.warn(`  ! ${p.slug}: title ${t}, description ${p.desc.length}`); } }
console.log(`Built ${pages.length} calculator pages (${defs.length} engines + ${pages.length - defs.length} keyword variants), ${Object.keys(CATS).length} category hubs, home, 404, sitemap. ${warn} SEO warnings.`);
if (CFG.url.includes('example.com')) console.log('Note: set SITE_URL (or edit site.config.js) before deploying so canonicals and the sitemap point at your domain.');
