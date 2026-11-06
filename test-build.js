#!/usr/bin/env node
/* Build-output checks for the monetization options:  node test-build.js
   Builds twice (everything off, everything on) into preview/ and asserts the placement and gating rules. */
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = __dirname; let fail = 0;
const ok = (c, m) => { if (!c) { fail++; console.log('FAIL:', m); } };
const build = (dir, env) => execFileSync(process.execPath, ['build.js'], { cwd: ROOT, env: Object.assign({ PATH: process.env.PATH, SITE_URL: 'https://test.invalid', OUT_DIR: 'preview/' + dir }, env), stdio: 'pipe' });
const walk = d => fs.readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]);
const html = d => walk(path.join(ROOT, 'preview', d)).filter(f => f.endsWith('.html'));
const rel = (d, f) => path.relative(path.join(ROOT, 'preview', d), f);
const count = (s, re) => (s.match(re) || []).length;

/* ---- everything off ---- */
build('tb-off', {});
let all = html('tb-off').map(f => fs.readFileSync(f, 'utf8')).join('\n');
ok(!/Advertisement|ad-slot/.test(all), 'off: no ad markup');
ok(!/assets\/consent\.|__CONSENT__|data-cookie-settings|Cookie settings|adsbygoogle|googlesyndication|cloudflareinsights/.test(all), 'off: no consent script, ad or analytics references');
ok(!fs.existsSync(path.join(ROOT, 'preview/tb-off/ads.txt')), 'off: no ads.txt');
ok(!walk(path.join(ROOT, 'preview/tb-off/assets')).some(f => /consent/.test(f)), 'off: no consent asset');

/* ---- everything on ---- */
build('tb-on', { ADS_CLIENT: 'ca-pub-TEST', ADS_TXT_LINES: 'google.com, pub-TEST, DIRECT, f08c47fec0942fa0', CF_ANALYTICS_TOKEN: 'TEST' });
const slugs = JSON.parse(JSON.stringify(require('./src/pages.js').pages.map(p => p.slug)));
const files = html('tb-on'); let calcWithSlots = 0;
for (const f of files) {
  const r = rel('tb-on', f), s = fs.readFileSync(f, 'utf8'), n = count(s, /class="ad-slot"/g), isCalc = slugs.includes(r.split(path.sep)[0]);
  ok(/cloudflareinsights\.com\/beacon\.min\.js/.test(s), 'on: analytics beacon on ' + r);
  ok(/assets\/consent\.[0-9a-f]+\.js/.test(s), 'on: consent script on ' + r);
  ok(!/<script[^>]*src=[^>]*googlesyndication/.test(s) && !/<ins /.test(s), 'on: ad script/units are not in the HTML (loaded only after consent) on ' + r);
  if (!isCalc) { ok(n === 0, 'on: no ad slots on non-calculator page ' + r); continue; }
  calcWithSlots++;
  ok(n >= 2 && n <= 3, 'on: 2-3 slots on ' + r + ' (got ' + n + ')');
  const pos = [...s.matchAll(/data-ad-pos="(\d)"/g)].map(m => ({ n: +m[1], i: m.index }));
  const iForm = s.search(/id="form"|class="sec-tool"/), iRes = s.search(/id="table"|class="sec-tool"/), iRel = s.indexOf('id="rel"');
  ok(pos.every(p => p.i > iRes), 'on: no slot before the tool and results on ' + r);
  ok(pos.every(p => p.i < iRel), 'on: every slot is above Related calculators on ' + r);
  ok(pos[0].n === 1 && pos[pos.length - 1].n === 3, 'on: slot 1 first and slot 3 last on ' + r);
  ok(count(s, />Advertisement</g) === n, 'on: every slot has a visible label on ' + r);
  void iForm;
}
ok(calcWithSlots === slugs.length, 'on: all ' + slugs.length + ' calculator pages checked (' + calcWithSlots + ')');
ok(fs.readFileSync(path.join(ROOT, 'preview/tb-on/ads.txt'), 'utf8') === 'google.com, pub-TEST, DIRECT, f08c47fec0942fa0\n', 'on: ads.txt content');
const priv = fs.readFileSync(path.join(ROOT, 'preview/tb-on/privacy/index.html'), 'utf8');
ok(/Advertising/.test(priv) && /Analytics/.test(priv), 'on: privacy page describes ads and analytics');
ok(/Cookie settings/.test(fs.readFileSync(path.join(ROOT, 'preview/tb-on/index.html'), 'utf8')), 'on: footer Cookie settings link');
const cj = fs.readFileSync(walk(path.join(ROOT, 'preview/tb-on/assets')).find(f => /consent/.test(f)), 'utf8');
ok(cj.indexOf('googlesyndication') > cj.indexOf('function loadAds') && /choice === 'yes'/.test(cj), 'on: ad script is injected from loadAds(), which runs only on "yes"');

/* ---- bad config is rejected ---- */
let threw = false; try { build('tb-bad', { ADS_CLIENT: 'not valid' }); } catch (e) { threw = true; } ok(threw, 'bad ADS_CLIENT fails the build');

console.log(fail ? fail + ' FAILED' : 'Build-output checks passed (' + files.length + ' pages, ' + calcWithSlots + ' calculator pages with slots)');
process.exit(fail ? 1 : 0);
