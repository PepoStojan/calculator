/* Opens every built page in Chromium (build with PREVIEW=1 first), reports console errors and empty results. */
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => {
  const dist = path.resolve(__dirname, '../dist'), dirs = fs.readdirSync(dist).filter(d => fs.existsSync(path.join(dist, d, 'index.html')));
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1100, height: 900 } }); let bad = 0, errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  for (const d of ['', ...dirs]) {
    errs = []; await p.goto('file://' + path.join(dist, d, 'index.html')); await p.waitForTimeout(60);
    const info = await p.evaluate(() => ({ h1: (document.querySelector('h1') || {}).textContent, res: (document.getElementById('results') || { children: { length: -1 } }).children.length, msg: !!document.querySelector('#results .msg'), scrollX: document.documentElement.scrollWidth > innerWidth + 1 }));
    const problem = errs.length || info.res === 0 || info.msg || !info.h1;
    if (problem) { bad++; console.log('PROBLEM', d || 'home', JSON.stringify(info), errs.join(' | ')); }
  }
  console.log('checked', dirs.length + 1, 'pages;', bad, 'with problems'); await b.close(); process.exit(bad ? 1 : 0);
})();
